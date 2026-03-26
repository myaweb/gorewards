import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { securityLogger } from '@/lib/services/securityLogger'
import Stripe from 'stripe'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const correlationId = crypto.randomBytes(16).toString('hex')
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    await securityLogger.logSecurityViolation({
      type: 'WEBHOOK_VERIFICATION_FAILURE',
      severity: 'HIGH',
      description: 'Stripe webhook received without signature',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      endpoint: '/api/webhooks/stripe',
      correlationId
    })

    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    await securityLogger.logSecurityViolation({
      type: 'WEBHOOK_VERIFICATION_FAILURE',
      severity: 'HIGH',
      description: 'Stripe webhook signature verification failed',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      endpoint: '/api/webhooks/stripe',
      correlationId,
      metadata: {
        error: (error as Error).message
      }
    })

    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Log webhook received
  securityLogger.logInfo('Stripe webhook received', {
    eventType: event.type,
    eventId: event.id,
    correlationId
  })

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const clerkUserId = session.client_reference_id || session.metadata?.clerkUserId

        if (!clerkUserId) {
          securityLogger.logWarn('Stripe checkout session missing clerk user ID', {
            sessionId: session.id,
            correlationId
          })
          break
        }

        // Update user with Stripe customer ID and subscription
        await prisma.user.update({
          where: { clerkUserId },
          data: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            isPremium: true,
          },
        })

        // Log premium upgrade
        await securityLogger.logAuditEvent({
          userId: clerkUserId,
          action: 'PREMIUM_UPGRADE',
          resource: 'user_subscription',
          resourceId: session.subscription as string,
          ipAddress: req.headers.get('x-forwarded-for') || 'stripe',
          endpoint: '/api/webhooks/stripe',
          method: 'POST',
          correlationId,
          severity: 'INFO',
          category: 'DATA_MODIFICATION',
          newData: {
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            isPremium: true,
            event: 'premium_trial_converted'
          }
        })

        // Track premium conversion to PostHog
        try {
          const { trackServerEvent } = await import('@/lib/services/analytics')
          await trackServerEvent({
            name: 'premium_trial_converted',
            properties: {
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              plan: 'premium',
              amount: 9,
              currency: 'CAD',
              timestamp: new Date().toISOString()
            },
            distinctId: clerkUserId
          })
        } catch (analyticsError) {
          // Silent failure - don't break webhook
          console.warn('Failed to track premium conversion:', analyticsError)
        }

        console.log(`✅ User ${clerkUserId} upgraded to premium`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Find user by Stripe subscription ID
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
          select: { clerkUserId: true }
        })

        // Downgrade user
        const updatedUsers = await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            isPremium: false,
            stripeSubscriptionId: null,
          },
        })

        // Log subscription cancellation
        await securityLogger.logAuditEvent({
          action: 'SUBSCRIPTION_CANCELLED',
          resource: 'user_subscription',
          resourceId: subscription.id,
          ipAddress: req.headers.get('x-forwarded-for') || 'stripe',
          endpoint: '/api/webhooks/stripe',
          method: 'POST',
          correlationId,
          severity: 'INFO',
          category: 'DATA_MODIFICATION',
          newData: {
            subscriptionId: subscription.id,
            usersAffected: updatedUsers.count
          }
        })

        // Track subscription cancellation to PostHog
        if (user?.clerkUserId) {
          try {
            const { trackServerEvent } = await import('@/lib/services/analytics')
            await trackServerEvent({
              name: 'premium_subscription_cancelled',
              properties: {
                stripe_subscription_id: subscription.id,
                timestamp: new Date().toISOString()
              },
              distinctId: user.clerkUserId
            })
          } catch (analyticsError) {
            console.warn('Failed to track subscription cancellation:', analyticsError)
          }
        }

        console.log(`❌ Subscription ${subscription.id} canceled`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        // Update premium status based on subscription status
        const isPremium = subscription.status === 'active' || subscription.status === 'trialing'

        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { isPremium },
        })

        // Log subscription update
        await securityLogger.logAuditEvent({
          action: 'SUBSCRIPTION_UPDATED',
          resource: 'user_subscription',
          resourceId: subscription.id,
          ipAddress: req.headers.get('x-forwarded-for') || 'stripe',
          endpoint: '/api/webhooks/stripe',
          method: 'POST',
          correlationId,
          severity: 'INFO',
          category: 'DATA_MODIFICATION',
          newData: {
            subscriptionId: subscription.id,
            status: subscription.status,
            isPremium
          }
        })

        console.log(`🔄 Subscription ${subscription.id} updated: ${subscription.status}`)
        break
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription

        // Find user for notification purposes
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
          select: { clerkUserId: true, email: true }
        })

        // Log trial ending soon
        await securityLogger.logAuditEvent({
          action: 'TRIAL_ENDING_SOON',
          resource: 'user_subscription',
          resourceId: subscription.id,
          ipAddress: req.headers.get('x-forwarded-for') || 'stripe',
          endpoint: '/api/webhooks/stripe',
          method: 'POST',
          correlationId,
          severity: 'INFO',
          category: 'DATA_MODIFICATION',
          newData: {
            subscriptionId: subscription.id,
            trialEnd: subscription.trial_end,
            userEmail: user?.email
          }
        })

        console.log(`⏰ Trial ending soon for subscription ${subscription.id}`)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    securityLogger.logError('Webhook handler error', error as Error, {
      eventType: event.type,
      eventId: event.id,
      correlationId
    })

    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
