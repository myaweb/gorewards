import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

interface DashboardInsight {
  type: 'warning' | 'success' | 'info' | 'tip'
  icon: 'alert' | 'sparkles' | 'target' | 'trending'
  title: string
  message: string
  priority: number
}

/**
 * GET /api/ai/dashboard-insights
 * 
 * Generate personalized AI insights for dashboard
 */
export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        userProfile: true,
        userCards: {
          where: { isActive: true },
          include: {
            card: {
              include: {
                multipliers: { where: { isActive: true } }
              }
            },
            bonusProgresses: {
              where: { isCompleted: false }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    const insights: DashboardInsight[] = []

    // INSIGHT 1: Bonus deadline warnings
    const urgentBonuses = user.userCards.flatMap(uc => 
      uc.bonusProgresses
        .filter(bp => {
          const daysLeft = Math.ceil((new Date(bp.bonusDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          return daysLeft > 0 && daysLeft <= 60
        })
        .map(bp => ({
          cardName: uc.card.name,
          daysLeft: Math.ceil((new Date(bp.bonusDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          remaining: Number(bp.requiredSpend) - Number(bp.currentSpend),
          progress: (Number(bp.currentSpend) / Number(bp.requiredSpend)) * 100
        }))
    )

    if (urgentBonuses.length > 0) {
      const mostUrgent = urgentBonuses.sort((a, b) => a.daysLeft - b.daysLeft)[0]
      
      if (mostUrgent.daysLeft <= 30) {
        insights.push({
          type: 'warning',
          icon: 'alert',
          title: 'Welcome bonus deadline approaching',
          message: `Your ${mostUrgent.cardName} needs $${mostUrgent.remaining.toFixed(0)} more spend in ${mostUrgent.daysLeft} days. ${
            mostUrgent.progress >= 70 
              ? "You're on track based on your current progress!" 
              : "Consider accelerating your spending to meet the deadline."
          }`,
          priority: 10
        })
      } else {
        insights.push({
          type: 'info',
          icon: 'target',
          title: 'Bonus progress update',
          message: `Your ${mostUrgent.cardName} bonus is ${mostUrgent.progress.toFixed(0)}% complete. ${mostUrgent.daysLeft} days remaining to spend $${mostUrgent.remaining.toFixed(0)}.`,
          priority: 5
        })
      }
    }

    // INSIGHT 2: Missing profile data
    if (!user.userProfile || Number(user.userProfile.monthlyGrocery) === 0) {
      insights.push({
        type: 'tip',
        icon: 'sparkles',
        title: 'Complete your spending profile',
        message: 'Add your monthly spending to unlock personalized card recommendations and see which card earns the most for each category.',
        priority: 8
      })
    }

    // INSIGHT 3: No cards in portfolio
    if (user.userCards.length === 0) {
      insights.push({
        type: 'tip',
        icon: 'target',
        title: 'Build your card portfolio',
        message: 'Add your current credit cards to track welcome bonuses, monitor annual fees, and get optimization recommendations.',
        priority: 9
      })
    }

    // INSIGHT 4: Optimization opportunity (if profile exists and has cards)
    if (user.userProfile && user.userCards.length > 0) {
      const profile = user.userProfile
      const grocerySpend = Number(profile.monthlyGrocery)
      
      // Check if user has a good grocery card
      const hasGoodGroceryCard = user.userCards.some(uc => 
        uc.card.multipliers.some(m => 
          m.category === 'GROCERY' && Number(m.multiplierValue) >= 4
        )
      )

      if (grocerySpend > 500 && !hasGoodGroceryCard) {
        const potentialEarnings = (grocerySpend * 12 * 0.05).toFixed(0) // 5% back
        insights.push({
          type: 'tip',
          icon: 'trending',
          title: "You're leaving money on the table",
          message: `With $${grocerySpend}/month on groceries, a 5x card like Amex Cobalt could earn you $${potentialEarnings} more per year.`,
          priority: 7
        })
      }
    }

    // INSIGHT 5: Annual fee coming up
    const upcomingFees = user.userCards.filter(uc => {
      if (!uc.annualFeeDate) return false
      const daysUntil = Math.ceil((new Date(uc.annualFeeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return daysUntil > 0 && daysUntil <= 60
    })

    if (upcomingFees.length > 0) {
      const nextFee = upcomingFees[0]
      const daysUntil = Math.ceil((new Date(nextFee.annualFeeDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      
      insights.push({
        type: 'info',
        icon: 'alert',
        title: 'Annual fee reminder',
        message: `${nextFee.card.name} annual fee ($${Number(nextFee.card.annualFee)}) is due in ${daysUntil} days. Check your card portfolio for value analysis.`,
        priority: 6
      })
    }

    // Sort by priority and return top 3
    const topInsights = insights
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3)

    return NextResponse.json({
      success: true,
      data: topInsights,
      count: topInsights.length
    })

  } catch (error) {
    console.error('Dashboard insights error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
