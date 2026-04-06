import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { EnhancedRecommendationEngine } from '@/lib/services/enhancedRecommendationEngine'
import { UserProfileService } from '@/lib/services/userProfileService'
import { CreditScoreRange } from '@/lib/types/recommendation'

/**
 * POST /api/recommend/profile
 * 
 * Generate recommendations based on user's persistent profile
 * Falls back to form data if no profile exists
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    const body = await request.json()
    
    let userProfile
    let ownedCards: string[] = []
    
    if (userId) {
      // Get user's persistent profile
      const profileData = await UserProfileService.getProfileWithDetails(userId)
      
      if (profileData && profileData.profile.isComplete) {
        // Use persistent profile
        const profile = profileData.profile
        
        userProfile = {
          spending: {
            grocery: Number(profile.monthlyGrocery || 0),
            gas: Number(profile.monthlyGas || 0),
            dining: Number(profile.monthlyDining || 0),
            bills: Number(profile.monthlyBills || 0),
            travel: Number(profile.monthlyTravel || 0),
            shopping: Number(profile.monthlyShopping || 0),
            other: Number(profile.monthlyOther || 0)
          },
          creditScore: profile.creditScoreRange || CreditScoreRange.GOOD,
          annualIncome: profile.annualIncome ? Number(profile.annualIncome) : undefined,
          preferredPointTypes: profile.preferredRewardType ? [profile.preferredRewardType] : [],
          maxAnnualFee: profile.maxAnnualFee ? Number(profile.maxAnnualFee) : undefined,
          prioritizeSignupBonus: profile.prioritizeSignupBonus,
          timeHorizon: profile.timeHorizon as 'SHORT_TERM' | 'LONG_TERM'
        }
        
        // Get owned cards to exclude from recommendations
        ownedCards = profileData.userCards
          .filter(card => card.isActive)
          .map(card => card.cardId)
      }
    }
    
    // Fall back to form data if no persistent profile
    if (!userProfile) {
      userProfile = {
        spending: {
          grocery: body.grocery || 0,
          gas: body.gas || 0,
          dining: body.dining || 0,
          bills: body.bills || 0,
          travel: body.travel || 0,
          shopping: body.shopping || 0,
          other: body.other || 0
        },
        creditScore: body.creditScore || CreditScoreRange.GOOD,
        annualIncome: body.annualIncome,
        preferredPointTypes: body.preferredPointTypes || [],
        maxAnnualFee: body.maxAnnualFee,
        prioritizeSignupBonus: body.prioritizeSignupBonus !== false,
        timeHorizon: body.timeHorizon || 'LONG_TERM'
      }
    }
    
    // Generate recommendations
    const result = await EnhancedRecommendationEngine.getRecommendations(userProfile)
    
    // Filter out owned cards if user is authenticated
    if (ownedCards.length > 0) {
      result.recommendations = result.recommendations.filter(
        rec => !ownedCards.includes(rec.card.id)
      )
      
      // Re-rank after filtering
      result.recommendations = result.recommendations.map((rec, index) => ({
        ...rec,
        rank: index + 1
      }))
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...result,
        context: {
          usedPersistentProfile: !!userId && !!userProfile,
          excludedOwnedCards: ownedCards.length,
          isAuthenticated: !!userId
        }
      },
      message: `Generated ${result.recommendations.length} personalized recommendations`
    })
    
  } catch (error) {
    console.error('Profile-based recommendation error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * GET /api/recommend/profile
 * 
 * Get user's profile-based recommendation context
 */
export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({
        success: true,
        data: {
          hasProfile: false,
          isAuthenticated: false,
          message: 'Sign in to save your profile and get personalized recommendations'
        }
      })
    }
    
    const profileData = await UserProfileService.getProfileWithDetails(userId)
    
    if (!profileData) {
      return NextResponse.json({
        success: true,
        data: {
          hasProfile: false,
          isAuthenticated: true,
          message: 'Complete your profile to get personalized recommendations'
        }
      })
    }
    
    const profile = profileData.profile
    const ownedCards = profileData.userCards.filter(card => card.isActive)
    const activeBonuses = profileData.bonusProgress.filter(
      progress => !progress.isCompleted && progress.bonusDeadline > new Date()
    )
    
    const totalMonthlySpending = 
      Number(profile.monthlyGrocery || 0) +
      Number(profile.monthlyGas || 0) +
      Number(profile.monthlyDining || 0) +
      Number(profile.monthlyBills || 0) +
      Number(profile.monthlyTravel || 0) +
      Number(profile.monthlyShopping || 0) +
      Number(profile.monthlyOther || 0)
    
    return NextResponse.json({
      success: true,
      data: {
        hasProfile: profile.isComplete,
        isAuthenticated: true,
        profile: {
          creditScore: profile.creditScoreRange,
          preferredRewardType: profile.preferredRewardType,
          totalMonthlySpending,
          maxAnnualFee: profile.maxAnnualFee ? Number(profile.maxAnnualFee) : null
        },
        portfolio: {
          ownedCards: ownedCards.length,
          activeBonuses: activeBonuses.length,
          totalBonusProgress: activeBonuses.reduce(
            (sum, bonus) => sum + Number(bonus.currentSpend || 0), 0
          )
        },
        lastUpdated: profile.updatedAt
      }
    })
    
  } catch (error) {
    console.error('Error fetching profile context:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch profile context'
    }, { status: 500 })
  }
}
