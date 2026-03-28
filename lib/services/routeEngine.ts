import type { SpendingProfile, RoadmapStep, OptimalRoadmap, CardWithDetails } from '../types/spending'

interface Goal {
  id: string
  name: string
  requiredPoints: number
  pointType: string
}

/**
 * RouteEngine: Core business logic for credit card rewards optimization
 * Calculates the optimal strategy for earning points based on spending patterns
 */
export class RouteEngine {
  /**
   * Calculate the optimal roadmap to reach a target goal
   * @param monthlySpending - User's monthly spending across categories
   * @param targetGoal - The redemption goal to achieve
   * @param availableCards - Cards available for optimization (with bonuses and multipliers)
   * @returns Chronological roadmap of card applications and usage strategy
   */
  static calculateOptimalRoadmap(
    monthlySpending: SpendingProfile,
    targetGoal: Goal,
    availableCards: CardWithDetails[],
    preRanked: boolean = false
  ): OptimalRoadmap {
    // Filter cards that match the target goal's point type
    const eligibleCards = availableCards.filter(card =>
      card.bonuses.some(bonus => bonus.pointType === targetGoal.pointType)
    )

    // Gracefully handle no cards found
    if (eligibleCards.length === 0) {
      return {
        status: 'no_cards_found',
        steps: [],
        totalMonths: 0,
        totalPointsEarned: 0,
        goalAchieved: false,
        efficiency: {
          pointsPerDollar: 0,
          monthsToGoal: 0,
          totalSpend: 0,
        },
        errorMessage: `No cards available for ${targetGoal.pointType.replace(/_/g, ' ')}`,
        missingPointType: targetGoal.pointType,
      }
    }

    // Calculate total monthly spending
    const totalMonthlySpend = this.calculateTotalSpending(monthlySpending)

    // Gracefully handle zero spending
    if (totalMonthlySpend === 0) {
      return {
        status: 'insufficient_spending',
        steps: [],
        totalMonths: 0,
        totalPointsEarned: 0,
        goalAchieved: false,
        efficiency: {
          pointsPerDollar: 0,
          monthsToGoal: 0,
          totalSpend: 0,
        },
        errorMessage: 'Monthly spending must be greater than zero',
      }
    }

    // Score and rank cards by their value proposition (skip if pre-ranked by enhanced engine)
    const rankedCards = preRanked ? eligibleCards : this.rankCardsByValue(eligibleCards, monthlySpending, targetGoal)

    // Build the optimal roadmap
    const roadmap = this.buildRoadmap(
      rankedCards,
      monthlySpending,
      totalMonthlySpend,
      targetGoal
    )

    return {
      ...roadmap,
      status: 'success',
    }
  }

  /**
   * Calculate total monthly spending across all categories
   */
  private static calculateTotalSpending(spending: SpendingProfile): number {
    return spending.grocery + spending.gas + spending.dining + spending.recurring
  }

  /**
   * Rank cards by their value proposition for the user's spending profile
   * Considers both signup bonuses and ongoing multipliers
   */
  private static rankCardsByValue(
    cards: CardWithDetails[],
    spending: SpendingProfile,
    goal: Goal
  ): CardWithDetails[] {
    const scoredCards = cards.map(card => {
      // Calculate bonus value (points per month during bonus period)
      const bonus = card.bonuses.find(b => b.pointType === goal.pointType)
      const bonusValue = bonus
        ? bonus.bonusPoints / bonus.spendPeriodMonths
        : 0

      // Calculate ongoing earning rate based on spending profile
      const ongoingValue = this.calculateMonthlyEarning(card, spending, goal.pointType)

      // Total value = bonus value + ongoing value
      // Weight bonus higher as it's time-limited
      const totalValue = bonusValue * 2 + ongoingValue

      return {
        card,
        score: totalValue,
        bonusValue,
        ongoingValue,
      }
    })

    // Sort by score descending (highest value first)
    return scoredCards
      .sort((a, b) => b.score - a.score)
      .map(item => item.card)
  }

  /**
   * Calculate monthly points earned from a card based on spending profile
   */
  private static calculateMonthlyEarning(
    card: CardWithDetails,
    spending: SpendingProfile,
    targetPointType: string
  ): number {
    let totalPoints = 0

    // Map spending categories to card multipliers
    const categoryMap: Record<keyof SpendingProfile, string> = {
      grocery: 'GROCERY',
      gas: 'GAS',
      dining: 'DINING',
      recurring: 'RECURRING',
    }

    for (const [category, amount] of Object.entries(spending) as [keyof SpendingProfile, number][]) {
      const multiplier = card.multipliers.find(
        m => m.category === categoryMap[category]
      )

      if (multiplier) {
        // DB stores as decimal (0.05 = 5x), convert to real multiplier
        totalPoints += amount * multiplier.multiplierValue * 100
      } else {
        // Default 1x points
        totalPoints += amount * 1
      }
    }

    return totalPoints
  }

