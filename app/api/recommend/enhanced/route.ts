import { NextRequest, NextResponse } from 'next/server'
import { EnhancedRecommendationEngine } from '@/lib/services/enhancedRecommendationEngine'
import { UserProfileSchema, CreditScoreRange } from '@/lib/types/recommendation'
import { z } from 'zod'

/**
 * POST /api/recommend/enhanced
 * 
 * Enhanced credit card recommendation API with production-grade scoring
 * 
 * Features:
 * - Signup bonus spend requirement analysis
 * - Point valuation by type (Aeroplan, MR, Cashback, etc.)
 * - Approval probability scoring
 * - Category spending caps
 * - First-year vs long-term value analysis
 * - Detailed explanations and breakdowns
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate and parse user profile
    const userProfile = UserProfileSchema.parse(body)
    
    // Generate recommendations
    const result = await EnhancedRecommendationEngine.getRecommendations(userProfile)
    
    return NextResponse.json({
      success: true,
      data: result,
      message: `Generated ${result.recommendations.length} personalized recommendations`
    })
    
  } catch (error) {
    console.error('Enhanced recommendation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid user profile data',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * GET /api/recommend/enhanced
 * 
 * Returns API documentation and example usage
 */
export async function GET() {
  const exampleRequest = {
    spending: {
      grocery: 800,
      gas: 200,
      dining: 400,
      bills: 150,
      travel: 100,
      shopping: 200
    },
    creditScore: CreditScoreRange.GOOD,
    annualIncome: 75000,
    preferredPointTypes: ['AEROPLAN', 'CASHBACK'],
    maxAnnualFee: 200,
    prioritizeSignupBonus: true,
    timeHorizon: 'LONG_TERM'
  }
  
  const exampleResponse = {
    success: true,
    data: {
      recommendations: [
        {
          card: {
            id: "card-id",
            name: "Example Card",
            bank: "Example Bank",
            network: "Visa",
            annualFee: 120
          },
          scores: {
            expectedYearlyValue: 850,
            approvalProbability: 0.85,
            signupBonusValue: 450,
            yearlySpendRewards: 520,
            longTermValue: 400
          },
          breakdown: {
            signupBonus: {
              points: 45000,
              pointType: "AEROPLAN",
              valueInCents: 54000,
              requiredSpend: 3000,
              spendPeriodMonths: 3,
              achievable: true
            },
            categoryRewards: [
              {
                category: "grocery",
                annualSpend: 9600,
                multiplier: 2.0,
                points: 19200,
                valueInCents: 23040
              }
            ],
            totalAnnualRewards: 520,
            netFirstYearValue: 850,
            netLongTermValue: 400
          },
          explanation: {
            whyRecommended: "Excellent first-year value with achievable signup bonus",
            pros: ["High approval probability", "2x points on grocery"],
            cons: ["Annual fee of $120"],
            bestFor: ["Grocery spending", "Travel rewards"]
          },
          rank: 1,
          confidence: 92
        }
      ],
      userProfile: exampleRequest,
      metadata: {
        totalCardsEvaluated: 31,
        timestamp: "2026-03-12T15:00:00.000Z",
        version: "2.0.0"
      }
    }
  }
  
  return NextResponse.json({
    title: 'Enhanced Credit Card Recommendation API',
    description: 'Production-grade recommendation engine with comprehensive scoring',
    version: '2.0.0',
    features: [
      'Signup bonus spend requirement analysis',
      'Point valuation by type (Aeroplan, MR, Cashback, etc.)',
      'Approval probability based on credit profile',
      'Category spending caps consideration',
      'First-year vs long-term value analysis',
      'Detailed explanations and breakdowns'
    ],
    endpoints: {
      'POST /api/recommend/enhanced': {
        description: 'Generate personalized card recommendations',
        requestBody: {
          type: 'object',
          required: ['spending', 'creditScore'],
          properties: {
            spending: {
              type: 'object',
              required: ['grocery', 'gas', 'dining', 'bills'],
              properties: {
                grocery: { type: 'number', description: 'Monthly grocery spending' },
                gas: { type: 'number', description: 'Monthly gas spending' },
                dining: { type: 'number', description: 'Monthly dining spending' },
                bills: { type: 'number', description: 'Monthly recurring bills' },
                travel: { type: 'number', description: 'Monthly travel spending (optional)' },
                shopping: { type: 'number', description: 'Monthly shopping spending (optional)' }
              }
            },
            creditScore: {
              type: 'string',
              enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'],
              description: 'Credit score range'
            },
            annualIncome: { type: 'number', description: 'Annual income (optional)' },
            preferredPointTypes: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Preferred point types (optional)'
            },
            maxAnnualFee: { type: 'number', description: 'Maximum acceptable annual fee (optional)' },
            prioritizeSignupBonus: { type: 'boolean', description: 'Prioritize signup bonuses (optional)' },
            timeHorizon: { 
              type: 'string', 
              enum: ['SHORT_TERM', 'LONG_TERM'],
              description: 'Investment time horizon (optional)'
            }
          }
        }
      }
    },
    examples: {
      request: exampleRequest,
      response: exampleResponse
    },
    pointValuations: {
      AEROPLAN: '1.2¢ per point',
      MEMBERSHIP_REWARDS: '1.8¢ per point',
      AVION: '1.0¢ per point',
      SCENE_PLUS: '1.0¢ per point',
      AIR_MILES: '10.5¢ per mile',
      AVENTURA: '1.0¢ per point',
      MARRIOTT_BONVOY: '0.8¢ per point',
      HILTON_HONORS: '0.5¢ per point',
      CASHBACK: '100¢ per dollar (1:1)',
      AMERICAN_EXPRESS_POINTS: '1.8¢ per point'
    }
  })
}
