import { z } from 'zod'
import { SpendingCategory, PointType } from '@prisma/client'

/**
 * Card Optimization Engine Types
 * 
 * Types and validations used to determine the optimal card
 * for each spending category for users.
 */

// Category optimization result
export interface CategoryOptimization {
  category: SpendingCategory
  recommendedCard: {
    id: string
    name: string
    bank: string
    network: string
    imageUrl?: string | null
  }
  multiplier: number
  pointType: PointType
  pointValue: number // Cents per point value
  monthlySpending: number
  monthlyRewards: number // In cents
  yearlyRewards: number // In cents
  explanation: string
  confidence: number // Confidence score 0-100
}

// Complete optimization result
export interface CardOptimizationResult {
  userId: string
  optimizations: CategoryOptimization[]
  totalMonthlyRewards: number
  totalYearlyRewards: number
  summary: {
    bestOverallCard: {
      id: string
      name: string
      categoriesCount: number
    } | null
    totalCategories: number
    averageMultiplier: number
    estimatedAnnualValue: number
  }
  lastCalculated: Date
}

// User card for optimization
export interface UserCardForOptimization {
  id: string
  cardId: string
  name: string
  bank: string
  network: string
  imageUrl?: string | null
  multipliers: Array<{
    category: SpendingCategory
    multiplierValue: number
    monthlyLimit?: number | null
    annualLimit?: number | null
  }>
  bonuses: Array<{
    pointType: PointType
    bonusPoints: number
    minimumSpendAmount: number
    spendPeriodMonths: number
  }>
  openDate: Date
  isActive: boolean
}

// Spending profile
export interface SpendingProfile {
  grocery: number
  gas: number
  dining: number
  bills: number
  travel: number
  shopping: number
  other: number
}

// Point valuation mapping
export const POINT_VALUATIONS: Record<PointType, number> = {
  AEROPLAN: 1.2,
  AVION: 1.0,
  MEMBERSHIP_REWARDS: 1.8,
  CASHBACK: 1.0,
  SCENE_PLUS: 1.0,
  AIR_MILES: 10.5,
  AVENTURA: 1.0,
  MARRIOTT_BONVOY: 0.8,
  HILTON_HONORS: 0.5,
  AMERICAN_EXPRESS_POINTS: 1.8,
  OTHER: 1.0
}

// Category mapping
export const CATEGORY_MAPPING: Record<string, SpendingCategory> = {
  grocery: SpendingCategory.GROCERY,
  gas: SpendingCategory.GAS,
  dining: SpendingCategory.DINING,
  bills: SpendingCategory.RECURRING,
  travel: SpendingCategory.TRAVEL,
  shopping: SpendingCategory.SHOPPING,
  other: SpendingCategory.OTHER
}

// Zod schemas
export const SpendingProfileSchema = z.object({
  grocery: z.number().nonnegative().default(0),
  gas: z.number().nonnegative().default(0),
  dining: z.number().nonnegative().default(0),
  bills: z.number().nonnegative().default(0),
  travel: z.number().nonnegative().default(0),
  shopping: z.number().nonnegative().default(0),
  other: z.number().nonnegative().default(0)
})

export const CardOptimizationRequestSchema = z.object({
  userId: z.string(),
  spendingProfile: SpendingProfileSchema,
  includeInactiveCards: z.boolean().default(false),
  considerSignupBonuses: z.boolean().default(false)
})

export type CardOptimizationRequest = z.infer<typeof CardOptimizationRequestSchema>