import { prisma } from '../prisma'
import { 
  CardOptimizationResult, 
  CategoryOptimization, 
  UserCardForOptimization, 
  SpendingProfile,
  POINT_VALUATIONS,
  CATEGORY_MAPPING
} from '../types/cardOptimization'
import { SpendingCategory, PointType } from '@prisma/client'

/**
 * Card Optimization Engine
 * 
 * Calculates the optimal card for each spending category based on:
 * - Multiplier values
 * - Point valuations
 * - Spending caps and limits
 * - User's card portfolio
 */
export class CardOptimizationEngine {
  
  /**
   * Calculate the best card per category for a user
   */
  static async calculateBestCardPerCategory(
    userId: string, 
    spendingProfile: SpendingProfile
  ): Promise<CardOptimizationResult> {
    
    // Get user's active cards with multipliers
    const userCards = await this.getUserCardsForOptimization(userId)
    
    if (userCards.length === 0) {
      throw new Error('User has no active cards for optimization')
    }
    
    // Calculate optimization for each category
    const optimizations: CategoryOptimization[] = []
    
    for (const [categoryKey, categoryEnum] of Object.entries(CATEGORY_MAPPING)) {
      const monthlySpending = spendingProfile[categoryKey as keyof SpendingProfile]
      
      if (monthlySpending > 0) {
        const optimization = this.optimizeCategory(
          categoryEnum,
          monthlySpending,
          userCards
        )
        
        if (optimization) {
          optimizations.push(optimization)
        }
      }
    }
    
    // Calculate totals and summary
    const totalMonthlyRewards = optimizations.reduce((sum, opt) => sum + opt.monthlyRewards, 0)
    const totalYearlyRewards = totalMonthlyRewards * 12
    
    const summary = this.generateSummary(optimizations, userCards)
    
    return {
      userId,
      optimizations,
      totalMonthlyRewards,
      totalYearlyRewards,
      summary,
      lastCalculated: new Date()
    }
  }
  
  /**
   * Optimize a single spending category
   */
  private static optimizeCategory(
    category: SpendingCategory,
    monthlySpending: number,
    userCards: UserCardForOptimization[]
  ): CategoryOptimization | null {
    
    let bestCard: UserCardForOptimization | null = null
    let bestRewards = 0
    let bestMultiplier = 0
    let bestPointType: PointType = PointType.CASHBACK
    
    // Evaluate each card for this category
    for (const card of userCards) {
      const multiplier = card.multipliers.find(m => m.category === category)
      
      if (multiplier) {
        // Calculate effective spending (considering caps)
        const effectiveSpending = this.calculateEffectiveSpending(
          monthlySpending,
          multiplier.monthlyLimit,
          multiplier.annualLimit
        )
        
        // Determine point type (use most common point type from bonuses)
        const pointType = this.determineCardPointType(card)
        const pointValue = POINT_VALUATIONS[pointType]
        
        // Calculate rewards in cents
        const monthlyRewards = effectiveSpending * multiplier.multiplierValue * pointValue
        
        if (monthlyRewards > bestRewards) {
          bestRewards = monthlyRewards
          bestCard = card
          bestMultiplier = multiplier.multiplierValue
          bestPointType = pointType
        }
      }
    }
    
    if (!bestCard) {
      return null
    }
    
    const pointValue = POINT_VALUATIONS[bestPointType]
    const yearlyRewards = bestRewards * 12
    
    return {
      category,
      recommendedCard: {
        id: bestCard.cardId,
        name: bestCard.name,
        bank: bestCard.bank,
        network: bestCard.network,
        imageUrl: bestCard.imageUrl
      },
      multiplier: bestMultiplier,
      pointType: bestPointType,
      pointValue,
      monthlySpending,
      monthlyRewards: bestRewards,
      yearlyRewards,
      explanation: this.generateCategoryExplanation(
        bestCard,
        category,
        bestMultiplier,
        bestPointType,
        bestRewards
      ),
      confidence: this.calculateCategoryConfidence(bestMultiplier, bestRewards, userCards.length)
    }
  }
  
