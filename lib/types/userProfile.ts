export enum CreditScoreRange {
  POOR = 'POOR',
  FAIR = 'FAIR', 
  GOOD = 'GOOD',
  VERY_GOOD = 'VERY_GOOD',
  EXCELLENT = 'EXCELLENT'
}

export enum TimeHorizon {
  SHORT_TERM = 'SHORT_TERM',
  MEDIUM_TERM = 'MEDIUM_TERM', 
  LONG_TERM = 'LONG_TERM'
}

export interface UserProfile {
  id: string
  userId: string
  creditScore: CreditScoreRange
  annualIncome: number
  preferredPointTypes: string[]
  maxAnnualFee: number
  prioritizeSignupBonus: boolean
  timeHorizon: TimeHorizon
  spendingProfile: {
    grocery: number
    gas: number
    dining: number
    bills: number
    travel: number
    shopping: number
    entertainment: number
    utilities: number
    other: number
  }
  createdAt: Date
  updatedAt: Date
}

import { z } from 'zod'
import { PointType } from '@prisma/client'

// Zod Schemas for validation
export const UserProfileSchema = z.object({
  creditScore: z.nativeEnum(CreditScoreRange),
  annualIncome: z.number().positive(),
  preferredPointTypes: z.array(z.nativeEnum(PointType)),
  maxAnnualFee: z.number().min(0),
  prioritizeSignupBonus: z.boolean(),
  timeHorizon: z.nativeEnum(TimeHorizon),
  spendingProfile: z.object({
    grocery: z.number().min(0),
    gas: z.number().min(0),
    dining: z.number().min(0),
    bills: z.number().min(0),
    travel: z.number().min(0),
    shopping: z.number().min(0),
    entertainment: z.number().min(0),
    utilities: z.number().min(0),
    other: z.number().min(0),
  }),
})

// Schema for profile updates from frontend form
export const UserProfileUpdateSchema = z.object({
  creditScoreRange: z.nativeEnum(CreditScoreRange).optional(),
  annualIncome: z.number().positive().optional(),
  preferredRewardType: z.enum([
    'NO_PREFERENCE',
    'TRAVEL_POINTS', 
    'CASHBACK',
    'AIRLINE_MILES',
    'HOTEL_POINTS',
    'FLEXIBLE_POINTS'
  ]).default('NO_PREFERENCE'),
  monthlyGrocery: z.number().min(0).default(0),
  monthlyGas: z.number().min(0).default(0),
  monthlyDining: z.number().min(0).default(0),
  monthlyBills: z.number().min(0).default(0),
  monthlyTravel: z.number().min(0).default(0),
  monthlyShopping: z.number().min(0).default(0),
  monthlyOther: z.number().min(0).default(0),
  maxAnnualFee: z.number().min(0).optional(),
  prioritizeSignupBonus: z.boolean().default(true),
  timeHorizon: z.enum(['SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM']).default('LONG_TERM')
})

export const UserCardSchema = z.object({
  cardId: z.string(),
  openDate: z.date(),
  annualFeeDate: z.date(),
  downgradeEligibleDate: z.date().optional(),
  notes: z.string().optional(),
})

// Type inference
export type UserProfileRequest = z.infer<typeof UserProfileSchema>
export type UserProfileUpdateRequest = z.infer<typeof UserProfileUpdateSchema>
export type UserCardRequest = z.infer<typeof UserCardSchema>

// Preferred reward type enum (for backward compatibility)
export enum PreferredRewardType {
  AEROPLAN = 'AEROPLAN',
  AVION = 'AVION',
  SCENE_PLUS = 'SCENE_PLUS',
  AMERICAN_EXPRESS_MR = 'AMERICAN_EXPRESS_MR',
  CASH_BACK = 'CASH_BACK',
  TRAVEL_POINTS = 'TRAVEL_POINTS',
}

// User card interface
export interface UserCard {
  id: string
  userId: string
  cardId: string
  applicationDate?: Date | null
  approvalDate?: Date | null
  bonusEarned: boolean
  bonusEarnedDate?: Date | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

// Card ownership status with bonus tracking
export interface CardOwnershipStatus {
  cardId: string
  cardName?: string
  bank?: string
  network?: string
  annualFee?: number
  openDate?: Date
  annualFeeDate?: Date
  downgradeEligibleDate?: Date | null
  canDowngrade: boolean
  topMultiplier?: { category: string; value: number }
  estimatedMonthlyValue?: number
  multipliers?: { category: string; value: number }[]
  activeBonuses: {
    bonusId: string
    requiredSpend: number
    currentSpend: number
    deadline: Date
    isCompleted: boolean
  }[]
}
