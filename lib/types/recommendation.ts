import { z } from 'zod'

/**
 * Enhanced recommendation engine types for production-grade card recommendations
 */

// Point type valuations in cents per point
export const POINT_VALUATIONS = {
  AEROPLAN: 1.2, // 1.2 cents per point
  MEMBERSHIP_REWARDS: 1.8, // 1.8 cents per point (Amex MR)
  AVION: 1.0, // 1.0 cents per point
  SCENE_PLUS: 1.0, // 1.0 cents per point
  AIR_MILES: 10.5, // 10.5 cents per mile
  AVENTURA: 1.0, // 1.0 cents per point
  MARRIOTT_BONVOY: 0.8, // 0.8 cents per point
  HILTON_HONORS: 0.5, // 0.5 cents per point
  CASHBACK: 1.0, // 1.0 cents per point (for cashback points, not dollars)
  AMERICAN_EXPRESS_POINTS: 1.8,
  OTHER: 1.0
} as const

// Credit score ranges for approval probability
export enum CreditScoreRange {
  EXCELLENT = 'EXCELLENT', // 750+
  GOOD = 'GOOD', // 650-749
  FAIR = 'FAIR', // 550-649
  POOR = 'POOR' // <550
}

// Annual fee tiers for risk assessment
export enum AnnualFeeTier {
  NO_FEE = 'NO_FEE', // $0
  LOW_FEE = 'LOW_FEE', // $1-$150
  MID_FEE = 'MID_FEE', // $151-$300
  HIGH_FEE = 'HIGH_FEE', // $301-$500
  PREMIUM = 'PREMIUM' // $500+
}

// Card issuer risk levels
export const ISSUER_RISK_LEVELS = {
  'American Express': 'HIGH', // Stricter approval
  'TD': 'MEDIUM',
  'RBC': 'MEDIUM',
  'CIBC': 'MEDIUM',
  'Scotiabank': 'MEDIUM',
  'BMO': 'MEDIUM',
  'National Bank': 'LOW',
  'Tangerine': 'LOW',
  'Desjardins': 'LOW'
} as const

// User profile for enhanced recommendations
export const UserProfileSchema = z.object({
  // Spending profile (monthly amounts)
  spending: z.object({
    grocery: z.number().nonnegative(),
    gas: z.number().nonnegative(),
    dining: z.number().nonnegative(),
    bills: z.number().nonnegative(),
    travel: z.number().nonnegative().optional().default(0),
    shopping: z.number().nonnegative().optional().default(0),
    other: z.number().nonnegative().optional().default(0)
  }),
  
  // Credit profile
  creditScore: z.nativeEnum(CreditScoreRange),
  annualIncome: z.number().positive().optional(),
  
  // Preferences
  preferredPointTypes: z.array(z.string()).optional().default([]),
  maxAnnualFee: z.number().nonnegative().optional(),
  prioritizeSignupBonus: z.boolean().optional().default(true),
  timeHorizon: z.enum(['SHORT_TERM', 'LONG_TERM']).optional().default('LONG_TERM'),

  // Goal (optional - when set, cards earning this point type are prioritized)
  goal: z.object({
    name: z.string(),
    requiredPoints: z.number().positive(),
    pointType: z.string(),
  }).optional(),
})

export type UserProfile = z.infer<typeof UserProfileSchema>

// Enhanced card recommendation result
export interface CardRecommendation {
  card: {
    id: string
    name: string
    bank: string
    network: string
    annualFee: number
    imageUrl?: string | null
    affiliateLink?: string | null
    slug?: string
  }
  
  // Scoring breakdown
  scores: {
    expectedYearlyValue: number
    approvalProbability: number
    signupBonusValue: number
    yearlySpendRewards: number
    longTermValue: number
  }
  
  // Detailed breakdown
  breakdown: {
    signupBonus: {
      points: number
      pointType: string
      valueInCents: number
      requiredSpend: number
      spendPeriodMonths: number
      achievable: boolean
    } | null
    
    categoryRewards: Array<{
      category: string
      annualSpend: number
      multiplier: number
      points: number
      valueInCents: number
      cappedAt?: number
    }>
    
    totalAnnualRewards: number
    netFirstYearValue: number
    netLongTermValue: number
  }
  
  // Explanation
  explanation: {
    whyRecommended: string
    pros: string[]
    cons: string[]
    bestFor: string[]
  }
  
  // Metadata
  rank: number
  confidence: number // 0-100
  monthsToGoal?: number // How many months to reach the goal with this card
}

// Recommendation engine result
export interface RecommendationResult {
  recommendations: CardRecommendation[]
  userProfile: UserProfile
  metadata: {
    totalCardsEvaluated: number
    timestamp: Date
    version: string
  }
}

// Spending category caps configuration
export interface SpendingCap {
  category: string
  monthlyLimit?: number
  annualLimit?: number
  multiplierAfterCap?: number
}

// Enhanced card data for calculations
export interface EnhancedCardData {
  id: string
  name: string
  bank: string
  network: string
  annualFee: number
  baseRewardRate: number
  imageUrl?: string | null
  affiliateLink?: string | null
  slug?: string
  
  // Bonuses with detailed requirements
  bonuses: Array<{
    id: string
    bonusPoints: number
    pointType: string
    minimumSpendAmount: number
    spendPeriodMonths: number
    estimatedValue?: number | null
    description?: string | null
  }>
  
  // Multipliers with caps
  multipliers: Array<{
    id: string
    category: string
    multiplierValue: number
    description?: string | null
    monthlyLimit?: number | null
    annualLimit?: number | null
  }>
  
  // Approval factors
  approvalFactors: {
    annualFeeTier: AnnualFeeTier
    issuerRiskLevel: keyof typeof ISSUER_RISK_LEVELS
    minimumIncome?: number
  }
}