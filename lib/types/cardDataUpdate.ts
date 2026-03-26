export enum UpdateType {
  CARD_UPDATE = 'CARD_UPDATE',
  BONUS_UPDATE = 'BONUS_UPDATE',
  MULTIPLIER_UPDATE = 'MULTIPLIER_UPDATE'
}

export enum UpdateStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface CardDataUpdate {
  id: string
  updateType: UpdateType
  status: UpdateStatus
  cardId: string
  updateData: any
  source: string
  createdAt: Date
  updatedAt: Date
  processedAt?: Date | null
  errorMessage?: string | null
}

import { z } from 'zod'
import { PointType, SpendingCategory } from '@prisma/client'

// Zod Schemas for validation
export const BonusUpdateSchema = z.object({
  cardId: z.string(),
  bonusPoints: z.number().positive(),
  pointType: z.nativeEnum(PointType),
  minimumSpendAmount: z.number().positive(),
  spendPeriodMonths: z.number().int().positive(),
  description: z.string().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  estimatedValue: z.number().optional(),
})

export const MultiplierUpdateSchema = z.object({
  cardId: z.string(),
  category: z.nativeEnum(SpendingCategory),
  multiplierValue: z.number().positive(),
  description: z.string().optional(),
  monthlyLimit: z.number().optional(),
  annualLimit: z.number().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
})

export const OfferUpdateSchema = z.object({
  cardId: z.string(),
  offerType: z.string(),
  description: z.string(),
  value: z.number().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
})

export const CardInfoUpdateSchema = z.object({
  cardId: z.string(),
  name: z.string().optional(),
  bank: z.string().optional(),
  network: z.string().optional(),
  annualFee: z.number().optional(),
  baseRewardRate: z.number().optional(),
  imageUrl: z.string().url().optional(),
  affiliateLink: z.string().url().optional(),
  features: z.array(z.string()).optional(),
  eligibility: z.array(z.string()).optional(),
})

export const ScheduledJobSchema = z.object({
  jobType: z.enum(['CARD_SYNC', 'BONUS_UPDATE', 'MULTIPLIER_UPDATE']),
  scheduledFor: z.string().datetime(),
  payload: z.record(z.any()),
  priority: z.number().int().min(1).max(10).default(5),
})

// Type inference from schemas
export type BonusUpdateRequest = z.infer<typeof BonusUpdateSchema>
export type MultiplierUpdateRequest = z.infer<typeof MultiplierUpdateSchema>
export type OfferUpdateRequest = z.infer<typeof OfferUpdateSchema>
export type CardInfoUpdateRequest = z.infer<typeof CardInfoUpdateSchema>
export type ScheduledJobRequest = z.infer<typeof ScheduledJobSchema>

// Update statistics interface
export interface UpdateStatistics {
  totalUpdates: number
  pendingUpdates: number
  completedUpdates: number
  failedUpdates: number
  updatesByType: {
    type: UpdateType
    count: number
  }[]
  recentUpdates: CardDataUpdate[]
}