  /**
   * Build the chronological roadmap of card applications and usage
   */
  private static buildRoadmap(
    rankedCards: CardWithDetails[],
    monthlySpending: SpendingProfile,
    totalMonthlySpend: number,
    targetGoal: Goal
  ): OptimalRoadmap {
    const steps: RoadmapStep[] = []
    let cumulativePoints = 0
    let currentMonth = 1
    let cardIndex = 0

    // Track active card bonuses
    const activeCardBonuses: Map<string, {
      card: CardWithDetails
      bonus: CardWithDetails['bonuses'][0]
      spendAccumulated: number
      startMonth: number
      bonusEarned: boolean
    }> = new Map()

    // Continue until goal is reached or we run out of cards
    while (cumulativePoints < targetGoal.requiredPoints && currentMonth <= 120) {
      let monthlyPoints = 0

      // Check if we should apply for a new card
      if (cardIndex < rankedCards.length) {
        const nextCard = rankedCards[cardIndex]
        const bonus = nextCard.bonuses.find(b => b.pointType === targetGoal.pointType)

        // Apply for card if:
        // 1. We have no active bonuses, OR
        // 2. Current active bonus is complete
        const shouldApplyForCard = activeCardBonuses.size === 0 ||
          Array.from(activeCardBonuses.values()).every(ab => ab.bonusEarned)

        if (shouldApplyForCard && bonus) {
          // Add application step
          steps.push(this.createApplicationStep(
            currentMonth,
            nextCard,
            cumulativePoints,
            targetGoal.requiredPoints
          ))

          // Track this bonus
          activeCardBonuses.set(nextCard.id, {
            card: nextCard,
            bonus,
            spendAccumulated: 0,
            startMonth: currentMonth,
            bonusEarned: false,
          })

          cardIndex++
          currentMonth++
          continue
        }
      }

      // Process spending for active cards
      if (activeCardBonuses.size > 0) {
        // Focus on completing the most recent bonus first
        const activeBonus = Array.from(activeCardBonuses.values())
          .filter(ab => !ab.bonusEarned)
          .sort((a, b) => b.startMonth - a.startMonth)[0]

        if (activeBonus) {
          const step = this.createUsageStep(
            currentMonth,
            activeBonus.card,
            monthlySpending,
            activeBonus,
            totalMonthlySpend,
            cumulativePoints,
            targetGoal
          )

          monthlyPoints = step.monthlyPointsEarned
          cumulativePoints = step.cumulativePoints

          // Update bonus progress
          if (step.bonusProgress) {
            activeBonus.spendAccumulated = step.bonusProgress.currentSpend
            activeBonus.bonusEarned = step.bonusProgress.bonusEarned
          }

          steps.push(step)
        }
      } else {
        // No active cards - shouldn't happen but handle gracefully
        break
      }

      currentMonth++

      // Safety check: if we're not making progress, break
      if (monthlyPoints === 0 && steps.length > 0) {
        break
      }
    }

    // Calculate efficiency metrics
    const totalSpend = steps.reduce((sum, step) =>
      sum + step.categoryAllocations.reduce((catSum, cat) => catSum + cat.amount, 0), 0
    )

    return {
      steps,
      totalMonths: currentMonth - 1,
      totalPointsEarned: cumulativePoints,
      goalAchieved: cumulativePoints >= targetGoal.requiredPoints,
      efficiency: {
        pointsPerDollar: totalSpend > 0 ? cumulativePoints / totalSpend : 0,
        monthsToGoal: cumulativePoints >= targetGoal.requiredPoints
          ? steps.findIndex(s => s.cumulativePoints >= targetGoal.requiredPoints) + 1
          : currentMonth - 1,
        totalSpend,
      },
    }
  }

  /**
   * Create a card application step
   */
  private static createApplicationStep(
    month: number,
    card: CardWithDetails,
    cumulativePoints: number,
    goalPoints: number
  ): RoadmapStep {
    return {
      month,
      cardId: card.id,
      cardName: card.name,
      cardImageUrl: card.imageUrl,
      cardBank: card.bank,
      cardNetwork: card.network,
      action: 'APPLY',
      categoryAllocations: [],
      bonusProgress: null,
      monthlyPointsEarned: 0,
      cumulativePoints,
      projectedGoalCompletion: (cumulativePoints / goalPoints) * 100,
    }
  }

