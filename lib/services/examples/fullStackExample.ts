/**
 * Full-stack example: Using RouteEngine with database
 * This demonstrates the complete flow from database to optimization
 */

import { RouteEngine } from '../routeEngine'
import { CardService } from '../cardService'
import type { SpendingProfile } from '../../types/spending'
import type { PointType } from '@prisma/client'

/**
 * Example: Calculate optimal roadmap using real database data
 */
export async function calculateRoadmapFromDatabase(
  spending: SpendingProfile,
  goalName: string,
  requiredPoints: number,
  pointType: PointType
) {
  try {
    // 1. Validate spending profile
    if (!RouteEngine.validateSpendingProfile(spending)) {
      throw new Error('Invalid spending profile: all values must be non-negative')
    }

    // 2. Fetch cards from database that match the point type
    console.log(`Fetching cards for point type: ${pointType}...`)
    const availableCards = await CardService.getCardsByPointType(pointType)

    if (availableCards.length === 0) {
      throw new Error(`No cards found for point type: ${pointType}`)
    }

    console.log(`Found ${availableCards.length} eligible cards`)

    // 3. Create goal object
    const goal = {
      id: 'temp-goal',
      name: goalName,
      requiredPoints,
      pointType,
    }

    // 4. Calculate optimal roadmap
    console.log('Calculating optimal roadmap...')
    const roadmap = RouteEngine.calculateOptimalRoadmap(
      spending,
      goal,
      availableCards
    )

    // 5. Return results with summary
    return {
      success: true,
      roadmap,
      summary: {
        goalName,
        requiredPoints,
        pointType,
        totalMonths: roadmap.totalMonths,
        goalAchieved: roadmap.goalAchieved,
        totalPointsEarned: roadmap.totalPointsEarned,
        cardsUsed: [...new Set(roadmap.steps.map(s => s.cardName))],
        efficiency: roadmap.efficiency,
      },
    }
  } catch (error) {
    console.error('Error calculating roadmap:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Example: Compare all available cards for a spending profile
 */
export async function compareAllCardsForSpending(
  spending: SpendingProfile,
  pointType: PointType,
  timeHorizonMonths: number = 12
) {
  try {
    // Fetch all cards for the point type
    const cards = await CardService.getCardsByPointType(pointType)

    if (cards.length < 2) {
      throw new Error('Need at least 2 cards to compare')
    }

    // Compare each pair of cards
    const comparisons = []

    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const comparison = RouteEngine.compareCards(
          cards[i],
          cards[j],
          spending,
          pointType,
          timeHorizonMonths
        )

        comparisons.push({
          card1: cards[i].name,
          card2: cards[j].name,
          betterCard: comparison.betterCard.name,
          card1Value: comparison.card1Value,
          card2Value: comparison.card2Value,
          difference: comparison.difference,
        })
      }
    }

    // Sort by difference (most significant comparisons first)
    comparisons.sort((a, b) => b.difference - a.difference)

    return {
      success: true,
      comparisons,
      totalCards: cards.length,
      totalComparisons: comparisons.length,
    }
  } catch (error) {
    console.error('Error comparing cards:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Example: Get recommendations for a user
 */
export async function getCardRecommendations(
  spending: SpendingProfile,
  pointType: PointType,
  maxAnnualFee?: number
) {
  try {
    // Fetch all cards for point type
    let cards = await CardService.getCardsByPointType(pointType)

    // Filter by annual fee if specified
    if (maxAnnualFee !== undefined) {
      cards = cards.filter(card => card.annualFee <= maxAnnualFee)
    }

    if (cards.length === 0) {
      throw new Error('No cards match the criteria')
    }

    // Calculate value for each card
    const cardValues = cards.map(card => {
      // Calculate monthly earning
      const categoryMap: Record<keyof SpendingProfile, string> = {
        grocery: 'GROCERY',
        gas: 'GAS',
        dining: 'DINING',
        recurring: 'RECURRING',
      }

      let monthlyPoints = 0
      const categoryBreakdown: Record<string, number> = {}

      for (const [category, amount] of Object.entries(spending) as [keyof SpendingProfile, number][]) {
        const multiplier = card.multipliers.find(
          m => m.category === categoryMap[category]
        )?.multiplierValue || 1

        const points = amount * multiplier
        monthlyPoints += points
        categoryBreakdown[category] = points
      }

      // Get best bonus
      const bestBonus = card.bonuses.reduce((best, current) => {
        return current.bonusPoints > (best?.bonusPoints || 0) ? current : best
      }, card.bonuses[0])

      // Calculate value score (bonus + 12 months of earning - fees)
      const yearlyPoints = monthlyPoints * 12
      const bonusPoints = bestBonus?.bonusPoints || 0
      const totalValue = bonusPoints + yearlyPoints - (card.annualFee * 10) // Assume 1 point = $0.01

      return {
        card,
        monthlyPoints,
        yearlyPoints,
        bonusPoints,
        totalValue,
        categoryBreakdown,
        bestBonus,
      }
    })

    // Sort by total value
    cardValues.sort((a, b) => b.totalValue - a.totalValue)

    // Return top recommendations
    return {
      success: true,
      recommendations: cardValues.slice(0, 5).map((cv, index) => ({
        rank: index + 1,
        cardName: cv.card.name,
        bank: cv.card.bank,
        annualFee: cv.card.annualFee,
        monthlyPoints: Math.round(cv.monthlyPoints),
        yearlyPoints: Math.round(cv.yearlyPoints),
        bonusPoints: cv.bonusPoints,
        totalValue: Math.round(cv.totalValue),
        categoryBreakdown: cv.categoryBreakdown,
        bestBonus: cv.bestBonus ? {
          points: cv.bestBonus.bonusPoints,
          minimumSpend: cv.bestBonus.minimumSpendAmount,
          months: cv.bestBonus.spendPeriodMonths,
        } : null,
      })),
    }
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Example: Analyze spending efficiency
 */
export function analyzeSpendingEfficiency(spending: SpendingProfile) {
  const total = spending.grocery + spending.gas + spending.dining + spending.recurring

  if (total === 0) {
    throw new Error('Total spending cannot be zero')
  }

  const breakdown = {
    grocery: {
      amount: spending.grocery,
      percentage: (spending.grocery / total) * 100,
    },
    gas: {
      amount: spending.gas,
      percentage: (spending.gas / total) * 100,
    },
    dining: {
      amount: spending.dining,
      percentage: (spending.dining / total) * 100,
    },
    recurring: {
      amount: spending.recurring,
      percentage: (spending.recurring / total) * 100,
    },
  }

  // Identify dominant category
  const dominantCategory = Object.entries(breakdown).reduce((max, [key, value]) =>
    value.percentage > max.percentage ? { category: key, ...value } : max
  , { category: '', amount: 0, percentage: 0 })

  return {
    totalMonthlySpending: total,
    breakdown,
    dominantCategory,
    recommendations: [
      dominantCategory.percentage > 40
        ? `Focus on cards with high multipliers for ${dominantCategory.category}`
        : 'Consider balanced multiplier cards',
      total > 3000
        ? 'You can easily meet most signup bonus requirements'
        : 'Look for cards with lower minimum spend requirements',
    ],
  }
}

// Example usage
export async function runFullExample() {
  const exampleSpending: SpendingProfile = {
    grocery: 1200,
    gas: 300,
    dining: 600,
    recurring: 500,
  }

  console.log('=== FULL STACK EXAMPLE ===\n')

  // 1. Analyze spending
  console.log('1. Analyzing spending efficiency...')
  const analysis = analyzeSpendingEfficiency(exampleSpending)
  console.log(JSON.stringify(analysis, null, 2))

  // 2. Get recommendations
  console.log('\n2. Getting card recommendations...')
  const recommendations = await getCardRecommendations(
    exampleSpending,
    'AEROPLAN',
    200 // Max $200 annual fee
  )
  console.log(JSON.stringify(recommendations, null, 2))

  // 3. Calculate optimal roadmap
  console.log('\n3. Calculating optimal roadmap...')
  const roadmap = await calculateRoadmapFromDatabase(
    exampleSpending,
    'Trip to Europe',
    60000,
    'AEROPLAN'
  )
  console.log(JSON.stringify(roadmap, null, 2))

  // 4. Compare cards
  console.log('\n4. Comparing all cards...')
  const comparison = await compareAllCardsForSpending(
    exampleSpending,
    'AEROPLAN',
    12
  )
  console.log(JSON.stringify(comparison, null, 2))
}
