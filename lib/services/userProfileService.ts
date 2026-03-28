import { prisma } from '../prisma'
import { CreditScoreRange, TimeHorizon, CardOwnershipStatus } from '../types/userProfile'

export interface CreateUserProfileData {
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
}

export interface UpdateUserProfileData extends Partial<CreateUserProfileData> {}

export interface AddUserCardData {
  cardId: string
  openDate: Date
  annualFeeDate: Date
  downgradeEligibleDate?: Date
  notes?: string
}

export class UserProfileService {
  /**
   * Get user profile by user ID
   */
  static async getUserProfile(userId: string) {
    return await prisma.userProfile.findUnique({
      where: { userId }
    })
  }

  /**
   * Create new user profile
   */
  static async createUserProfile(userId: string, data: CreateUserProfileData) {
    return await prisma.userProfile.create({
      data: {
        userId,
        ...data
      }
    })
  }

  /**
   * Update existing user profile
   */
  static async updateUserProfile(userId: string, data: UpdateUserProfileData) {
    return await prisma.userProfile.update({
      where: { userId },
      data
    })
  }

  /**
   * Create or update user profile
   */
  static async upsertUserProfile(userId: string, data: CreateUserProfileData) {
    return await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...data
      },
      update: data
    })
  }

  /**
   * Get user's card ownership status with bonus tracking
   */
  static async getCardOwnershipStatus(clerkUserId: string): Promise<CardOwnershipStatus[]> {
    // First get user
    const user = await prisma.user.findUnique({
      where: { clerkUserId }
    })

    if (!user) {
      return []
    }

    const userCards = await prisma.userCard.findMany({
      where: { 
        userId: user.id,
        isActive: true
      },
      include: {
        card: {
          select: {
            name: true,
            bank: true,
            network: true,
            annualFee: true,
            multipliers: {
              select: {
                category: true,
                multiplierValue: true
              },
              where: { isActive: true },
              orderBy: { multiplierValue: 'desc' }
            }          }
        },
        bonusProgresses: {
          include: {
            cardBonus: true
          }
        }
      }
    })

    return userCards.map(userCard => ({
      cardId: userCard.cardId,
      cardName: userCard.card.name,
      bank: userCard.card.bank,
      network: userCard.card.network,
      annualFee: Number(userCard.card.annualFee),
      openDate: userCard.openDate,
      annualFeeDate: userCard.annualFeeDate,
      downgradeEligibleDate: userCard.downgradeEligibleDate,
      canDowngrade: userCard.downgradeEligibleDate ? new Date() >= userCard.downgradeEligibleDate : false,
      topMultiplier: userCard.card.multipliers[0]
        ? { category: userCard.card.multipliers[0].category, value: Number(userCard.card.multipliers[0].multiplierValue) }
        : undefined,
      multipliers: userCard.card.multipliers.map(m => ({
        category: m.category,
        value: Number(m.multiplierValue)
      })),
      activeBonuses: userCard.bonusProgresses.map(progress => ({
        bonusId: progress.cardBonusId,
        requiredSpend: Number(progress.requiredSpend),
        currentSpend: Number(progress.currentSpend),
        deadline: progress.bonusDeadline,
        isCompleted: progress.isCompleted
      }))
    }))
  }

  /**
   * Add a new card to user's portfolio
   */
  static async addUserCard(clerkUserId: string, data: AddUserCardData) {
    // First get or create user
    const user = await prisma.user.upsert({
      where: { clerkUserId },
      update: {},
      create: {
        clerkUserId,
        email: `${clerkUserId}@temp.com`,
      }
    })

    return await prisma.userCard.create({
      data: {
        userId: user.id,
        cardId: data.cardId,
        openDate: data.openDate,
        annualFeeDate: data.annualFeeDate,
        downgradeEligibleDate: data.downgradeEligibleDate,
        notes: data.notes,
        isActive: true
      }
    })
  }

  /**
   * Remove a card from user's portfolio
   */
  static async removeUserCard(clerkUserId: string, cardId: string) {
    // First get user
    const user = await prisma.user.findUnique({
      where: { clerkUserId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return await prisma.userCard.updateMany({
      where: {
        userId: user.id,
        cardId
      },
      data: {
        isActive: false
      }
    })
  }

  /**
   * Get or create user profile
   */
  static async getOrCreateProfile(clerkUserId: string) {
    // First get or create user
    const user = await prisma.user.upsert({
      where: { clerkUserId },
      update: {},
      create: {
        clerkUserId,
        email: `${clerkUserId}@temp.com`, // Temporary
      }
    })

    let profile = await prisma.userProfile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          preferredRewardType: 'NO_PREFERENCE',
          monthlyGrocery: 0,
          monthlyGas: 0,
          monthlyDining: 0,
          monthlyBills: 0,
          monthlyTravel: 0,
          monthlyShopping: 0,
          monthlyOther: 0,
          prioritizeSignupBonus: true,
          timeHorizon: 'LONG_TERM',
          isComplete: false
        }
      })
    }

    return profile
  }

  /**
   * Get profile with all related details
   */
  static async getProfileWithDetails(clerkUserId: string) {
    // First get user
    const user = await prisma.user.findUnique({
      where: { clerkUserId }
    })

    if (!user) {
      return null
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id }
    })

    if (!profile) {
      return null
    }

    const userCards = await prisma.userCard.findMany({
      where: { 
        userId: user.id,
        isActive: true
      },
      include: {
        card: true,
        bonusProgresses: {
          include: {
            cardBonus: true
          }
        }
      }
    })

    return {
      profile,
      userCards,
      bonusProgress: userCards.flatMap(uc => uc.bonusProgresses)
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(clerkUserId: string, data: any) {
    // First ensure user exists in User table
    const user = await prisma.user.findUnique({
      where: { clerkUserId }
    })

    if (!user) {
      // Create user if doesn't exist (fallback)
      const newUser = await prisma.user.create({
        data: {
          clerkUserId,
          email: `${clerkUserId}@temp.com`, // Temporary, will be updated by webhook
        }
      })
      
      // Create profile for new user
      return await prisma.userProfile.create({
        data: {
          userId: newUser.id,
          ...data,
          isComplete: true
        }
      })
    }

    // Check if profile exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id }
    })

    if (existingProfile) {
      // Update existing profile
      return await prisma.userProfile.update({
        where: { userId: user.id },
        data: {
          ...data,
          isComplete: true,
          lastUpdated: new Date()
        }
      })
    } else {
      // Create new profile
      return await prisma.userProfile.create({
        data: {
          userId: user.id,
          ...data,
          isComplete: true
        }
      })
    }
  }
}