  /**
   * Get user's cards formatted for optimization
   */
  private static async getUserCardsForOptimization(clerkUserId: string): Promise<UserCardForOptimization[]> {
    // First get user from Clerk ID
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
          include: {
            multipliers: {
              where: { isActive: true }
            },
            bonuses: {
              where: { isActive: true }
            }
          }
        }
      }
    })
    
    return userCards.map((userCard: any) => ({
      id: userCard.id,
      cardId: userCard.cardId,
      name: userCard.card.name,
      bank: userCard.card.bank,
      network: userCard.card.network,
      imageUrl: userCard.card.imageUrl,
      multipliers: userCard.card.multipliers.map((m: any) => ({
        category: m.category,
        multiplierValue: parseFloat(m.multiplierValue.toString()),
        monthlyLimit: m.monthlyLimit ? parseFloat(m.monthlyLimit.toString()) : null,
        annualLimit: m.annualLimit ? parseFloat(m.annualLimit.toString()) : null
      })),
      bonuses: userCard.card.bonuses.map((b: any) => ({
        pointType: b.pointType,
        bonusPoints: b.bonusPoints,
        minimumSpendAmount: parseFloat(b.minimumSpendAmount.toString()),
        spendPeriodMonths: b.spendPeriodMonths
      })),
      openDate: userCard.openDate,
      isActive: userCard.isActive
    }))
  }
  
  /**
   * Calculate effective spending considering caps
   */
  private static calculateEffectiveSpending(
    monthlySpending: number,
    monthlyLimit?: number | null,
    annualLimit?: number | null
  ): number {
    let effectiveSpending = monthlySpending
    
    // Apply monthly limit
    if (monthlyLimit && monthlySpending > monthlyLimit) {
      effectiveSpending = monthlyLimit
    }
    
    // Apply annual limit (convert to monthly)
    if (annualLimit) {
      const monthlyFromAnnual = annualLimit / 12
      if (effectiveSpending > monthlyFromAnnual) {
        effectiveSpending = monthlyFromAnnual
      }
    }
    
    return effectiveSpending
  }
  
  /**
   * Determine the primary point type for a card
   */
  private static determineCardPointType(card: UserCardForOptimization): PointType {
    if (card.bonuses.length > 0) {
      // Use the point type from the largest bonus
      const largestBonus = card.bonuses.reduce((prev, current) => 
        current.bonusPoints > prev.bonusPoints ? current : prev
      )
      return largestBonus.pointType
    }
    
    // Default to cashback if no bonuses
    return PointType.CASHBACK
  }
  
  /**
   * Generate explanation for category optimization
   */
  private static generateCategoryExplanation(
    card: UserCardForOptimization,
    category: SpendingCategory,
    multiplier: number,
    pointType: PointType,
    monthlyRewards: number
  ): string {
    const categoryName = category.toLowerCase().replace('_', ' ')
    const pointTypeName = pointType.replace('_', ' ').toLowerCase()
    const rewardsDollars = (monthlyRewards / 100).toFixed(2)
    
    return `${card.name} offers ${multiplier}x ${pointTypeName} points on ${categoryName}, earning approximately $${rewardsDollars} monthly in rewards.`
  }
  
  /**
   * Calculate confidence score for category optimization
   */
  private static calculateCategoryConfidence(
    multiplier: number,
    rewards: number,
    totalCards: number
  ): number {
    let confidence = 50 // Base confidence
    
    // Higher multiplier = higher confidence
    if (multiplier >= 5) confidence += 30
    else if (multiplier >= 3) confidence += 20
    else if (multiplier >= 2) confidence += 10
    
    // Higher rewards = higher confidence
    if (rewards >= 2000) confidence += 20 // $20+ monthly
    else if (rewards >= 1000) confidence += 10 // $10+ monthly
    
    // More cards to choose from = higher confidence
    if (totalCards >= 5) confidence += 10
    else if (totalCards >= 3) confidence += 5
    
    return Math.min(confidence, 100)
  }
  
  /**
   * Generate optimization summary
   */
  private static generateSummary(
    optimizations: CategoryOptimization[],
    userCards: UserCardForOptimization[]
  ): {
    bestOverallCard: { id: string; name: string; categoriesCount: number } | null
    totalCategories: number
    averageMultiplier: number
    estimatedAnnualValue: number
  } {
    // Handle empty optimizations
    if (optimizations.length === 0) {
      return {
        bestOverallCard: null,
        totalCategories: 0,
        averageMultiplier: 0,
        estimatedAnnualValue: 0
      }
    }

    // Find the card that appears most frequently in optimizations
    const cardCounts = new Map<string, { card: any, count: number }>()
    
    optimizations.forEach(opt => {
      const cardId = opt.recommendedCard.id
      if (cardCounts.has(cardId)) {
        cardCounts.get(cardId)!.count++
      } else {
        cardCounts.set(cardId, {
          card: opt.recommendedCard,
          count: 1
        })
      }
    })
    
    const bestOverallEntry = Array.from(cardCounts.entries())
      .reduce((prev, current) => current[1].count > prev[1].count ? current : prev)
    
    const averageMultiplier = optimizations.reduce((sum, opt) => sum + opt.multiplier, 0) / optimizations.length
    const estimatedAnnualValue = optimizations.reduce((sum, opt) => sum + opt.yearlyRewards, 0)
    
    return {
      bestOverallCard: {
        id: bestOverallEntry[1].card.id,
        name: bestOverallEntry[1].card.name,
        categoriesCount: bestOverallEntry[1].count
      },
      totalCategories: optimizations.length,
      averageMultiplier: Math.round(averageMultiplier * 100) / 100,
      estimatedAnnualValue: Math.round(estimatedAnnualValue)
    }
  }
}