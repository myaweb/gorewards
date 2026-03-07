import { prisma } from '../prisma'
import type { CardWithDetails } from '../types/spending'
import type { PointType } from '@prisma/client'

/**
 * CardService: Database operations for cards and related data
 * Provides methods to fetch cards with their bonuses and multipliers
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
            isActive: true,
          },
        },
        multipliers: {
          where: {
            isActive: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return cards.map(card => this.transformCardToDetails(card))
  }

  /**
   * Fetch cards by point type
   */
  static async getCardsByPointType(pointType: PointType): Promise<CardWithDetails[]> {
    const cards = await prisma.card.findMany({
      where: {
        isActive: true,
        bonuses: {
          some: {
            pointType,
            isActive: true,
          },
        },
      },
      include: {
        bonuses: {
          where: {
            pointType,
            isActive: true,
          },
        },
        multipliers: {
          where: {
            isActive: true,
          },
        },
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
            isActive: true,
          },
        },
        multipliers: {
          where: {
            isActive: true,
          },
        },
      },
    })

    if (!card) return null

    return this.transformCardToDetails(card)
  }

  /**
   * Fetch cards by bank
   */
  static async getCardsByBank(bank: string): Promise<CardWithDetails[]> {
    const cards = await prisma.card.findMany({
      where: {
        bank,
        isActive: true,
      },
      include: {
        bonuses: {
          where: {
            isActive: true,
          },
        },
        multipliers: {
          where: {
            isActive: true,
          },
        },
      },
    })

    return cards.map(card => this.transformCardToDetails(card))
  }

  /**
   * Fetch cards by network (VISA, MASTERCARD, AMEX, etc.)
   */
  static async getCardsByNetwork(network: string): Promise<CardWithDetails[]> {
    const cards = await prisma.card.findMany({
      where: {
        network: network as any,
        isActive: true,
      },
      include: {
        bonuses: {
          where: {
            isActive: true,
          },
        },
        multipliers: {
          where: {
            isActive: true,
          },
        },
      },
    })

    return cards.map(card => this.transformCardToDetails(card))
  }

  /**
   * Search cards by name
   */
  static async searchCards(query: string): Promise<CardWithDetails[]> {
    const cards = await prisma.card.findMany({
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            bank: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        bonuses: {
          where: {
            isActive: true,
          },
        },
        multipliers: {
          where: {
            isActive: true,
          },
        },
      },
    })

    return cards.map(card => this.transformCardToDetails(card))
  }

  /**
   * Get cards with highest bonuses for a specific point type
   */
  static async getTopBonusCards(
    pointType: PointType,
    limit: number = 5
  ): Promise<CardWithDetails[]> {
    const cards = await prisma.card.findMany({
      where: {
        isActive: true,
        bonuses: {
          some: {
            pointType,
            isActive: true,
          },
        },
      },
      include: {
        bonuses: {
          where: {
            pointType,
            isActive: true,
          },
          orderBy: {
            bonusPoints: 'desc',
          },
          take: 1,
        },
        multipliers: {
          where: {
            isActive: true,
          },
        },
      },
      take: limit,
    })

    // Sort by highest bonus
    const sorted = cards.sort((a, b) => {
      const aBonus = a.bonuses[0]?.bonusPoints || 0
      const bBonus = b.bonuses[0]?.bonusPoints || 0
      return bBonus - aBonus
    })

    return sorted.map(card => this.transformCardToDetails(card))
  }

  /**
   * Transform Prisma card to CardWithDetails format
   */
  private static transformCardToDetails(card: any): CardWithDetails {
    return {
      id: card.id,
      name: card.name,
      bank: card.bank,
      network: card.network,
      annualFee: parseFloat(card.annualFee.toString()),
      bonuses: card.bonuses.map((bonus: any) => ({
        id: bonus.id,
        bonusPoints: bonus.bonusPoints,
        pointType: bonus.pointType,
        minimumSpendAmount: parseFloat(bonus.minimumSpendAmount.toString()),
        spendPeriodMonths: bonus.spendPeriodMonths,
      })),
      multipliers: card.multipliers.map((multiplier: any) => ({
        id: multiplier.id,
        category: multiplier.category,
        multiplierValue: parseFloat(multiplier.multiplierValue.toString()),
      })),
    }
  }

  /**
   * Get statistics about available cards
   */
  static async getCardStatistics() {
    const [
      totalCards,
      cardsByNetwork,
      cardsByBank,
      averageAnnualFee,
      totalBonuses,
    ] = await Promise.all([
      prisma.card.count({ where: { isActive: true } }),
      prisma.card.groupBy({
        by: ['network'],
        where: { isActive: true },
        _count: true,
      }),
      prisma.card.groupBy({
        by: ['bank'],
        where: { isActive: true },
        _count: true,
      }),
      prisma.card.aggregate({
        where: { isActive: true },
        _avg: {
          annualFee: true,
        },
      }),
      prisma.cardBonus.count({ where: { isActive: true } }),
    ])

    return {
      totalCards,
      cardsByNetwork,
      cardsByBank,
      averageAnnualFee: averageAnnualFee._avg.annualFee
        ? parseFloat(averageAnnualFee._avg.annualFee.toString())
        : 0,
      totalBonuses,
    }
  }
}
