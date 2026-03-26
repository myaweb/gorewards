/**
 * Integration tests for the complete recommendation flow
 * Tests the interaction between services and data flow
 */

import { EnhancedRecommendationEngine } from '../../services/enhancedRecommendationEngine'
import { CardService } from '../../services/cardService'
import { UserProfileService } from '../../services/userProfileService'
import { CreditScoreRange } from '../../types/userProfile'

// Mock Prisma for integration tests
jest.mock('../../prisma', () => ({
  prisma: {
    card: {
      findMany: jest.fn(),
      findUnique: jest.fn()
    },
    userProfile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn()
    }
  }
}))

const { prisma } = require('../../prisma')

describe('Recommendation Flow Integration', () => {
  const mockCards = [
    {
      id: 'card-1',
      name: 'TD Aeroplan Visa Infinite',
      bank: 'TD',
      network: 'Visa',
      annualFee: { toString: () => '139' },
      baseRewardRate: { toString: () => '0.01' },
      imageUrl: '/td-aeroplan.jpg',
      affiliateLink: '/td-aeroplan-link',
      slug: 'td-aeroplan-visa-infinite',
      features: ['Priority boarding', 'Free checked bag'],
      eligibility: ['Minimum income $60,000'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      bonuses: [
        {
          id: 'bonus-1',
          bonusPoints: 50000,
          pointType: 'AEROPLAN',
          minimumSpendAmount: { toString: () => '3000' },
          spendPeriodMonths: 3,
          description: 'Welcome bonus',
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          estimatedValue: { toString: () => '600' }
        }
      ],
      multipliers: [
        {
          id: 'mult-1',
          category: 'TRAVEL',
          multiplierValue: { toString: () => '2.0' },
          description: '2x points on travel',
          monthlyLimit: null,
          annualLimit: null,
          validFrom: new Date(),
          validUntil: null
        },
        {
          id: 'mult-2',
          category: 'GROCERY',
          multiplierValue: { toString: () => '1.5' },
          description: '1.5x points on grocery',
          monthlyLimit: { toString: () => '1000' },
          annualLimit: null,
          validFrom: new Date(),
          validUntil: null
        }
      ]
    },
    {
      id: 'card-2',
      name: 'RBC Cashback Mastercard',
      bank: 'RBC',
      network: 'Mastercard',
      annualFee: { toString: () => '0' },
      baseRewardRate: { toString: () => '0.01' },
      imageUrl: '/rbc-cashback.jpg',
      affiliateLink: '/rbc-cashback-link',
      slug: 'rbc-cashback-mastercard',
      features: ['No annual fee'],
      eligibility: ['Minimum income $15,000'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      bonuses: [
        {
          id: 'bonus-2',
          bonusPoints: 20000,
          pointType: 'CASHBACK',
          minimumSpendAmount: { toString: () => '1000' },
          spendPeriodMonths: 3,
          description: '$200 cashback bonus',
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          estimatedValue: { toString: () => '200' }
        }
      ],
      multipliers: [
        {
          id: 'mult-3',
          category: 'GROCERY',
          multiplierValue: { toString: () => '3.0' },
          description: '3% cashback on grocery',
          monthlyLimit: { toString: () => '500' },
          annualLimit: null,
          validFrom: new Date(),
          validUntil: null
        },
        {
          id: 'mult-4',
          category: 'GAS',
          multiplierValue: { toString: () => '2.0' },
          description: '2% cashback on gas',
          monthlyLimit: null,
          annualLimit: { toString: () => '2000' },
          validFrom: new Date(),
          validUntil: null
        }
      ]
    }
  ]

  const mockUserProfile = {
    id: 'profile-1',
    userId: 'user-123',
    creditScore: CreditScoreRange.GOOD,
    annualIncome: 75000,
    preferredPointTypes: ['AEROPLAN', 'CASHBACK'],
    maxAnnualFee: 200,
    prioritizeSignupBonus: true,
    timeHorizon: 'LONG_TERM' as const,
    spendingProfile: {
      grocery: 800,
      gas: 300,
      dining: 400,
      bills: 150,
      travel: 200,
      shopping: 250,
      entertainment: 100,
      utilities: 125,
      other: 75
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    prisma.card.findMany.mockResolvedValue(mockCards)
    prisma.userProfile.findUnique.mockResolvedValue(mockUserProfile)
  })

  describe('Complete Recommendation Flow', () => {
    it('should generate recommendations based on user profile and available cards', async () => {
      // Test the complete flow from user profile to recommendations
      const userProfile = await UserProfileService.getUserProfile('user-123')
      expect(userProfile).toBeDefined()
      expect(userProfile?.spendingProfile.grocery).toBe(800)

      const cards = await CardService.getAllCardsWithDetails()
      expect(cards).toHaveLength(2)
      expect(cards[0].name).toBe('TD Aeroplan Visa Infinite')

      const recommendations = await EnhancedRecommendationEngine.getRecommendations({
        spending: userProfile!.spendingProfile,
        creditScore: userProfile!.creditScore,
        annualIncome: userProfile!.annualIncome,
        preferredPointTypes: userProfile!.preferredPointTypes,
        maxAnnualFee: userProfile!.maxAnnualFee,
        prioritizeSignupBonus: userProfile!.prioritizeSignupBonus,
        timeHorizon: userProfile!.timeHorizon
      })

      expect(recommendations).toBeDefined()
      expect(recommendations.recommendations).toHaveLength(2)
      expect(recommendations.metadata.totalCardsEvaluated).toBe(2)

      // Verify recommendations are properly scored
      recommendations.recommendations.forEach(rec => {
        expect(rec.scores.approvalProbability).toBeGreaterThan(0)
        expect(rec.scores.approvalProbability).toBeLessThanOrEqual(100)
        expect(rec.scores.expectedYearlyValue).toBeGreaterThan(0)
        expect(rec.confidence).toBeGreaterThan(0)
        expect(rec.confidence).toBeLessThanOrEqual(100)
      })
    })

    it('should handle user with high spending and premium preferences', async () => {
      const premiumUserProfile = {
        ...mockUserProfile,
        annualIncome: 150000,
        maxAnnualFee: 500,
        spendingProfile: {
          grocery: 2000,
          gas: 500,
          dining: 1000,
          bills: 300,
          travel: 2000,
          shopping: 800,
          entertainment: 400,
          utilities: 200,
          other: 300
        }
      }

      prisma.userProfile.findUnique.mockResolvedValue(premiumUserProfile)

      const userProfile = await UserProfileService.getUserProfile('user-123')
      const recommendations = await EnhancedRecommendationEngine.getRecommendations({
        spending: userProfile!.spendingProfile,
        creditScore: userProfile!.creditScore,
        annualIncome: userProfile!.annualIncome,
        preferredPointTypes: userProfile!.preferredPointTypes,
        maxAnnualFee: userProfile!.maxAnnualFee,
        prioritizeSignupBonus: userProfile!.prioritizeSignupBonus,
        timeHorizon: userProfile!.timeHorizon
      })

      expect(recommendations.recommendations).toHaveLength(2)
      
      // Premium user should get higher approval probabilities
      const premiumCard = recommendations.recommendations.find(r => r.card.annualFee > 0)
      expect(premiumCard?.scores.approvalProbability).toBeGreaterThan(80)
    })

    it('should handle user with budget constraints', async () => {
      const budgetUserProfile = {
        ...mockUserProfile,
        annualIncome: 40000,
        maxAnnualFee: 0,
        creditScore: CreditScoreRange.FAIR,
        spendingProfile: {
          grocery: 400,
          gas: 150,
          dining: 200,
          bills: 100,
          travel: 50,
          shopping: 150,
          entertainment: 50,
          utilities: 75,
          other: 25
        }
      }

      prisma.userProfile.findUnique.mockResolvedValue(budgetUserProfile)

      const userProfile = await UserProfileService.getUserProfile('user-123')
      const recommendations = await EnhancedRecommendationEngine.getRecommendations({
        spending: userProfile!.spendingProfile,
        creditscore: userProfile!.creditScore,
        annualIncome: userProfile!.annualIncome,
        preferredPointTypes: userProfile!.preferredPointTypes,
        maxAnnualFee: userProfile!.maxAnnualFee,
        prioritizeSignupBonus: userProfile!.prioritizeSignupBonus,
        timeHorizon: userProfile!.timeHorizon
      })

      // Should prioritize no-fee cards
      const noFeeCard = recommendations.recommendations.find(r => r.card.annualFee === 0)
      expect(noFeeCard).toBeDefined()
      expect(noFeeCard?.scores.feeScore).toBeGreaterThan(90) // High fee score for no-fee card
    })

    it('should handle data consistency between services', async () => {
      // Test that card data is consistent between CardService and RecommendationEngine
      const cards = await CardService.getAllCardsWithDetails()
      const cardById = await CardService.getCardById('card-1')

      expect(cardById).toBeDefined()
      expect(cardById?.id).toBe(cards[0].id)
      expect(cardById?.name).toBe(cards[0].name)
      expect(cardById?.bonuses).toHaveLength(cards[0].bonuses.length)
      expect(cardById?.multipliers).toHaveLength(cards[0].multipliers.length)

      // Verify data transformation consistency
      expect(typeof cardById?.annualFee).toBe('number')
      expect(typeof cardById?.baseRewardRate).toBe('number')
      expect(typeof cardById?.bonuses[0].minimumSpendAmount).toBe('number')
      expect(typeof cardById?.multipliers[0].multiplierValue).toBe('number')
    })

    it('should handle missing or incomplete data gracefully', async () => {
      // Test with incomplete card data
      const incompleteCards = [
        {
          ...mockCards[0],
          bonuses: [], // No bonuses
          multipliers: [] // No multipliers
        }
      ]

      prisma.card.findMany.mockResolvedValue(incompleteCards)

      const recommendations = await EnhancedRecommendationEngine.getRecommendations({
        spending: mockUserProfile.spendingProfile,
        creditScore: mockUserProfile.creditScore,
        annualIncome: mockUserProfile.annualIncome,
        preferredPointTypes: mockUserProfile.preferredPointTypes,
        maxAnnualFee: mockUserProfile.maxAnnualFee,
        prioritizeSignupBonus: mockUserProfile.prioritizeSignupBonus,
        timeHorizon: mockUserProfile.timeHorizon
      })

      expect(recommendations.recommendations).toHaveLength(1)
      expect(recommendations.recommendations[0].scores.bonusScore).toBe(0) // No bonus
      expect(recommendations.recommendations[0].scores.categoryScore).toBe(0) // No multipliers
    })

    it('should handle user profile updates and recommendation refresh', async () => {
      // Initial profile
      let userProfile = await UserProfileService.getUserProfile('user-123')
      let initialRecommendations = await EnhancedRecommendationEngine.getRecommendations({
        spending: userProfile!.spendingProfile,
        creditScore: userProfile!.creditScore,
        annualIncome: userProfile!.annualIncome,
        preferredPointTypes: userProfile!.preferredPointTypes,
        maxAnnualFee: userProfile!.maxAnnualFee,
        prioritizeSignupBonus: userProfile!.prioritizeSignupBonus,
        timeHorizon: userProfile!.timeHorizon
      })

      // Update profile
      const updatedProfile = {
        ...mockUserProfile,
        maxAnnualFee: 0, // Changed to no-fee preference
        spendingProfile: {
          ...mockUserProfile.spendingProfile,
          grocery: 1500 // Increased grocery spending
        }
      }

      prisma.userProfile.update.mockResolvedValue(updatedProfile)
      prisma.userProfile.findUnique.mockResolvedValue(updatedProfile)

      await UserProfileService.updateUserProfile('user-123', {
        maxAnnualFee: 0,
        spendingProfile: updatedProfile.spendingProfile
      })

      // Get updated recommendations
      userProfile = await UserProfileService.getUserProfile('user-123')
      const updatedRecommendations = await EnhancedRecommendationEngine.getRecommendations({
        spending: userProfile!.spendingProfile,
        creditScore: userProfile!.creditScore,
        annualIncome: userProfile!.annualIncome,
        preferredPointTypes: userProfile!.preferredPointTypes,
        maxAnnualFee: userProfile!.maxAnnualFee,
        prioritizeSignupBonus: userProfile!.prioritizeSignupBonus,
        timeHorizon: userProfile!.timeHorizon
      })

      // Recommendations should change based on updated preferences
      expect(updatedRecommendations.recommendations).not.toEqual(initialRecommendations.recommendations)
      
      // No-fee card should be ranked higher now
      const noFeeCard = updatedRecommendations.recommendations.find(r => r.card.annualFee === 0)
      const feeCard = updatedRecommendations.recommendations.find(r => r.card.annualFee > 0)
      
      if (noFeeCard && feeCard) {
        expect(noFeeCard.scores.totalScore).toBeGreaterThan(feeCard.scores.totalScore)
      }
    })
  })

  describe('Error Handling in Integration Flow', () => {
    it('should handle database errors gracefully', async () => {
      prisma.card.findMany.mockRejectedValue(new Error('Database connection failed'))

      await expect(
        EnhancedRecommendationEngine.getRecommendations({
          spending: mockUserProfile.spendingProfile,
          creditScore: mockUserProfile.creditScore,
          annualIncome: mockUserProfile.annualIncome,
          preferredPointTypes: mockUserProfile.preferredPointTypes,
          maxAnnualFee: mockUserProfile.maxAnnualFee,
          prioritizeSignupBonus: mockUserProfile.prioritizeSignupBonus,
          timeHorizon: mockUserProfile.timeHorizon
        })
      ).rejects.toThrow('Database connection failed')
    })

    it('should handle missing user profile', async () => {
      prisma.userProfile.findUnique.mockResolvedValue(null)

      const userProfile = await UserProfileService.getUserProfile('non-existent-user')
      expect(userProfile).toBeNull()
    })

    it('should handle empty card database', async () => {
      prisma.card.findMany.mockResolvedValue([])

      const recommendations = await EnhancedRecommendationEngine.getRecommendations({
        spending: mockUserProfile.spendingProfile,
        creditScore: mockUserProfile.creditScore,
        annualIncome: mockUserProfile.annualIncome,
        preferredPointTypes: mockUserProfile.preferredPointTypes,
        maxAnnualFee: mockUserProfile.maxAnnualFee,
        prioritizeSignupBonus: mockUserProfile.prioritizeSignupBonus,
        timeHorizon: mockUserProfile.timeHorizon
      })

      expect(recommendations.recommendations).toHaveLength(0)
      expect(recommendations.metadata.totalCardsEvaluated).toBe(0)
    })
  })

  describe('Performance and Scalability', () => {
    it('should handle large number of cards efficiently', async () => {
      // Create 100 mock cards
      const manyCards = Array.from({ length: 100 }, (_, i) => ({
        ...mockCards[0],
        id: `card-${i + 1}`,
        name: `Test Card ${i + 1}`,
        annualFee: { toString: () => (i * 10).toString() }
      }))

      prisma.card.findMany.mockResolvedValue(manyCards)

      const startTime = Date.now()
      const recommendations = await EnhancedRecommendationEngine.getRecommendations({
        spending: mockUserProfile.spendingProfile,
        creditScore: mockUserProfile.creditScore,
        annualIncome: mockUserProfile.annualIncome,
        preferredPointTypes: mockUserProfile.preferredPointTypes,
        maxAnnualFee: mockUserProfile.maxAnnualFee,
        prioritizeSignupBonus: mockUserProfile.prioritizeSignupBonus,
        timeHorizon: mockUserProfile.timeHorizon
      })
      const endTime = Date.now()

      expect(recommendations.metadata.totalCardsEvaluated).toBe(100)
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
      expect(recommendations.recommendations.length).toBeGreaterThan(0)
    })

    it('should handle complex spending patterns', async () => {
      const complexSpendingProfile = {
        grocery: 2500,
        gas: 800,
        dining: 1200,
        bills: 500,
        travel: 3000,
        shopping: 1500,
        entertainment: 600,
        utilities: 300,
        other: 400
      }

      const recommendations = await EnhancedRecommendationEngine.getRecommendations({
        spending: complexSpendingProfile,
        creditScore: mockUserProfile.creditScore,
        annualIncome: mockUserProfile.annualIncome,
        preferredPointTypes: mockUserProfile.preferredPointTypes,
        maxAnnualFee: mockUserProfile.maxAnnualFee,
        prioritizeSignupBonus: mockUserProfile.prioritizeSignupBonus,
        timeHorizon: mockUserProfile.timeHorizon
      })

      expect(recommendations.recommendations).toHaveLength(2)
      
      // Should properly calculate category scores for high spending
      recommendations.recommendations.forEach(rec => {
        expect(rec.scores.categoryScore).toBeGreaterThan(0)
        expect(rec.explanation).toContain('spending')
      })
    })
  })
})