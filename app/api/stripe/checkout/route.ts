import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/stripe/checkout
 * 
 * Creates a one-time donation checkout session.
 * Accepts { amount: number } in request body (5, 15, or 50 CAD).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const amount = body.amount || 15 // Default $15 CAD

    // Validate amount
    const validAmounts = [5, 15, 50]
    if (!validAmounts.includes(amount)) {
      return NextResponse.json({ error: 'Invalid donation amount' }, { status: 400 })
    }

    // Find or create user
    let dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkUserId: user.id,
          email: user.emailAddresses[0].emailAddress,
        },
      })
    }

    // Create one-time payment checkout session
    const session = await stripe.checkout.sessions.create({
      customer: dbUser.stripeCustomerId || undefined,
      customer_email: dbUser.stripeCustomerId ? undefined : dbUser.email,
      client_reference_id: user.id,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'CreditRich Donation',
              description: `Thank you for supporting CreditRich with a $${amount} CAD donation`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/donate?donated=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/donate?canceled=true`,
      metadata: {
        clerkUserId: user.id,
        type: 'donation',
        amount: amount.toString(),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
