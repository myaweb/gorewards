import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { CardOptimizationEngine } from '@/lib/services/cardOptimizationEngine'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import OptimizationReportEmail from '@/emails/OptimizationReportEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://creditrich.net'

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const email = user.emailAddresses[0]?.emailAddress
    const firstName = user.firstName || 'there'

    if (!email) {
      return NextResponse.json({ error: 'No email address found' }, { status: 400 })
    }

    // Get user from DB
    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if profile is complete
    const profile = await prisma.userProfile.findUnique({
      where: { userId: dbUser.id },
    })

    if (!profile || !profile.isComplete) {
      return NextResponse.json(
        {
          error: 'profile_incomplete',
          message: 'Please complete your spending profile first to receive an optimization report.',
        },
        { status: 400 }
      )
    }

    // Check if user has cards
    const cardCount = await prisma.userCard.count({
      where: { userId: dbUser.id, isActive: true },
    })

    if (cardCount === 0) {
      return NextResponse.json(
        {
          error: 'no_cards',
          message: 'Please add at least one card to your portfolio first.',
        },
        { status: 400 }
      )
    }

    // Build spending profile from DB
    const spendingProfile = {
      grocery: Number(profile.monthlyGrocery),
      gas: Number(profile.monthlyGas),
      dining: Number(profile.monthlyDining),
      bills: Number(profile.monthlyBills),
      travel: Number(profile.monthlyTravel),
      shopping: Number(profile.monthlyShopping),
      entertainment: 0,
      utilities: 0,
      other: Number(profile.monthlyOther),
    }

    // Run optimization engine
    const result = await CardOptimizationEngine.calculateBestCardPerCategory(
      user.id,
      spendingProfile
    )

    // Map to email format
    const optimizations = result.optimizations.map((opt) => ({
      category: opt.category,
      recommendedCard: opt.recommendedCard.name,
      bank: opt.recommendedCard.bank,
      multiplier: opt.multiplier,
      monthlySpending: opt.monthlySpending,
      monthlyRewards: opt.monthlyRewards,
      yearlyRewards: opt.yearlyRewards,
      explanation: opt.explanation,
    }))

    // Render email
    const emailHtml = await render(
      OptimizationReportEmail({
        userName: firstName,
        userEmail: email,
        optimizations,
        totalMonthlyRewards: result.totalMonthlyRewards,
        totalYearlyRewards: result.totalYearlyRewards,
        bestOverallCard: result.summary.bestOverallCard?.name ?? null,
        dashboardUrl: `${BASE_URL}/dashboard`,
        optimizationUrl: `${BASE_URL}/dashboard/optimization`,
      })
    )

    // Send email
    const { error: sendError } = await resend.emails.send({
      from: 'CreditRich <onboarding@resend.dev>',
      to: email,
      subject: `Your Card Optimization Report — $${(result.totalMonthlyRewards / 100).toFixed(2)}/month in rewards`,
      html: emailHtml,
    })

    if (sendError) {
      console.error('Resend error:', sendError)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Optimization report sent to ${email}`,
      stats: {
        categories: result.optimizations.length,
        monthlyRewards: result.totalMonthlyRewards,
        yearlyRewards: result.totalYearlyRewards,
      },
    })
  } catch (error) {
    console.error('Optimization report error:', error)
    return NextResponse.json(
      { error: 'Failed to generate optimization report' },
      { status: 500 }
    )
  }
}
