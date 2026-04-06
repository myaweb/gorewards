import { CardService } from '@/lib/services/cardService'

/**
 * @deprecated Use EnhancedRecommendationEngine from '@/lib/services/enhancedRecommendationEngine' instead.
 * This file is kept only for scripts/validate-production-db.ts compatibility.
 */

/**
 * User spending profile for monthly expenses
 */
export interface UserSpending {
  grocery: number
  gas: number
  dining: number
  bills: number
}

/**
 * Credit card with calculated net value from database
 */
export interface CardWithNetValue {
  id: string
  name: string
  bank: string
  network: string
  annualFee: number
  baseRewardRate: number
  imageUrl?: string | null
  affiliateLink?: string | null
  slug?: string
  
  // Calculated values
  netValue: number
  categoryEarnings: number
  welcomeBonusValue: number
  
  // Current multipliers
  groceryMultiplier: number
  gasMultiplier: number
  diningMultiplier: number
  billsMultiplier: number
  
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Calculate the best credit cards based on user spending patterns
 * Now uses the production database instead of flat CreditCard model
 * 
 * Formula: First Year Net Value (AEV)
 * - Annual Spend = Monthly Spend * 12 for each category
 * - Category Earnings = Sum of (Annual Spend per Category * Category Multiplier)
 * - Net Value = Category Earnings + Welcome Bonus Value - Annual Fee
 * 
 * @param userSpending - Monthly spending amounts by category
 * @returns Top 3 recommended cards sorted by net value (descending)
 */
export async function calculateBestCards(
  userSpending: UserSpending
): Promise<CardWithNetValue[]> {
  // Fetch all active credit cards from the database with current bonuses and multipliers
  const cards = await CardService.getAllCardsWithDetails()

  // Calculate net value for each card
  const cardsWithNetValue = cards.map((card) => {
    // Convert monthly spending to annual
    const annualGrocery = userSpending.grocery * 12
    const annualGas = userSpending.gas * 12
    const annualDining = userSpending.dining * 12
    const annualBills = userSpending.bills * 12

    // Get current multipliers (use the most recent active ones)
    const groceryMultiplier = card.multipliers.find(m => m.category === 'GROCERY')?.multiplierValue || card.baseRewardRate
    const gasMultiplier = card.multipliers.find(m => m.category === 'GAS')?.multiplierValue || card.baseRewardRate
    const diningMultiplier = card.multipliers.find(m => m.category === 'DINING')?.multiplierValue || card.baseRewardRate
    const billsMultiplier = card.multipliers.find(m => m.category === 'RECURRING')?.multiplierValue || card.baseRewardRate

    // Calculate category-based earnings
    const categoryEarnings =
      annualGrocery * groceryMultiplier +
      annualGas * gasMultiplier +
      annualDining * diningMultiplier +
      annualBills * billsMultiplier

    // Get welcome bonus value (use the highest current bonus)
    const welcomeBonusValue = card.bonuses.reduce((max, bonus) => {
      return Math.max(max, bonus.estimatedValue || 0)
    }, 0)

    // Calculate first year net value
    const netValue = categoryEarnings + welcomeBonusValue - card.annualFee

    return {
      id: card.id,
      name: card.name,
      bank: card.bank,
      network: card.network,
      annualFee: card.annualFee,
      baseRewardRate: card.baseRewardRate,
      imageUrl: card.imageUrl,
      affiliateLink: card.affiliateLink,
      slug: card.slug,
      netValue,
      categoryEarnings,
      welcomeBonusValue,
      groceryMultiplier,
      gasMultiplier,
      diningMultiplier,
      billsMultiplier,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt
    } as CardWithNetValue
  })

  // Sort by net value (descending) and return top 3
  return cardsWithNetValue
    .sort((a, b) => b.netValue - a.netValue)
    .slice(0, 3)
}

