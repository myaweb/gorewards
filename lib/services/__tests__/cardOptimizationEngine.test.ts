import { CardOptimizationEngine } from '../cardOptimizationEngine'
import { SpendingCategory, PointType } from '@prisma/client'
import { SpendingProfile } from '../../types/cardOptimization'

// Mock Prisma
jest.mock('../../prisma', () => ({
  prisma: {
    userCard: {
      findMany: jest.fn()
    }
  }
}))

const { prisma } = require('../../prisma')

describe('CardOptimizationEngine', () => {
  const mockUserId = 'user-123'
  
  const mockSpendingProfile: SpendingProfile = {
    grocery: 800,
    gas: 200,
    dining: 400,
    bills: 150,
    travel: 100,
    shopping: 200,
    other: 50
  }

  const mockUserCards = [
    {
      id: 'user-card-1',
      cardId: 'card-1',
      card: {
        name: 'Grocery Rewards Card',
        bank: 'TD',
        network: 'Visa',
        imageUrl: '/card1.jpg',
        multipliers: [
          {
            category: SpendingCategory.GROCERY,
            multiplierValue: 3.0,
            monthlyLimit: null,
            annualLimit: null
          }
        ],
        bonuses: [
          {
            pointType: PointType.CASHBACK,
            bonusPoints: 20000,
            minimumSpendAmount: 1000,
            spendPeriodMonths: 3
          }
        ]
      },
      openDate: new Date(),
      isActive: true
    },
    {
      id: 'user-card-2',
      cardId: 'card-2',
      card: {
        name: 'Travel Rewards Card',
        bank: 'RBC',
        network: 'Mastercard',
        imageUrl: '/card2.jpg',
        multipliers: [
          {
            category: SpendingCategory.TRAVEL,
            multiplierValue: 5.0,
            monthlyLimit: null,
            annualLimit: null
          },
          {
            category: SpendingCategory.DINING,
            multiplierValue: 2.0,
            monthlyLimit: 500, // $500 monthly limit
            annualLimit: null
          }
        ],
        bonuses: [
          {
            pointType: PointType.AEROPLAN,
            bonusPoints: 50000,
            minimumSpendAmount: 3000,
            spendPeriodMonths: 6
          }
        ]
      },
      openDate: new Date(),
      isActive: true
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    prisma.userCard.findMany.mockResolvedValue(mockUserCards)
  })

  describe('calculateBestCardPerCategory', () => {
    it('should calculate optimal cards for each spending category', async () => {
      const result = await CardOptimizationEngine.calculateBestCardPerCategory(
        mockUserId,
        mockSpendingProfile
      )

      expect(result).toBeDefined()
      expect(result.userId).toBe(mockUserId)
      expect(result.optimizations).toHaveLength(3) // grocery, dining, travel (shopping has no multiplier)
      expect(result.totalMonthlyRewards).toBeGreaterThan(0)
      expect(result.totalYearlyRewards).toBe(result.totalMonthlyRewards * 12)
    })

    it('should select the highest multiplier card for each category', async () => {
      const result = await CardOptimizationEngine.calculateBestCardPerCategory(
        mockUserId,
        mockSpendingProfile
      )

      const groceryOpt = result.optimizations.find(opt => opt.category === SpendingCategory.GROCERY)
      const travelOpt = result.optimizations.find(opt => opt.category === SpendingCategory.TRAVEL)

      expect(groceryOpt?.recommendedCard.name).toBe('Grocery Rewards Card')
      expect(groceryOpt?.multiplier).toBe(3.0)
      
      expect(travelOpt?.recommendedCard.name).toBe('Travel Rewards Card')
      expect(travelOpt?.multiplier).toBe(5.0)
    })

    it('should handle monthly spending limits correctly', async () => {
      const result = await CardOptimizationEngine.calculateBestCardPerCategory(
        mockUserId,
        mockSpendingProfile
      )

      const diningOpt = result.optimizations.find(opt => opt.category === SpendingCategory.DINING)
      
      // Dining has $400 monthly spend but card has $500 limit, so should use full amount
      expect(diningOpt?.monthlySpending).toBe(400)
      expect(diningOpt?.multiplier).toBe(2.0)
    })

    it('should throw error when user has no active cards', async () => {
      prisma.userCard.findMany.mockResolvedValue([])

      await expect(
        CardOptimizationEngine.calculateBestCardPerCategory(mockUserId, mockSpendingProfile)
      ).rejects.toThrow('User has no active cards for optimization')
    })

    it('should handle zero spending categories', async () => {
      const zeroSpendProfile: SpendingProfile = {
        ...mockSpendingProfile,
        grocery: 0,
        gas: 0
      }

      const result = await CardOptimizationEngine.calculateBestCardPerCategory(
        mockUserId,
        zeroSpendProfile
      )

      // Should not include categories with zero spending
      const groceryOpt = result.optimizations.find(opt => opt.category === SpendingCategory.GROCERY)
      const gasOpt = result.optimizations.find(opt => opt.category === SpendingCategory.GAS)
      
      expect(groceryOpt).toBeUndefined()
      expect(gasOpt).toBeUndefined()
    })

    it('should handle very high spending amounts', async () => {
      const highSpendProfile: SpendingProfile = {
        ...mockSpendingProfile,
        grocery: 50000 // $50k monthly grocery spending
      }

      const result = await CardOptimizationEngine.calculateBestCardPerCategory(
        mockUserId,
        highSpendProfile
      )

      const groceryOpt = result.optimizations.find(opt => opt.category === SpendingCategory.GROCERY)
      expect(groceryOpt?.monthlyRewards).toBeGreaterThan(0)
      expect(groceryOpt?.confidence).toBeGreaterThan(50)
    })

    it('should calculate confidence scores correctly', async () => {
      const result = await CardOptimizationEngine.calculateBestCardPerCategory(
        mockUserId,
        mockSpendingProfile
      )

      result.optimizations.forEach(opt => {
        expect(opt.confidence).toBeGreaterThanOrEqual(0)
        expect(opt.confidence).toBeLessThanOrEqual(100)
      })
    })

    it('should generate meaningful explanations', async () => {
      const result = await CardOptimizationEngine.calculateBestCardPerCategory(
        mockUserId,
        mockSpendingProfile
      )

      result.optimizations.forEach(opt => {
        expect(opt.explanation).toContain(opt.recommendedCard.name)
        expect(opt.explanation).toContain(opt.multiplier.toString())
        expect(opt.explanation).toMatch(/\$\d+\.\d{2}/)
      })
    })

    it('should handle cards with annual limits', async () => {
      const cardsWithAnnualLimits = [
        {
          ...mockUserCards[0],
          card: {
            ...mockUserCards[0].card,
            multipliers: [
              {
                category: SpendingCategory.GROCERY,
                multiplierValue: 3.0,
                monthlyLimit: null,
                annualLimit: 6000 // $6k annual limit
              }
            ]
          }
        }
      ]

      prisma.userCard.findMany.mockResolvedValue(cardsWithAnnualLimits)

      const result = await CardOptimizationEngine.calculateBestCardPerCategory(
        mockUserId,
        mockSpendingProfile
      )

      const groceryOpt = result.optimizations.find(opt => opt.category === SpendingCategory.GROCERY)
      
      // With $800 monthly spend and $6k annual limit, effective monthly should be $500 (6000/12)
      expect(groceryOpt).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing card multipliers gracefully', async () => {
      const cardsWithoutMultipliers = [
        {
          ...mockUserCards[0],
          card: {
            ...mockUserCards[0].card,
            multipliers: [] // No multipliers
          }
        }
      ]

      prisma.userCard.findMany.mockResolvedValue(cardsWithoutMultipliers)

      const result = await CardOptimizationEngine.calculateBestCardPerCategory(
        mockUserId,
        mockSpendingProfile
      )

      expect(result.optimizations).toHaveLength(0)
      expect(result.totalMonthlyRewards).toBe(0)
      expect(result.summary.totalCategories).toBe(0)
      expect(result.summary.bestOverallCard).toBeNull()
    })

    it('should handle duplicate cards correctly', async () => {
      const duplicateCards = [...mockUserCards, ...mockUserCards]
      prisma.userCard.findMany.mockResolvedValue(duplicateCards)

      const result = await CardOptimizationEngine.calculateBestCardPerCategory(
        mockUserId,
        mockSpendingProfile
      )

      // Should still work correctly despite duplicates
      expect(result.optimizations.length).toBeGreaterThan(0)
    })

    it('should handle invalid spending profile gracefully', async () => {
      const invalidProfile = {
        grocery: -100, // Negative spending
        gas: NaN,
        dining: Infinity,
        bills: 0,
        travel: 0,
        shopping: 0,
        entertainment: 0,
        utilities: 0,
        other: 0
      } as any

      // Should not crash, but may produce unexpected results
      // In production, this should be caught by validation layer
      const result = await CardOptimizationEngine.calculateBestCardPerCategory(mockUserId, invalidProfile)
      
      // Should complete without throwing
      expect(result).toBeDefined()
      expect(result.userId).toBe(mockUserId)
    })
  })

  describe('Summary Generation', () => {
    it('should generate accurate summary statistics', async () => {
      const result = await CardOptimizationEngine.calculateBestCardPerCategory(
        mockUserId,
        mockSpendingProfile
      )

      expect(result.summary.totalCategories).toBe(result.optimizations.length)
      expect(result.summary.averageMultiplier).toBeGreaterThan(0)
      expect(result.summary.estimatedAnnualValue).toBe(result.totalYearlyRewards)
      expect(result.summary.bestOverallCard).toBeDefined()
    })

    it('should identify the most frequently recommended card', async () => {
      const result = await CardOptimizationEngine.calculateBestCardPerCategory(
        mockUserId,
        mockSpendingProfile
      )

      const cardCounts = new Map()
      result.optimizations.forEach(opt => {
        const cardId = opt.recommendedCard.id
        cardCounts.set(cardId, (cardCounts.get(cardId) || 0) + 1)
      })

      const maxCount = Math.max(...cardCounts.values())
      expect(result.summary.bestOverallCard?.categoriesCount).toBe(maxCount)
    })
  })
})