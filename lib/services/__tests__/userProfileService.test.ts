import { UserProfileService } from '../userProfileService'
import { CreditScoreRange, TimeHorizon } from '../../types/userProfile'

// Mock Prisma
jest.mock('../../prisma', () => ({
  prisma: {
    userProfile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn()
    }
  }
}))

const { prisma } = require('../../prisma')

describe('UserProfileService', () => {
  const mockUserId = 'user-123'
  
  const mockUserProfile = {
    id: 'profile-1',
    userId: mockUserId,
    creditScore: CreditScoreRange.GOOD,
    annualIncome: 75000,
    preferredPointTypes: ['AEROPLAN', 'CASHBACK'],
    maxAnnualFee: 200,
    prioritizeSignupBonus: true,
    timeHorizon: 'LONG_TERM',
    spendingProfile: {
      grocery: 800,
      gas: 200,
      dining: 400,
      bills: 150,
      travel: 100,
      shopping: 200,
      entertainment: 50,
      utilities: 100,
      other: 50
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserProfile', () => {
    it('should fetch user profile successfully', async () => {
      prisma.userProfile.findUnique.mockResolvedValue(mockUserProfile)

      const result = await UserProfileService.getUserProfile(mockUserId)

      expect(prisma.userProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: mockUserId }
      })

      expect(result).toEqual(mockUserProfile)
    })

    it('should return null for non-existent user', async () => {
      prisma.userProfile.findUnique.mockResolvedValue(null)

      const result = await UserProfileService.getUserProfile('non-existent')

      expect(result).toBeNull()
    })

    it('should handle database errors', async () => {
      prisma.userProfile.findUnique.mockRejectedValue(new Error('Database error'))

      await expect(UserProfileService.getUserProfile(mockUserId)).rejects.toThrow('Database error')
    })
  })

  describe('createUserProfile', () => {
    const newProfileData = {
      creditScore: CreditScoreRange.EXCELLENT,
      annualIncome: 100000,
      preferredPointTypes: ['AEROPLAN'],
      maxAnnualFee: 500,
      prioritizeSignupBonus: false,
      timeHorizon: TimeHorizon.SHORT_TERM,
      spendingProfile: {
        grocery: 1000,
        gas: 300,
        dining: 500,
        bills: 200,
        travel: 200,
        shopping: 300,
        entertainment: 100,
        utilities: 150,
        other: 100
      }
    }

    it('should create new user profile successfully', async () => {
      const createdProfile = { id: 'new-profile', userId: mockUserId, ...newProfileData }
      prisma.userProfile.create.mockResolvedValue(createdProfile)

      const result = (await UserProfileService.createUserProfile(mockUserId, newProfileData)) as any

      expect(prisma.userProfile.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          ...newProfileData
        }
      })

      expect(result.userId).toBe(mockUserId)
      expect(result.creditScore).toBe(CreditScoreRange.EXCELLENT)
    })

    it('should handle validation errors', async () => {
      const invalidData = {
        ...newProfileData,
        annualIncome: -1000, // Invalid negative income
        maxAnnualFee: -50    // Invalid negative fee
      }

      prisma.userProfile.create.mockRejectedValue(new Error('Validation failed'))

      await expect(
        UserProfileService.createUserProfile(mockUserId, invalidData)
      ).rejects.toThrow('Validation failed')
    })

    it('should handle duplicate user profile creation', async () => {
      prisma.userProfile.create.mockRejectedValue(new Error('Unique constraint failed'))

      await expect(
        UserProfileService.createUserProfile(mockUserId, newProfileData)
      ).rejects.toThrow('Unique constraint failed')
    })
  })

  describe('updateUserProfile', () => {
    const updateData = {
      annualIncome: 85000,
      maxAnnualFee: 300,
      spendingProfile: {
        grocery: 900,
        gas: 250,
        dining: 450,
        bills: 150,
        travel: 150,
        shopping: 250,
        entertainment: 75,
        utilities: 125,
        other: 75
      }
    }

    it('should update user profile successfully', async () => {
      const updatedProfile = { ...mockUserProfile, ...updateData }
      prisma.userProfile.update.mockResolvedValue(updatedProfile)

      const result = (await UserProfileService.updateUserProfile(mockUserId, updateData)) as any

      expect(prisma.userProfile.update).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        data: updateData
      })

      expect(result.annualIncome).toBe(85000)
      expect(result.maxAnnualFee).toBe(300)
    })

    it('should handle partial updates', async () => {
      const partialUpdate = { annualIncome: 90000 }
      const updatedProfile = { ...mockUserProfile, ...partialUpdate }
      prisma.userProfile.update.mockResolvedValue(updatedProfile)

      const result = (await UserProfileService.updateUserProfile(mockUserId, partialUpdate)) as any

      expect(result.annualIncome).toBe(90000)
      expect(result.creditScore).toBe(mockUserProfile.creditScore) // Unchanged
    })

    it('should handle non-existent user update', async () => {
      prisma.userProfile.update.mockRejectedValue(new Error('Record not found'))

      await expect(
        UserProfileService.updateUserProfile('non-existent', updateData)
      ).rejects.toThrow('Record not found')
    })
  })

  describe('upsertUserProfile', () => {
    const upsertData = {
      creditScore: CreditScoreRange.FAIR,
      annualIncome: 60000,
      preferredPointTypes: ['CASHBACK'],
      maxAnnualFee: 100,
      prioritizeSignupBonus: true,
      timeHorizon: TimeHorizon.MEDIUM_TERM,
      spendingProfile: {
        grocery: 600,
        gas: 150,
        dining: 300,
        bills: 100,
        travel: 50,
        shopping: 150,
        entertainment: 25,
        utilities: 75,
        other: 25
      }
    }

    it('should create profile when it does not exist', async () => {
      const createdProfile = { id: 'new-profile', userId: mockUserId, ...upsertData }
      prisma.userProfile.upsert.mockResolvedValue(createdProfile)

      const result = (await UserProfileService.upsertUserProfile(mockUserId, upsertData)) as any

      expect(prisma.userProfile.upsert).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        create: {
          userId: mockUserId,
          ...upsertData
        },
        update: upsertData
      })

      expect(result.userId).toBe(mockUserId)
      expect(result.creditScore).toBe(CreditScoreRange.FAIR)
    })

    it('should update profile when it exists', async () => {
      const updatedProfile = { ...mockUserProfile, ...upsertData }
      prisma.userProfile.upsert.mockResolvedValue(updatedProfile)

      const result = (await UserProfileService.upsertUserProfile(mockUserId, upsertData)) as any

      expect(result.annualIncome).toBe(60000)
      expect(result.maxAnnualFee).toBe(100)
    })
  })

  describe('Edge Cases and Validation', () => {
    it('should handle zero spending in all categories', async () => {
      const zeroSpendingProfile = {
        creditScore: CreditScoreRange.GOOD,
        annualIncome: 50000,
        preferredPointTypes: ['CASHBACK'],
        maxAnnualFee: 0,
        prioritizeSignupBonus: false,
        timeHorizon: TimeHorizon.SHORT_TERM,
        spendingProfile: {
          grocery: 0,
          gas: 0,
          dining: 0,
          bills: 0,
          travel: 0,
          shopping: 0,
          entertainment: 0,
          utilities: 0,
          other: 0
        }
      }

      const createdProfile = { id: 'zero-spend-profile', userId: mockUserId, ...zeroSpendingProfile }
      prisma.userProfile.create.mockResolvedValue(createdProfile)

      const result = (await UserProfileService.createUserProfile(mockUserId, zeroSpendingProfile)) as any

      expect(result.spendingProfile.grocery).toBe(0)
      expect(result.maxAnnualFee).toBe(0)
    })

    it('should handle very high spending amounts', async () => {
      const highSpendingProfile = {
        creditScore: CreditScoreRange.EXCELLENT,
        annualIncome: 500000,
        preferredPointTypes: ['AEROPLAN', 'MEMBERSHIP_REWARDS'],
        maxAnnualFee: 2000,
        prioritizeSignupBonus: true,
        timeHorizon: TimeHorizon.LONG_TERM,
        spendingProfile: {
          grocery: 10000,
          gas: 2000,
          dining: 5000,
          bills: 1000,
          travel: 15000,
          shopping: 8000,
          entertainment: 3000,
          utilities: 500,
          other: 2000
        }
      }

      const createdProfile = { id: 'high-spend-profile', userId: mockUserId, ...highSpendingProfile }
      prisma.userProfile.create.mockResolvedValue(createdProfile)

      const result = (await UserProfileService.createUserProfile(mockUserId, highSpendingProfile)) as any

      expect(result.spendingProfile.travel).toBe(15000)
      expect(result.annualIncome).toBe(500000)
    })

    it('should handle empty preferred point types', async () => {
      const profileWithEmptyPointTypes = {
        creditScore: CreditScoreRange.GOOD,
        annualIncome: 70000,
        preferredPointTypes: [] as string[],
        maxAnnualFee: 150,
        prioritizeSignupBonus: false,
        timeHorizon: TimeHorizon.MEDIUM_TERM,
        spendingProfile: mockUserProfile.spendingProfile
      }

      const createdProfile = { id: 'empty-points-profile', userId: mockUserId, ...profileWithEmptyPointTypes }
      prisma.userProfile.create.mockResolvedValue(createdProfile)

      const result = (await UserProfileService.createUserProfile(mockUserId, profileWithEmptyPointTypes)) as any

      expect(result.preferredPointTypes).toEqual([])
    })

    it('should handle invalid user ID format', async () => {
      const invalidUserId = ''

      await expect(
        UserProfileService.getUserProfile(invalidUserId)
      ).rejects.toThrow()
    })

    it('should handle concurrent updates gracefully', async () => {
      // Simulate concurrent update conflict
      prisma.userProfile.update.mockRejectedValue(new Error('Concurrent update conflict'))

      await expect(
        UserProfileService.updateUserProfile(mockUserId, { annualIncome: 80000 })
      ).rejects.toThrow('Concurrent update conflict')
    })
  })

  describe('Data Integrity', () => {
    it('should preserve data types correctly', async () => {
      prisma.userProfile.findUnique.mockResolvedValue(mockUserProfile)

      const result = (await UserProfileService.getUserProfile(mockUserId)) as any

      expect(typeof result?.annualIncome).toBe('number')
      expect(typeof result?.maxAnnualFee).toBe('number')
      expect(typeof result?.prioritizeSignupBonus).toBe('boolean')
      expect(Array.isArray(result?.preferredPointTypes)).toBe(true)
      expect(typeof result?.spendingProfile).toBe('object')
    })

    it('should handle null and undefined values appropriately', async () => {
      const profileWithNulls = {
        ...mockUserProfile,
        maxAnnualFee: null,
        preferredPointTypes: null
      }

      prisma.userProfile.findUnique.mockResolvedValue(profileWithNulls)

      const result = (await UserProfileService.getUserProfile(mockUserId)) as any

      expect(result?.maxAnnualFee).toBeNull()
      expect(result?.preferredPointTypes).toBeNull()
    })
  })
})
