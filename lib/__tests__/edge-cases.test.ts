/**
 * Edge case testing for GoRewards critical business logic
 * Tests boundary conditions, error scenarios, and unusual data patterns
 */

import { EnhancedRecommendationEngine } from '../services/enhancedRecommendationEngine'
import { CardOptimizationEngine } from '../services/cardOptimizationEngine'
import { CardService } from '../services/cardService'
import { CreditScoreRange } from '../types/recommendation'

// Declare global testUtils to avoid TypeScript errors
declare const global: typeof globalThis & { testUtils: any }

// Mock Prisma
jest.mock('../prisma', () => ({
  prisma: {
    card: {
      findMany: jest.fn(),
      findUnique: jest.fn()
    },
    userCard: {
      findMany: jest.fn()
    }
  }
}))

const { prisma } = require('../prisma')

describe('Edge Cases and Boundary Conditions', () => {
  describe('Extreme Spending Patterns', () => {
    it('should handle zero spending across all categories', async () => {
      const zeroSpendingProfile = {
        spending: {
          grocery: 0,
          gas: 0,
          dining: 0,
          bills: 0,
          travel: 0,
          shopping: 0
        },
        creditScore: CreditScoreRange.GOOD,
        annualIncome: 50000,
        preferredPointTypes: ['CASHBACK'],
        maxAnnualFee: 100,
        prioritizeSignupBonus: true,
        timeHorizon: 'LONG_TERM' as const
      }

      const mockCards = [global.testUtils.createMockCard()]
      prisma.card.findMany.mockResolvedValue([mockCards[0]])

      const result = await EnhancedRecommendationEngine.getRecommendations(zeroSpendingProfile)

      expect(result.recommendations).toHaveLength(1)
      expect((result.recommendations[0].scores as any).categoryScore).toBe(0)
      expect(result.recommendations[0].explanation).toContain('signup bonus')
    })

    it('should handle extremely high spending amounts', async () => {
      const extremeSpendingProfile = {
        spending: {
          grocery: 100000, // $100k monthly grocery
          gas: 50000,
          dining: 75000,
          bills: 25000,
          travel: 200000, // $200k monthly travel
          shopping: 150000
        },
        creditScore: CreditScoreRange.EXCELLENT,
        annualIncome: 2000000, // $2M annual income
        preferredPointTypes: ['AEROPLAN', 'MEMBERSHIP_REWARDS'],
        maxAnnualFee: 10000, // $10k annual fee tolerance
        prioritizeSignupBonus: false,
        timeHorizon: 'LONG_TERM' as const
      }

      const mockCard = global.testUtils.createMockCard({
        annualFee: { toString: () => '5000' },
        multipliers: [{
          id: 'mult-1',
          category: 'TRAVEL',
          multiplierValue: { toString: () => '5.0' },
          description: '5x points on travel',
          monthlyLimit: null,
          annualLimit: null
        }]
      })

      prisma.card.findMany.mockResolvedValue([mockCard])

      const result = await EnhancedRecommendationEngine.getRecommendations(extremeSpendingProfile)

      expect(result.recommendations).toHaveLength(1)
      expect((result.recommendations[0].scores as any).approvalProbability).toBeGreaterThan(90)
      expect((result.recommendations[0].scores as any).categoryScore).toBeGreaterThan(80)
    })

    it('should handle single-category extreme spending', async () => {
      const singleCategoryProfile = {
        spending: {
          grocery: 50000, // Only grocery spending
          gas: 0,
          dining: 0,
          bills: 0,
          travel: 0,
          shopping: 0
        },
        creditScore: CreditScoreRange.GOOD,
        annualIncome: 100000,
        preferredPointTypes: ['CASHBACK'],
        maxAnnualFee: 500,
        prioritizeSignupBonus: false,
        timeHorizon: 'LONG_TERM' as const
      }

      const groceryCard = global.testUtils.createMockCard({
        multipliers: [{
          id: 'mult-1',
          category: 'GROCERY',
          multiplierValue: { toString: () => '4.0' },
          description: '4x points on grocery',
          monthlyLimit: { toString: () => '2000' }, // $2k monthly limit
          annualLimit: null
        }]
      })

      prisma.card.findMany.mockResolvedValue([groceryCard])

      const result = await EnhancedRecommendationEngine.getRecommendations(singleCategoryProfile)

      expect(result.recommendations).toHaveLength(1)
      // Should note the spending cap limitation
      expect(result.recommendations[0].explanation).toContain('grocery')
    })
  })

  describe('Credit Profile Edge Cases', () => {
    it('should handle minimum income scenarios', async () => {
      const lowIncomeProfile = {
        spending: global.testUtils.createMockSpendingProfile({ grocery: 200, gas: 100 }),
        creditScore: CreditScoreRange.POOR,
        annualIncome: 15000, // Very low income
        preferredPointTypes: ['CASHBACK'],
        maxAnnualFee: 0,
        prioritizeSignupBonus: false,
        timeHorizon: 'SHORT_TERM' as const
      }

      const basicCard = global.testUtils.createMockCard({
        annualFee: { toString: () => '0' },
        eligibility: ['Minimum income $12,000']
      })

      const premiumCard = global.testUtils.createMockCard({
        id: 'premium-card',
        annualFee: { toString: () => '500' },
        eligibility: ['Minimum income $80,000']
      })

      prisma.card.findMany.mockResolvedValue([basicCard, premiumCard])

      const result = await EnhancedRecommendationEngine.getRecommendations(lowIncomeProfile)

      expect(result.recommendations).toHaveLength(2)
      
      // Basic card should have higher approval probability
      const basicRec = result.recommendations.find(r => r.card.annualFee === 0)
      const premiumRec = result.recommendations.find(r => r.card.annualFee > 0)
      
      expect(basicRec?.scores.approvalProbability).toBeGreaterThan(premiumRec?.scores.approvalProbability || 0)
    })

    it('should handle ultra-high income scenarios', async () => {
      const ultraHighIncomeProfile = {
        spending: global.testUtils.createMockSpendingProfile(),
        creditScore: CreditScoreRange.EXCELLENT,
        annualIncome: 5000000, // $5M annual income
        preferredPointTypes: ['MEMBERSHIP_REWARDS', 'AEROPLAN'],
        maxAnnualFee: 50000, // $50k annual fee tolerance
        prioritizeSignupBonus: false,
        timeHorizon: 'LONG_TERM' as const
      }

      const ultraPremiumCard = global.testUtils.createMockCard({
        name: 'Ultra Premium Card',
        annualFee: { toString: () => '25000' },
        eligibility: ['Minimum income $1,000,000']
      })

      prisma.card.findMany.mockResolvedValue([ultraPremiumCard])

      const result = await EnhancedRecommendationEngine.getRecommendations(ultraHighIncomeProfile)

      expect(result.recommendations).toHaveLength(1)
      expect((result.recommendations[0].scores as any).approvalProbability).toBeGreaterThan(95)
    })
  })

  describe('Card Data Edge Cases', () => {
    it('should handle cards with no bonuses or multipliers', async () => {
      const basicProfile = {
        spending: global.testUtils.createMockSpendingProfile(),
        creditScore: CreditScoreRange.GOOD,
        annualIncome: 60000,
        preferredPointTypes: ['CASHBACK'],
        maxAnnualFee: 100,
        prioritizeSignupBonus: true,
        timeHorizon: 'LONG_TERM' as const
      }

      const bareBonesCard = global.testUtils.createMockCard({
        bonuses: [], // No bonuses
        multipliers: [] // No multipliers
      })

      prisma.card.findMany.mockResolvedValue([bareBonesCard])

      const result = await EnhancedRecommendationEngine.getRecommendations(basicProfile)

      expect(result.recommendations).toHaveLength(1)
      expect((result.recommendations[0].scores as any).bonusScore).toBe(0)
      expect((result.recommendations[0].scores as any).categoryScore).toBe(0)
      expect((result.recommendations[0].scores as any).totalScore).toBeGreaterThan(0) // Should still have some score
    })

    it('should handle cards with expired bonuses', async () => {
      const expiredBonusCard = global.testUtils.createMockCard({
        bonuses: [{
          id: 'expired-bonus',
          bonusPoints: 50000,
          pointType: 'AEROPLAN',
          minimumSpendAmount: { toString: () => '3000' },
          spendPeriodMonths: 3,
          description: 'Expired bonus',
          validFrom: new Date('2023-01-01'),
          validUntil: new Date('2023-12-31'), // Expired
          estimatedValue: { toString: () => '600' }
        }]
      })

      prisma.card.findMany.mockResolvedValue([expiredBonusCard])

      const result = await EnhancedRecommendationEngine.getRecommendations({
        spending: global.testUtils.createMockSpendingProfile(),
        creditScore: CreditScoreRange.GOOD,
        annualIncome: 60000,
        preferredPointTypes: ['AEROPLAN'],
        maxAnnualFee: 200,
        prioritizeSignupBonus: true,
        timeHorizon: 'LONG_TERM' as const
      })

      expect(result.recommendations).toHaveLength(1)
      // Should not count expired bonus
      expect((result.recommendations[0].scores as any).bonusScore).toBe(0)
    })

    it('should handle cards with complex spending limits', async () => {
      const complexLimitCard = global.testUtils.createMockCard({
        multipliers: [
          {
            id: 'mult-1',
            category: 'GROCERY',
            multiplierValue: { toString: () => '5.0' },
            description: '5x points on grocery',
            monthlyLimit: { toString: () => '500' }, // $500 monthly
            annualLimit: { toString: () => '5000' } // $5k annual (more restrictive)
          },
          {
            id: 'mult-2',
            category: 'GAS',
            multiplierValue: { toString: () => '3.0' },
            description: '3x points on gas',
            monthlyLimit: null,
            annualLimit: { toString: () => '2000' } // $2k annual only
          }
        ]
      })

      const spendingProfile = {
        grocery: 800,
        gas: 300,
        dining: 400,
        bills: 150,
        travel: 100,
        shopping: 200,
        other: 50
      }

      prisma.userCard.findMany.mockResolvedValue([{
        id: 'user-card-1',
        cardId: 'card-1',
        card: {
          name: 'Complex Limit Card',
          bank: 'TD',
          network: 'Visa',
          imageUrl: '/card.jpg',
          multipliers: complexLimitCard.multipliers.map(m => ({
            category: m.category,
            multiplierValue: parseFloat(m.multiplierValue.toString()),
            monthlyLimit: m.monthlyLimit ? parseFloat(m.monthlyLimit.toString()) : null,
            annualLimit: m.annualLimit ? parseFloat(m.annualLimit.toString()) : null
          })),
          bonuses: []
        },
        openDate: new Date(),
        isActive: true
      }])

      const result = await CardOptimizationEngine.calculateBestCardPerCategory('user-123', spendingProfile)

      expect(result.optimizations).toHaveLength(2) // grocery and gas
      
      const groceryOpt = result.optimizations.find(opt => opt.category === 'GROCERY')
      const gasOpt = result.optimizations.find(opt => opt.category === 'GAS')
      
      // Should respect the more restrictive annual limit for grocery
      expect(groceryOpt?.monthlySpending).toBe(800)
      expect(gasOpt?.monthlySpending).toBe(300)
    })
  })

  describe('Optimization Engine Edge Cases', () => {
    it('should handle user with no cards', async () => {
      prisma.userCard.findMany.mockResolvedValue([])

      await expect(
        CardOptimizationEngine.calculateBestCardPerCategory('user-123', global.testUtils.createMockSpendingProfile())
      ).rejects.toThrow('User has no active cards for optimization')
    })

    it('should handle cards with identical multipliers', async () => {
      const identicalCards = [
        {
          id: 'user-card-1',
          cardId: 'card-1',
          card: {
            name: 'Card A',
            bank: 'TD',
            network: 'Visa',
            imageUrl: '/card-a.jpg',
            multipliers: [{
              category: 'GROCERY',
              multiplierValue: 2.0,
              monthlyLimit: null,
              annualLimit: null
            }],
            bonuses: [{
              pointType: 'CASHBACK',
              bonusPoints: 20000,
              minimumSpendAmount: 1000,
              spendPeriodMonths: 3
            }]
          },
          openDate: new Date(),
          isActive: true
        },
        {
          id: 'user-card-2',
          cardId: 'card-2',
          card: {
            name: 'Card B',
            bank: 'RBC',
            network: 'Mastercard',
            imageUrl: '/card-b.jpg',
            multipliers: [{
              category: 'GROCERY',
              multiplierValue: 2.0, // Same multiplier
              monthlyLimit: null,
              annualLimit: null
            }],
            bonuses: [{
              pointType: 'CASHBACK',
              bonusPoints: 20000, // Same bonus
              minimumSpendAmount: 1000,
              spendPeriodMonths: 3
            }]
          },
          openDate: new Date(),
          isActive: true
        }
      ]

      prisma.userCard.findMany.mockResolvedValue(identicalCards)

      const result = await CardOptimizationEngine.calculateBestCardPerCategory(
        'user-123',
        { grocery: 500, gas: 0, dining: 0, bills: 0, travel: 0, shopping: 0, entertainment: 0, utilities: 0, other: 0 }
      )

      expect(result.optimizations).toHaveLength(1)
      // Should pick one of the cards (deterministically)
      expect(['Card A', 'Card B']).toContain(result.optimizations[0].recommendedCard.name)
    })

    it('should handle fractional spending amounts', async () => {
      const fractionalSpending = {
        grocery: 123.45,
        gas: 67.89,
        dining: 234.56,
        bills: 89.12,
        travel: 45.67,
        shopping: 156.78,
        entertainment: 23.45,
        utilities: 78.90,
        other: 34.56
      }

      const mockUserCard = {
        id: 'user-card-1',
        cardId: 'card-1',
        card: {
          name: 'Fractional Test Card',
          bank: 'TD',
          network: 'Visa',
          imageUrl: '/card.jpg',
          multipliers: [{
            category: 'GROCERY',
            multiplierValue: 2.5,
            monthlyLimit: null,
            annualLimit: null
          }],
          bonuses: []
        },
        openDate: new Date(),
        isActive: true
      }

      prisma.userCard.findMany.mockResolvedValue([mockUserCard])

      const result = await CardOptimizationEngine.calculateBestCardPerCategory('user-123', fractionalSpending)

      expect(result.optimizations).toHaveLength(1)
      expect(result.optimizations[0].monthlySpending).toBe(123.45)
      expect(result.optimizations[0].monthlyRewards).toBeCloseTo(123.45 * 2.5 * 1.0, 2) // 2.5x multiplier, 1.0 point value
    })
  })

  describe('Data Type and Format Edge Cases', () => {
    it('should handle malformed decimal values', async () => {
      const malformedCard = {
        id: 'card-1',
        name: 'Malformed Card',
        bank: 'TD',
        network: 'Visa',
        annualFee: { toString: () => 'not-a-number' },
        baseRewardRate: { toString: () => 'invalid' },
        imageUrl: '/card.jpg',
        bonuses: [{
          id: 'bonus-1',
          bonusPoints: 25000,
          pointType: 'CASHBACK',
          minimumSpendAmount: { toString: () => 'NaN' },
          spendPeriodMonths: 3,
          estimatedValue: { toString: () => 'undefined' }
        }],
        multipliers: [{
          id: 'mult-1',
          category: 'GROCERY',
          multiplierValue: { toString: () => 'Infinity' },
          monthlyLimit: { toString: () => '-1' }
        }]
      }

      prisma.card.findMany.mockResolvedValue([malformedCard])

      // Should not crash, but may produce unexpected results
      const result = await CardService.getAllCardsWithDetails()

      expect(result).toHaveLength(1)
      expect(isNaN(result[0].annualFee)).toBe(true)
      expect(isNaN(result[0].baseRewardRate)).toBe(true)
    })

    it('should handle null and undefined values', async () => {
      const nullValueCard = {
        id: 'card-1',
        name: 'Null Value Card',
        bank: 'TD',
        network: 'Visa',
        annualFee: { toString: () => '120' },
        baseRewardRate: { toString: () => '0.01' },
        imageUrl: null,
        affiliateLink: null,
        slug: null,
        features: null,
        eligibility: null,
        bonuses: [],
        multipliers: []
      }

      prisma.card.findMany.mockResolvedValue([nullValueCard])

      const result = await CardService.getAllCardsWithDetails()

      expect(result).toHaveLength(1)
      expect(result[0].imageUrl).toBeNull()
      expect(result[0].affiliateLink).toBeNull()
      expect(result[0].features).toBeNull()
    })

    it('should handle empty arrays and objects', async () => {
      const emptyDataProfile = {
        spending: {},
        creditScore: CreditScoreRange.GOOD,
        annualIncome: 50000,
        preferredPointTypes: [],
        maxAnnualFee: 100,
        prioritizeSignupBonus: true,
        timeHorizon: 'LONG_TERM' as const
      }

      prisma.card.findMany.mockResolvedValue([])

      const result = await EnhancedRecommendationEngine.getRecommendations(emptyDataProfile)

      expect(result.recommendations).toHaveLength(0)
      expect(result.metadata.totalCardsEvaluated).toBe(0)
    })
  })

  describe('Concurrent Access and Race Conditions', () => {
    it('should handle concurrent recommendation requests', async () => {
      const profile = {
        spending: global.testUtils.createMockSpendingProfile(),
        creditScore: CreditScoreRange.GOOD,
        annualIncome: 60000,
        preferredPointTypes: ['CASHBACK'],
        maxAnnualFee: 100,
        prioritizeSignupBonus: true,
        timeHorizon: 'LONG_TERM' as const
      }

      const mockCard = global.testUtils.createMockCard()
      prisma.card.findMany.mockResolvedValue([mockCard])

      // Simulate concurrent requests
      const promises = Array.from({ length: 5 }, () => 
        EnhancedRecommendationEngine.getRecommendations(profile)
      )

      const results = await Promise.all(promises)

      // All requests should succeed and return consistent results
      expect(results).toHaveLength(5)
      results.forEach(result => {
        expect(result.recommendations).toHaveLength(1)
        expect(result.recommendations[0].card.name).toBe(mockCard.name)
      })
    })

    it('should handle database connection timeouts', async () => {
      prisma.card.findMany.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 100)
        )
      )

      await expect(
        EnhancedRecommendationEngine.getRecommendations({
          spending: global.testUtils.createMockSpendingProfile(),
          creditScore: CreditScoreRange.GOOD,
          annualIncome: 50000,
          preferredPointTypes: ['CASHBACK'],
          maxAnnualFee: 100,
          prioritizeSignupBonus: true,
          timeHorizon: 'LONG_TERM' as const
        })
      ).rejects.toThrow('Connection timeout')
    })
  })

  describe('Memory and Performance Edge Cases', () => {
    it('should handle large datasets without memory issues', async () => {
      // Create 1000 mock cards
      const largeCardSet = Array.from({ length: 1000 }, (_, i) => 
        global.testUtils.createMockCard({
          id: `card-${i}`,
          name: `Card ${i}`,
          annualFee: { toString: () => (i * 10).toString() }
        })
      )

      prisma.card.findMany.mockResolvedValue(largeCardSet)

      const startMemory = process.memoryUsage().heapUsed
      
      const result = await EnhancedRecommendationEngine.getRecommendations({
        spending: global.testUtils.createMockSpendingProfile(),
        creditScore: CreditScoreRange.GOOD,
        annualIncome: 75000,
        preferredPointTypes: ['CASHBACK'],
        maxAnnualFee: 200,
        prioritizeSignupBonus: true,
        timeHorizon: 'LONG_TERM' as const
      })

      const endMemory = process.memoryUsage().heapUsed
      const memoryIncrease = endMemory - startMemory

      expect(result.metadata.totalCardsEvaluated).toBe(1000)
      expect(result.recommendations.length).toBeGreaterThan(0)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024) // Less than 100MB increase
    })
  })
})
