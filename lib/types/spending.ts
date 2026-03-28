import { z } from 'zod'

// Spending profile for the four core categories
export const SpendingProfileSchema = z.object({
  grocery: z.number().nonnegative('Grocery spending must be non-negative'),
  gas: z.number().nonnegative('Gas spending must be non-negative'),
  dining: z.number().nonnegative('Dining spending must be non-negative'),
  recurring: z.number().nonnegative('Recurring spending must be non-negative'),
})

export type SpendingProfile = z.infer<typeof SpendingProfileSchema>

// Roadmap step representing a card application and usage strategy
export interface RoadmapStep {
  month: number
  cardId: string
  cardName: string
  cardImageUrl?: string | null
  cardBank?: string
  cardNetwork?: string
  action: 'APPLY' | 'USE'
  categoryAllocations: {
    category: keyof SpendingProfile
    amount: number
    multiplier: number
    pointsEarned: number
  }[]
  bonusProgress: {
    bonusId: string
    currentSpend: number
    requiredSpend: number
    bonusPoints: number
    bonusEarned: boolean
  } | null
  monthlyPointsEarned: number
  cumulativePoints: number
  projectedGoalCompletion: number // Percentage
}

// Complete roadmap result
export interface OptimalRoadmap {
  status?: 'success' | 'no_cards_found' | 'insufficient_spending'
  steps: RoadmapStep[]
  totalMonths: number
  totalPointsEarned: number
  goalAchieved: boolean
  efficiency: {
    pointsPerDollar: number
    monthsToGoal: number
    totalSpend: number
  }
  errorMessage?: string
  missingPointType?: string
}

// Enhanced card bonus interface
export interface CardBonus {
  id: string
  bonusPoints: number
  pointType: string
  minimumSpendAmount: number
  spendPeriodMonths: number
  description?: string
  validFrom?: Date | null
  validUntil?: Date | null
  estimatedValue?: number | null
}

// Enhanced card multiplier interface
export interface CardMultiplier {
  id: string
  category: string
  multiplierValue: number
  description?: string
  monthlyLimit?: number | null
  annualLimit?: number | null
  validFrom?: Date | null
  validUntil?: Date | null
}

// Card offer interface for limited-time promotions
export interface CardOffer {
  id: string
  offerType: string
  title: string
  description: string
  bonusPoints?: number | null
  pointType?: string | null
  cashValue?: number | null
  minimumSpend?: number | null
  timeframe?: number | null
  validFrom: Date
  validUntil: Date
  terms?: string | null
}

// Enhanced card with all related data for calculations
export interface CardWithDetails {
  id: string
  name: string
  bank: string
  network: string
  annualFee: number
  baseRewardRate: number
  slug?: string
  imageUrl?: string | null
  affiliateLink?: string | null
  features?: any
  eligibility?: any
  bonuses: CardBonus[]
  multipliers: CardMultiplier[]
  offers?: CardOffer[]
  createdAt?: Date
  updatedAt?: Date
}
