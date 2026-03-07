import { z } from 'zod'

// Enums matching Prisma schema
export const CardNetworkSchema = z.enum(['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'])

export const SpendingCategorySchema = z.enum([
  'GROCERY',
  'GAS',
  'DINING',
  'TRAVEL',
  'RECURRING',
  'ENTERTAINMENT',
  'SHOPPING',
  'UTILITIES',
  'OTHER'
])

export const PointTypeSchema = z.enum([
  'AEROPLAN',
  'AVION',
  'MEMBERSHIP_REWARDS',
  'CASHBACK',
  'SCENE_PLUS',
  'AIR_MILES',
  'AVENTURA',
  'MARRIOTT_BONVOY',
  'HILTON_HONORS',
  'AMERICAN_EXPRESS_POINTS',
  'OTHER'
])

// Card validation schema
export const CardSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1, 'Card name is required'),
  bank: z.string().min(1, 'Bank name is required'),
  network: CardNetworkSchema,
  annualFee: z.number().nonnegative('Annual fee must be non-negative'),
  currency: z.string().length(3).default('CAD'),
  baseImageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
})

export const CreateCardSchema = CardSchema.omit({ id: true })

// Card Bonus validation schema
export const CardBonusSchema = z.object({
  id: z.string().cuid().optional(),
  cardId: z.string().cuid(),
  bonusPoints: z.number().int().positive('Bonus points must be positive'),
  pointType: PointTypeSchema,
  minimumSpendAmount: z.number().nonnegative('Minimum spend must be non-negative'),
  spendPeriodMonths: z.number().int().positive('Spend period must be at least 1 month'),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export const CreateCardBonusSchema = CardBonusSchema.omit({ id: true })

// Card Multiplier validation schema
export const CardMultiplierSchema = z.object({
  id: z.string().cuid().optional(),
  cardId: z.string().cuid(),
  category: SpendingCategorySchema,
  multiplierValue: z.number().positive('Multiplier must be positive').max(100, 'Multiplier seems unrealistic'),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export const CreateCardMultiplierSchema = CardMultiplierSchema.omit({ id: true })

// Goal validation schema
export const GoalSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1, 'Goal name is required'),
  requiredPoints: z.number().int().positive('Required points must be positive'),
  pointType: PointTypeSchema,
  description: z.string().optional().nullable(),
  estimatedValue: z.number().nonnegative().optional().nullable(),
  isActive: z.boolean().default(true),
})

export const CreateGoalSchema = GoalSchema.omit({ id: true })

// Type exports
export type Card = z.infer<typeof CardSchema>
export type CreateCard = z.infer<typeof CreateCardSchema>
export type CardBonus = z.infer<typeof CardBonusSchema>
export type CreateCardBonus = z.infer<typeof CreateCardBonusSchema>
export type CardMultiplier = z.infer<typeof CardMultiplierSchema>
export type CreateCardMultiplier = z.infer<typeof CreateCardMultiplierSchema>
export type Goal = z.infer<typeof GoalSchema>
export type CreateGoal = z.infer<typeof CreateGoalSchema>
