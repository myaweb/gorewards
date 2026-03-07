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
  steps: RoadmapStep[]
  totalMonths: number
  totalPointsEarned: number
  goalAchieved: boolean
  efficiency: {
    pointsPerDollar: number
    monthsToGoal: number
    totalSpend: number
  }
}

// Card with all related data for calculations
export interface CardWithDetails {
  id: string
  name: string
  bank: string
  network: string
  annualFee: number
  bonuses: {
    id: string
    bonusPoints: number
    pointType: string
    minimumSpendAmount: number
    spendPeriodMonths: number
  }[]
  multipliers: {
    id: string
    category: string
    multiplierValue: number
  }[]
}
