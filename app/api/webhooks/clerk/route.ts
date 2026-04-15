import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import WelcomeEmail from '@/emails/WelcomeEmail'

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

type ClerkWebhookEvent = {
  type: string
  data: {
    id: string
    email_addresses: Array<{
      email_address: string
      id: string
    }>
    first_name?: string
    last_name?: string
    username?: string
  }
}

/**
 * Send welcome email to new user
 */
async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  clerkUserId: string
): Promise<boolean> {
  try {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://GoRewards.ca'}/users`

    const emailHtml = await render(
      WelcomeEmail({
        userName,
        userEmail,
        dashboardUrl,
      })
    )

    const result = await resend.emails.send({
      from: 'Rewards Roadmap <onboarding@resend.dev>', // Update with your verified domain
      to: userEmail,
      subject: '🎉 Welcome to Rewards Roadmap - Start Optimizing Today',
      html: emailHtml,
    })

    if (result.error) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}

/**
 * Clerk webhook handler
 */
export async function POST(request: NextRequest) {
  // Get webhook secret from environment
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  // Get headers
  const headerPayload = headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    )
  }

  // Get the body
  const payload = await request.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret)

  let evt: ClerkWebhookEvent

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    try {
      const { id: clerkUserId, email_addresses, first_name, last_name, username } = evt.data

      // Get primary email
      const primaryEmail = email_addresses[0]?.email_address

      if (!primaryEmail) {
        return NextResponse.json(
          { error: 'No email found' },
          { status: 400 }
        )
      }

      // Create user in database
      const user = await prisma.user.upsert({
        where: { clerkUserId },
        update: {
          email: primaryEmail,
        },
        create: {
          clerkUserId,
          email: primaryEmail,
        },
      })

      // Send welcome email if Resend is configured
      if (process.env.RESEND_API_KEY) {
        const userName = first_name || username || primaryEmail.split('@')[0] || 'Valued Member'
        await sendWelcomeEmail(primaryEmail, userName, clerkUserId)
      }

      return NextResponse.json({
        success: true,
        message: 'User created and welcome email sent',
        userId: user.id,
      })
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  }

  // Handle other event types if needed
  return NextResponse.json({
    success: true,
    message: 'Webhook received',
  })
}