  /**
   * Create a card usage step with spending allocations
   */
  private static createUsageStep(
    month: number,
    card: CardWithDetails,
    monthlySpending: SpendingProfile,
    activeBonus: {
      bonus: CardWithDetails['bonuses'][0]
      spendAccumulated: number
      bonusEarned: boolean
    },
    totalMonthlySpend: number,
    currentCumulativePoints: number,
    targetGoal: Goal
  ): RoadmapStep {
    const categoryAllocations: RoadmapStep['categoryAllocations'] = []
    let monthlyPoints = 0
    let monthlySpend = 0

    // Map spending categories
    const categoryMap: Record<keyof SpendingProfile, string> = {
      grocery: 'GROCERY',
      gas: 'GAS',
      dining: 'DINING',
      recurring: 'RECURRING',
    }

    // Allocate spending to categories
    for (const [category, amount] of Object.entries(monthlySpending) as [keyof SpendingProfile, number][]) {
      if (amount === 0) continue

      const rawMultiplier = card.multipliers.find(
        m => m.category === categoryMap[category]
      )?.multiplierValue || 0.01

      // DB stores multipliers as decimals (0.05 = 5x points)
      // Convert to actual point multiplier for display and calculation
      const pointMultiplier = rawMultiplier * 100
      const pointsEarned = amount * pointMultiplier

      categoryAllocations.push({
        category,
        amount,
        multiplier: pointMultiplier,
        pointsEarned: Math.round(pointsEarned),
      })

      monthlyPoints += pointsEarned
      monthlySpend += amount
    }

    // Update bonus progress
    const newSpendAccumulated = activeBonus.spendAccumulated + monthlySpend
    const bonusCompleted = !activeBonus.bonusEarned &&
      newSpendAccumulated >= activeBonus.bonus.minimumSpendAmount

    // Add bonus points if earned this month
    if (bonusCompleted) {
      monthlyPoints += activeBonus.bonus.bonusPoints
    }

    const newCumulativePoints = currentCumulativePoints + monthlyPoints

    return {
      month,
      cardId: card.id,
      cardName: card.name,
      cardImageUrl: card.imageUrl,
      cardBank: card.bank,
      cardNetwork: card.network,
      action: 'USE',
      categoryAllocations,
      bonusProgress: {
        bonusId: activeBonus.bonus.id,
        currentSpend: newSpendAccumulated,
        requiredSpend: activeBonus.bonus.minimumSpendAmount,
        bonusPoints: activeBonus.bonus.bonusPoints,
        bonusEarned: bonusCompleted,
      },
      monthlyPointsEarned: monthlyPoints,
      cumulativePoints: newCumulativePoints,
      projectedGoalCompletion: (newCumulativePoints / targetGoal.requiredPoints) * 100,
    }
  }

  /**
   * Validate spending profile
   */
  static validateSpendingProfile(spending: SpendingProfile): boolean {
    return Object.values(spending).every(amount => amount >= 0)
  }

  /**
   * Calculate time to complete a bonus based on monthly spending
   */
  static calculateBonusCompletionTime(
    minimumSpend: number,
    monthlySpending: number
  ): number {
    if (monthlySpending === 0) return Infinity
    return Math.ceil(minimumSpend / monthlySpending)
  }

  /**
   * Compare two cards for a specific spending profile
   * Returns the better card based on total value over time
   */
  static compareCards(
    card1: CardWithDetails,
    card2: CardWithDetails,
    spending: SpendingProfile,
    pointType: string,
    timeHorizonMonths: number = 12
  ): {
    betterCard: CardWithDetails
    card1Value: number
    card2Value: number
    difference: number
  } {
    const card1Value = this.calculateCardValue(card1, spending, pointType, timeHorizonMonths)
    const card2Value = this.calculateCardValue(card2, spending, pointType, timeHorizonMonths)

    return {
      betterCard: card1Value > card2Value ? card1 : card2,
      card1Value,
      card2Value,
      difference: Math.abs(card1Value - card2Value),
    }
  }

  /**
   * Calculate total value of a card over a time horizon
   */
  private static calculateCardValue(
    card: CardWithDetails,
    spending: SpendingProfile,
    pointType: string,
    months: number
  ): number {
    // Bonus points
    const bonus = card.bonuses.find(b => b.pointType === pointType)
    const bonusPoints = bonus ? bonus.bonusPoints : 0

    // Ongoing points
    const monthlyPoints = this.calculateMonthlyEarning(card, spending, pointType)
    const ongoingPoints = monthlyPoints * months

    // Subtract annual fee (amortized)
    const feeCost = (card.annualFee / 12) * months

    // Total value (assuming 1 point = $0.01 for simplification)
    return bonusPoints + ongoingPoints - feeCost
  }
}
