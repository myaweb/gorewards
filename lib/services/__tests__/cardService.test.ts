import { CardService } from '../cardService'
import { PointType } from '@prisma/client'

// Mock Prisma
jest.mock('../../prisma', () => ({
  prisma: {
    card: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn()
    },
    cardBonus: {
      count: jest.fn()
    },
    cardMultiplier: {
      count: jest.fn()
    }
  }
}))

const { prisma } = require('../../prisma')

describe('CardService', () => {
  const mockCard = {
    id: 'card-1',
    name: 'Test Rewards Card',
    bank: 'TD',
    network: 'Visa',
    annualFee: { toString: () => '120' },
    baseRewardRate: { toString: () => '0.01' },
    imageUrl: '/test-card.jpg',
    affiliateLink: '/affiliate-link',
    slug: 'test-rewards-card',
    features: ['No foreign transaction fees'],
    eligibility: ['Minimum income $60,000'],
    createdAt: new Date(),
    updatedAt: new Date(),
    bonuses: [
      {
        id: 'bonus-1',
        bonusPoints: 25000,
        pointType: PointType.AEROPLAN,
        minimumSpendAmount: { toString: () => '2000' },
        spendPeriodMonths: 3,
        description: 'Welcome bonus',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        estimatedValue: { toString: () => '300' }
      }
    ],
    multipliers: [
      {
        id: 'mult-1',
        category: 'GROCERY',
        multiplierValue: { toString: () => '2.0' },
        description: '2x points on grocery',
        monthlyLimit: { toString: () => '1000' },
        annualLimit: null,
        validFrom: new Date(),
        validUntil: null
      }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllCardsWithDetails', () => {
    it('should fetch all active cards with details', async () => {
      prisma.card.findMany.mockResolvedValue([mockCard])

      const result = await CardService.getAllCardsWithDetails()

      expect(prisma.card.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          bonuses: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          },
          multipliers: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { name: 'asc' }
      })

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Test Rewards Card')
      expect(result[0].annualFee).toBe(120)
      expect(result[0].bonuses).toHaveLength(1)
      expect(result[0].multipliers).toHaveLength(1)
    })

    it('should handle empty results', async () => {
      prisma.card.findMany.mockResolvedValue([])

      const result = await CardService.getAllCardsWithDetails()

      expect(result).toHaveLength(0)
    })

    it('should transform decimal fields correctly', async () => {
      prisma.card.findMany.mockResolvedValue([mockCard])

      const result = await CardService.getAllCardsWithDetails()

      expect(typeof result[0].annualFee).toBe('number')
      expect(typeof result[0].baseRewardRate).toBe('number')
      expect(typeof result[0].bonuses[0].minimumSpendAmount).toBe('number')
      expect(typeof result[0].multipliers[0].multiplierValue).toBe('number')
    })
  })

  describe('getCardsByPointType', () => {
    it('should filter cards by point type', async () => {
      prisma.card.findMany.mockResolvedValue([mockCard])

      const result = await CardService.getCardsByPointType(PointType.AEROPLAN)

      expect(prisma.card.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          bonuses: {
            some: {
              pointType: PointType.AEROPLAN,
              isActive: true
            }
          }
        },
        include: {
          bonuses: {
            where: {
              pointType: PointType.AEROPLAN,
              isActive: true
            },
            orderBy: { createdAt: 'desc' }
          },
          multipliers: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      expect(result).toHaveLength(1)
      expect(result[0].bonuses[0].pointType).toBe(PointType.AEROPLAN)
    })

    it('should handle point types with no matching cards', async () => {
      prisma.card.findMany.mockResolvedValue([])

      const result = await CardService.getCardsByPointType(PointType.CASHBACK)

      expect(result).toHaveLength(0)
    })
  })

  describe('getCardById', () => {
    it('should fetch a single card by ID', async () => {
      prisma.card.findUnique.mockResolvedValue(mockCard)

      const result = await CardService.getCardById('card-1')

      expect(prisma.card.findUnique).toHaveBeenCalledWith({
        where: { id: 'card-1' },
        include: {
          bonuses: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          },
          multipliers: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      expect(result).toBeDefined()
      expect(result?.id).toBe('card-1')
    })

    it('should return null for non-existent card', async () => {
      prisma.card.findUnique.mockResolvedValue(null)

      const result = await CardService.getCardById('non-existent')

      expect(result).toBeNull()
    })

    it('should handle invalid card ID format', async () => {
      prisma.card.findUnique.mockResolvedValue(null)

      const result = await CardService.getCardById('')

      expect(result).toBeNull()
    })
  })

  describe('searchCards', () => {
    it('should search cards by name', async () => {
      prisma.card.findMany.mockResolvedValue([mockCard])

      const result = await CardService.searchCards('Test')

      expect(prisma.card.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [
            {
              name: {
                contains: 'Test',
                mode: 'insensitive'
              }
            },
            {
              bank: {
                contains: 'Test',
                mode: 'insensitive'
              }
            }
          ]
        },
        include: {
          bonuses: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          },
          multipliers: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { name: 'asc' }
      })

      expect(result).toHaveLength(1)
    })

    it('should search cards by bank', async () => {
      prisma.card.findMany.mockResolvedValue([mockCard])

      const result = await CardService.searchCards('TD')

      expect(result).toHaveLength(1)
      expect(result[0].bank).toBe('TD')
    })

    it('should handle empty search query', async () => {
      prisma.card.findMany.mockResolvedValue([])

      const result = await CardService.searchCards('')

      expect(result).toHaveLength(0)
    })

    it('should be case insensitive', async () => {
      prisma.card.findMany.mockResolvedValue([mockCard])

      const result = await CardService.searchCards('td')

      expect(prisma.card.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                bank: {
                  contains: 'td',
                  mode: 'insensitive'
                }
              })
            ])
          })
        })
      )
    })
  })

  describe('getTopBonusCards', () => {
    it('should return top bonus cards sorted by bonus points', async () => {
      const highBonusCard = {
        ...mockCard,
        id: 'card-2',
        bonuses: [{
          ...mockCard.bonuses[0],
          bonusPoints: 50000
        }]
      }

      prisma.card.findMany.mockResolvedValue([mockCard, highBonusCard])

      const result = await CardService.getTopBonusCards(PointType.AEROPLAN, 2)

      expect(result).toHaveLength(2)
      expect(result[0].bonuses[0].bonusPoints).toBe(50000)
      expect(result[1].bonuses[0].bonusPoints).toBe(25000)
    })

    it('should respect the limit parameter', async () => {
      prisma.card.findMany.mockResolvedValue([mockCard])

      await CardService.getTopBonusCards(PointType.AEROPLAN, 3)

      expect(prisma.card.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 3
        })
      )
    })

    it('should default to 5 cards when no limit specified', async () => {
      prisma.card.findMany.mockResolvedValue([mockCard])

      await CardService.getTopBonusCards(PointType.AEROPLAN)

      expect(prisma.card.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5
        })
      )
    })
  })

  describe('getCardStatistics', () => {
    it('should return comprehensive card statistics', async () => {
      prisma.card.count.mockResolvedValueOnce(100) // total cards
      prisma.card.count.mockResolvedValueOnce(85)  // active cards
      prisma.cardBonus.count.mockResolvedValueOnce(150) // total bonuses
      prisma.cardBonus.count.mockResolvedValueOnce(120) // active bonuses
      prisma.cardMultiplier.count.mockResolvedValueOnce(300) // total multipliers
      prisma.cardMultiplier.count.mockResolvedValueOnce(250) // active multipliers
      
      prisma.card.groupBy.mockResolvedValueOnce([
        { bank: 'TD', _count: { bank: 20 } },
        { bank: 'RBC', _count: { bank: 15 } }
      ])
      
      prisma.card.groupBy.mockResolvedValueOnce([
        { network: 'Visa', _count: { network: 40 } },
        { network: 'Mastercard', _count: { network: 30 } }
      ])

      const result = await CardService.getCardStatistics()

      expect(result.cards.total).toBe(100)
      expect(result.cards.active).toBe(85)
      expect(result.cards.inactive).toBe(15)
      expect(result.bonuses.total).toBe(150)
      expect(result.bonuses.active).toBe(120)
      expect(result.multipliers.total).toBe(300)
      expect(result.multipliers.active).toBe(250)
      expect(result.distribution.byBank).toHaveLength(2)
      expect(result.distribution.byNetwork).toHaveLength(2)
    })

    it('should handle zero statistics gracefully', async () => {
      prisma.card.count.mockResolvedValue(0)
      prisma.cardBonus.count.mockResolvedValue(0)
      prisma.cardMultiplier.count.mockResolvedValue(0)
      prisma.card.groupBy.mockResolvedValue([])

      const result = await CardService.getCardStatistics()

      expect(result.cards.total).toBe(0)
      expect(result.cards.active).toBe(0)
      expect(result.distribution.byBank).toHaveLength(0)
      expect(result.distribution.byNetwork).toHaveLength(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      prisma.card.findMany.mockRejectedValue(new Error('Database connection failed'))

      await expect(CardService.getAllCardsWithDetails()).rejects.toThrow('Database connection failed')
    })

    it('should handle malformed data gracefully', async () => {
      const malformedCard = {
        ...mockCard,
        annualFee: { toString: () => 'invalid' },
        bonuses: [{
          ...mockCard.bonuses[0],
          minimumSpendAmount: { toString: () => 'NaN' }
        }]
      }

      prisma.card.findMany.mockResolvedValue([malformedCard])

      const result = await CardService.getAllCardsWithDetails()

      // Should handle parsing errors gracefully
      expect(result).toHaveLength(1)
      expect(isNaN(result[0].annualFee)).toBe(true)
    })
  })
})