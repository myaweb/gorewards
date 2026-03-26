import { prisma } from '../prisma'
import type { CardWithDetails } from '../types/spending'
import type { PointType } from '@prisma/client'

/**
 * Enhanced CardService: Database operations for cards and related data
 * Now uses the production-ready normalized database structure
 */
export class CardService {
  /**
   * Fetch all active cards with their bonuses and multipliers
   */
  static async getAllCardsWithDetails(): Promise<CardWithDetails[]> {
    const cards = await prisma.card.findMany({
      where: {
        isActive: true,
      },
      include: {
        bonuses: {
          where: {
            isActive: true
          },
          orderBy: { createdAt: 'desc' }
        },
        multipliers: {
          where: {
            isActive: true
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: {
        name: 'asc',
      },
    })

    return cards.map(card => this.transformCardToDetails(card))
  }

  /**
   * Fetch cards by point type with current offers
   */
  static async getCardsByPointType(pointType: PointType): Promise<CardWithDetails[]> {
    const cards = await prisma.card.findMany({
      where: {
        isActive: true,
        bonuses: {
          some: {
            pointType,
            isActive: true
          },
        },
      },
      include: {
        bonuses: {
          where: {
            pointType,
            isActive: true
          },
          orderBy: { createdAt: 'desc' }
        },
        multipliers: {
          where: {
            isActive: true
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    })

    return cards.map(card => this.transformCardToDetails(card))
  }

  /**
   * Fetch a single card by ID with details
   */
  static async getCardById(cardId: string): Promise<CardWithDetails | null> {
    const card = await prisma.card.findUnique({
      where: {
        id: cardId,
      },
      include: {
        bonuses: {
          where: {
            isActive: true
          },
          orderBy: { createdAt: 'desc' }
        },
        multipliers: {
          where: {
            isActive: true
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    })

    if (!card) return null

    return this.transformCardToDetails(card)
  }

  /**
   * Search cards by name or bank
   */
  static async searchCards(query: string): Promise<CardWithDetails[]> {
    const cards = await prisma.card.findMany({
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            bank: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        bonuses: {
          where: {
            isActive: true
          },
          orderBy: { createdAt: 'desc' }
        },
        multipliers: {
          where: {
            isActive: true
          },
          orderBy: { createdAt: 'desc' }
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return cards.map(card => this.transformCardToDetails(card))
  }

  /**
   * Get top bonus cards by point type
   */
  static async getTopBonusCards(pointType: PointType, limit: number = 5): Promise<CardWithDetails[]> {
    const cards = await prisma.card.findMany({
      where: {
        isActive: true,
        bonuses: {
          some: {
            pointType,
            isActive: true
          },
        },
      },
      include: {
        bonuses: {
          where: {
            pointType,
            isActive: true
          },
          orderBy: { bonusPoints: 'desc' }
        },
        multipliers: {
          where: {
            isActive: true
          },
          orderBy: { createdAt: 'desc' }
        },
      },
      take: limit,
    })

    return cards
      .map(card => this.transformCardToDetails(card))
      .sort((a, b) => {
        const aBonus = a.bonuses.find(bonus => bonus.pointType === pointType)
        const bBonus = b.bonuses.find(bonus => bonus.pointType === pointType)
        return (bBonus?.bonusPoints || 0) - (aBonus?.bonusPoints || 0)
      })
  }

  /**
   * Get database statistics
   */
  static async getCardStatistics() {
    const [
      totalCards,
      activeCards,
      totalBonuses,
      activeBonuses,
      totalMultipliers,
      activeMultipliers,
      cardsByBank,
      cardsByNetwork
    ] = await Promise.all([
      prisma.card.count(),
      prisma.card.count({ where: { isActive: true } }),
      prisma.cardBonus.count(),
      prisma.cardBonus.count({ where: { isActive: true } }),
      prisma.cardMultiplier.count(),
      prisma.cardMultiplier.count({ where: { isActive: true } }),
      prisma.card.groupBy({
        by: ['bank'],
        where: { isActive: true },
        _count: { bank: true },
        orderBy: { _count: { bank: 'desc' } }
      }),
      prisma.card.groupBy({
        by: ['network'],
        where: { isActive: true },
        _count: { network: true },
        orderBy: { _count: { network: 'desc' } }
      })
    ])

    return {
      cards: {
        total: totalCards,
        active: activeCards,
        inactive: totalCards - activeCards
      },
      bonuses: {
        total: totalBonuses,
        active: activeBonuses
      },
      multipliers: {
        total: totalMultipliers,
        active: activeMultipliers
      },
      distribution: {
        byBank: cardsByBank.map(item => ({
          bank: item.bank,
          count: item._count.bank
        })),
        byNetwork: cardsByNetwork.map(item => ({
          network: item.network,
          count: item._count.network
        }))
      }
    }
  }

  /**
   * Transform database card to CardWithDetails format
   */
  private static transformCardToDetails(card: any): CardWithDetails {
    return {
      id: card.id,
      name: card.name,
      bank: card.bank,
      network: card.network,
      annualFee: parseFloat(card.annualFee.toString()),
      baseRewardRate: parseFloat(card.baseRewardRate.toString()),
      bonuses: card.bonuses.map((bonus: any) => ({
        id: bonus.id,
        bonusPoints: bonus.bonusPoints,
        pointType: bonus.pointType,
        minimumSpendAmount: parseFloat(bonus.minimumSpendAmount.toString()),
        spendPeriodMonths: bonus.spendPeriodMonths,
        description: bonus.description,
        validFrom: bonus.validFrom,
        validUntil: bonus.validUntil,
        estimatedValue: bonus.estimatedValue ? parseFloat(bonus.estimatedValue.toString()) : null
      })),
      multipliers: card.multipliers.map((multiplier: any) => ({
        id: multiplier.id,
        category: multiplier.category,
        multiplierValue: parseFloat(multiplier.multiplierValue.toString()),
        description: multiplier.description,
        monthlyLimit: multiplier.monthlyLimit ? parseFloat(multiplier.monthlyLimit.toString()) : null,
        annualLimit: multiplier.annualLimit ? parseFloat(multiplier.annualLimit.toString()) : null,
        validFrom: multiplier.validFrom,
        validUntil: multiplier.validUntil
      })),
      offers: [],
      imageUrl: card.imageUrl,
      affiliateLink: card.affiliateLink,
      slug: card.slug,
      features: card.features,
      eligibility: card.eligibility,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt
    }
  }
}