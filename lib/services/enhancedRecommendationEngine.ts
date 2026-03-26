import { CardService } from './cardService'
import { 
  UserProfile, 
  CardRecommendation, 
  RecommendationResult, 
  EnhancedCardData,
  CreditScoreRange,
  AnnualFeeTier,
  POINT_VALUATIONS,
  ISSUER_RISK_LEVELS
} from '../types/recommendation'

/**
 * Enhanced Credit Card Recommendation Engine
 * 
 * Production-grade recommendation system that considers:
 * - Signup bonus spend requirements and achievability
 * - Point valuations by type
 * - Approval probability based on credit profile
 * - Category spending caps
 * - First-year vs long-term value
 */
export class EnhancedRecommendationEngine {
  private static readonly VERSION = '2.0.0'
  
  /**
   * Generate personalized card recommendations
   */
  static async getRecommendations(userProfile: UserProfile): Promise<RecommendationResult> {
    const startTime = Date.now()
    
    // Fetch all active cards from database
    const rawCards = await CardService.getAllCardsWithDetails()
    
    // Transform to enhanced card data
    const cards = rawCards.map(card => this.transformToEnhancedCard(card))
    
    // Calculate recommendations for each card
    const recommendations = cards
      .map(card => this.calculateCardRecommendation(card, userProfile))
      .filter(rec => rec.scores.approvalProbability > 0.1)

    // Goal-aware sorting
    if (userProfile.goal) {
      const goalPointType = userProfile.goal.pointType
      const requiredPoints = userProfile.goal.requiredPoints

      // Calculate months to goal for each card
      for (const rec of recommendations) {
        const cardPointType = this.estimatePointType(
          cards.find(c => c.id === rec.card.id)!
        )
        
        if (cardPointType === goalPointType) {
          // Calculate actual monthly points earned
          // DB stores multipliers as decimals (0.05 = 5x points or 5% cashback)
          // For points-based cards, multiply by 100 to get real point multiplier
          const card = cards.find(c => c.id === rec.card.id)!
          const isPointsCard = cardPointType !== 'CASHBACK'
          
          let yearlyPoints = 0
          const categoryMapping: Record<string, string> = {
            grocery: 'GROCERY', gas: 'GAS', dining: 'DINING', 
            bills: 'RECURRING', travel: 'TRAVEL', shopping: 'SHOPPING'
          }
          
          for (const [category, monthlySpend] of Object.entries(userProfile.spending)) {
            const annualSpend = monthlySpend * 12
            if (annualSpend === 0) continue
            const dbCategory = categoryMapping[category]
            const mult = card.multipliers.find(m => m.category === dbCategory)
            const rate = mult ? mult.multiplierValue : card.baseRewardRate
            // For points cards: 0.015 in DB means 1.5 points per dollar
            // For cashback: 0.015 means 1.5% cashback (value, not points)
            const pointsPerDollar = isPointsCard ? rate * 100 : rate * 100
            yearlyPoints += annualSpend * pointsPerDollar
          }
          
          const monthlyPoints = yearlyPoints / 12
          const bonusPoints = rec.breakdown.signupBonus?.achievable 
            ? rec.breakdown.signupBonus.points 
            : 0
          const remainingAfterBonus = Math.max(0, requiredPoints - bonusPoints)
          rec.monthsToGoal = monthlyPoints > 0 
            ? Math.ceil(remainingAfterBonus / monthlyPoints)
            : 999
        } else {
          rec.monthsToGoal = 999
        }
      }

      // Sort: matching point type first (by months to goal), then others (by value)
      recommendations.sort((a, b) => {
        const aMatches = (a.monthsToGoal || 999) < 999
        const bMatches = (b.monthsToGoal || 999) < 999

        if (aMatches && !bMatches) return -1
        if (!aMatches && bMatches) return 1
        if (aMatches && bMatches) return (a.monthsToGoal || 999) - (b.monthsToGoal || 999)
        return b.scores.expectedYearlyValue - a.scores.expectedYearlyValue
      })
    } else {
      // No goal — sort by expected yearly value (original behavior)
      recommendations.sort((a, b) => b.scores.expectedYearlyValue - a.scores.expectedYearlyValue)
    }

    const ranked = recommendations
      .slice(0, 5)
      .map((rec, index) => ({ ...rec, rank: index + 1 }))
    
    return {
      recommendations: ranked,
      userProfile,
      metadata: {
        totalCardsEvaluated: cards.length,
        timestamp: new Date(),
        version: this.VERSION
      }
    }
  }
  
  /**
   * Transform database card to enhanced card data
   */
  private static transformToEnhancedCard(card: any): EnhancedCardData {
    return {
      id: card.id,
      name: card.name,
      bank: card.bank,
      network: card.network,
      annualFee: parseFloat(card.annualFee.toString()),
      baseRewardRate: parseFloat(card.baseRewardRate.toString()),
      imageUrl: card.imageUrl,
      affiliateLink: card.affiliateLink,
      slug: card.slug,
      bonuses: card.bonuses.map((bonus: any) => ({
        id: bonus.id,
        bonusPoints: bonus.bonusPoints,
        pointType: bonus.pointType,
        minimumSpendAmount: parseFloat(bonus.minimumSpendAmount.toString()),
        spendPeriodMonths: bonus.spendPeriodMonths,
        estimatedValue: bonus.estimatedValue ? parseFloat(bonus.estimatedValue.toString()) : null,
        description: bonus.description
      })),
      multipliers: card.multipliers.map((multiplier: any) => ({
        id: multiplier.id,
        category: multiplier.category,
        multiplierValue: parseFloat(multiplier.multiplierValue.toString()),
        description: multiplier.description,
        monthlyLimit: multiplier.monthlyLimit ? parseFloat(multiplier.monthlyLimit.toString()) : null,
        annualLimit: multiplier.annualLimit ? parseFloat(multiplier.annualLimit.toString()) : null
      })),
      approvalFactors: {
        annualFeeTier: this.getAnnualFeeTier(parseFloat(card.annualFee.toString())),
        issuerRiskLevel: card.bank as keyof typeof ISSUER_RISK_LEVELS,
        minimumIncome: this.estimateMinimumIncome(parseFloat(card.annualFee.toString()))
      }
    }
  }
  
  /**
   * Calculate comprehensive recommendation for a single card
   */
  private static calculateCardRecommendation(
    card: EnhancedCardData, 
    userProfile: UserProfile
  ): CardRecommendation {
    // Calculate approval probability
    const approvalProbability = this.calculateApprovalProbability(card, userProfile)
    
    // Calculate signup bonus value and achievability
    const signupBonusAnalysis = this.analyzeSignupBonus(card, userProfile)
    
    // Calculate yearly spending rewards with caps
    const categoryRewards = this.calculateCategoryRewards(card, userProfile)
    
    // Calculate total values
    const yearlySpendRewards = categoryRewards.reduce((sum, reward) => sum + reward.valueInCents, 0)
    const signupBonusValue = signupBonusAnalysis?.valueInCents || 0
    const expectedSignupValue = approvalProbability * signupBonusValue
    
    // First year value (includes signup bonus)
    const netFirstYearValue = expectedSignupValue + yearlySpendRewards - (card.annualFee * 100)
    
    // Long-term value (annual rewards minus fee)
    const netLongTermValue = yearlySpendRewards - (card.annualFee * 100)
    
    // Expected yearly value (weighted by approval probability)
    const expectedYearlyValue = approvalProbability * netFirstYearValue
    
    // Generate explanation
    const explanation = this.generateExplanation(card, userProfile, {
      approvalProbability,
      signupBonusAnalysis,
      categoryRewards,
      netFirstYearValue,
      netLongTermValue
    })
    
    return {
      card: {
        id: card.id,
        name: card.name,
        bank: card.bank,
        network: card.network,
        annualFee: card.annualFee,
        imageUrl: card.imageUrl,
        affiliateLink: card.affiliateLink,
        slug: card.slug
      },
      scores: {
        expectedYearlyValue: Math.round(expectedYearlyValue),
        approvalProbability: Math.round(approvalProbability * 100) / 100,
        signupBonusValue: Math.round(signupBonusValue),
        yearlySpendRewards: Math.round(yearlySpendRewards),
        longTermValue: Math.round(netLongTermValue)
      },
      breakdown: {
        signupBonus: signupBonusAnalysis,
        categoryRewards,
        totalAnnualRewards: Math.round(yearlySpendRewards),
        netFirstYearValue: Math.round(netFirstYearValue),
        netLongTermValue: Math.round(netLongTermValue)
      },
      explanation,
      rank: 0, // Will be set later
      confidence: this.calculateConfidence(approvalProbability, categoryRewards.length)
    }
  }
  
  /**
   * Calculate approval probability based on credit profile and card requirements
   */
  private static calculateApprovalProbability(
    card: EnhancedCardData, 
    userProfile: UserProfile
  ): number {
    let baseScore = 0.5 // Start with 50% base probability
    
    // Credit score impact
    switch (userProfile.creditScore) {
      case CreditScoreRange.EXCELLENT:
        baseScore += 0.4
        break
      case CreditScoreRange.GOOD:
        baseScore += 0.2
        break
      case CreditScoreRange.FAIR:
        baseScore -= 0.1
        break
      case CreditScoreRange.POOR:
        baseScore -= 0.3
        break
    }
    
    // Annual fee tier impact (higher fees = stricter approval)
    switch (card.approvalFactors.annualFeeTier) {
      case AnnualFeeTier.NO_FEE:
        baseScore += 0.2
        break
      case AnnualFeeTier.LOW_FEE:
        baseScore += 0.1
        break
      case AnnualFeeTier.MID_FEE:
        baseScore -= 0.05
        break
      case AnnualFeeTier.HIGH_FEE:
        baseScore -= 0.15
        break
      case AnnualFeeTier.PREMIUM:
        baseScore -= 0.25
        break
    }
    
    // Issuer risk level impact
    const issuerRisk = ISSUER_RISK_LEVELS[card.approvalFactors.issuerRiskLevel] || 'MEDIUM'
    switch (issuerRisk) {
      case 'LOW':
        baseScore += 0.1
        break
      case 'MEDIUM':
        // No change
        break
      case 'HIGH':
        baseScore -= 0.15
        break
    }
    
    // Income requirement check
    if (userProfile.annualIncome && card.approvalFactors.minimumIncome) {
      if (userProfile.annualIncome < card.approvalFactors.minimumIncome) {
        baseScore -= 0.3
      } else if (userProfile.annualIncome > card.approvalFactors.minimumIncome * 2) {
        baseScore += 0.1
      }
    }
    
    // Clamp between 0 and 1
    return Math.max(0, Math.min(1, baseScore))
  }
  
  /**
   * Analyze signup bonus achievability and value
   */
  private static analyzeSignupBonus(
    card: EnhancedCardData, 
    userProfile: UserProfile
  ): CardRecommendation['breakdown']['signupBonus'] {
    const bonus = card.bonuses.find(b => b.bonusPoints > 0)
    if (!bonus) return null
    
    // Calculate total monthly spending
    const totalMonthlySpend = Object.values(userProfile.spending).reduce((sum, amount) => sum + amount, 0)
    const spendInPeriod = totalMonthlySpend * bonus.spendPeriodMonths
    
    // Check if bonus is achievable
    const achievable = spendInPeriod >= bonus.minimumSpendAmount
    
    // Get point valuation (convert to cents)
    const pointValue = POINT_VALUATIONS[bonus.pointType as keyof typeof POINT_VALUATIONS] || 1.0
    const valueInCents = bonus.bonusPoints * pointValue
    
    return {
      points: bonus.bonusPoints,
      pointType: bonus.pointType,
      valueInCents: Math.round(valueInCents),
      requiredSpend: bonus.minimumSpendAmount,
      spendPeriodMonths: bonus.spendPeriodMonths,
      achievable
    }
  }
  
  /**
   * Calculate category rewards with spending caps
   */
  private static calculateCategoryRewards(
    card: EnhancedCardData, 
    userProfile: UserProfile
  ): CardRecommendation['breakdown']['categoryRewards'] {
    const rewards: CardRecommendation['breakdown']['categoryRewards'] = []
    
    // Map spending categories to card multipliers
    const categoryMapping = {
      grocery: 'GROCERY',
      gas: 'GAS',
      dining: 'DINING',
      bills: 'RECURRING',
      travel: 'TRAVEL',
      shopping: 'SHOPPING'
    }
    
    for (const [spendingCategory, annualSpend] of Object.entries(userProfile.spending)) {
      const annualAmount = annualSpend * 12
      if (annualAmount === 0) continue
      
      const cardCategory = categoryMapping[spendingCategory as keyof typeof categoryMapping]
      const multiplier = card.multipliers.find(m => m.category === cardCategory)
      
      if (multiplier) {
        // Calculate rewards with caps
        let effectiveSpend = annualAmount
        let cappedAt: number | undefined
        
        // Apply spending caps
        if (multiplier.annualLimit && annualAmount > multiplier.annualLimit) {
          effectiveSpend = multiplier.annualLimit
          cappedAt = multiplier.annualLimit
        } else if (multiplier.monthlyLimit) {
          const annualCap = multiplier.monthlyLimit * 12
          if (annualAmount > annualCap) {
            effectiveSpend = annualCap
            cappedAt = annualCap
          }
        }
        
        const points = effectiveSpend * multiplier.multiplierValue
        
        // Estimate point type from card name/bank for valuation
        const pointType = this.estimatePointType(card)
        const pointValue = POINT_VALUATIONS[pointType] || 1.0
        const valueInCents = points * pointValue
        
        rewards.push({
          category: spendingCategory,
          annualSpend: annualAmount,
          multiplier: multiplier.multiplierValue,
          points: Math.round(points),
          valueInCents: Math.round(valueInCents),
          cappedAt
        })
      } else {
        // Use base reward rate
        const points = annualAmount * card.baseRewardRate
        const pointType = this.estimatePointType(card)
        const pointValue = POINT_VALUATIONS[pointType] || 1.0
        const valueInCents = points * pointValue
        
        rewards.push({
          category: spendingCategory,
          annualSpend: annualAmount,
          multiplier: card.baseRewardRate,
          points: Math.round(points),
          valueInCents: Math.round(valueInCents)
        })
      }
    }
    
    return rewards
  }
  
  /**
   * Generate human-readable explanation
   */
  private static generateExplanation(
    card: EnhancedCardData,
    userProfile: UserProfile,
    analysis: any
  ): CardRecommendation['explanation'] {
    const pros: string[] = []
    const cons: string[] = []
    const bestFor: string[] = []
    
    // Analyze pros
    if (analysis.approvalProbability > 0.8) {
      pros.push('High approval probability based on your credit profile')
    }
    
    if (analysis.signupBonusAnalysis?.achievable) {
      pros.push(`Achievable signup bonus worth $${(analysis.signupBonusAnalysis.valueInCents / 100).toFixed(0)}`)
    }
    
    if (card.annualFee === 0) {
      pros.push('No annual fee')
    }
    
    // Find best categories
    const topRewards = analysis.categoryRewards
      .filter((r: any) => r.multiplier > card.baseRewardRate)
      .sort((a: any, b: any) => b.multiplier - a.multiplier)
      .slice(0, 2)
    
    topRewards.forEach((reward: any) => {
      pros.push(`${reward.multiplier}x points on ${reward.category}`)
      bestFor.push(`${reward.category} spending`)
    })
    
    // Analyze cons
    if (analysis.approvalProbability < 0.5) {
      cons.push('Lower approval probability based on credit requirements')
    }
    
    if (card.annualFee > 200) {
      cons.push(`High annual fee of $${card.annualFee}`)
    }
    
    if (analysis.signupBonusAnalysis && !analysis.signupBonusAnalysis.achievable) {
      cons.push(`Signup bonus requires $${analysis.signupBonusAnalysis.requiredSpend} spend in ${analysis.signupBonusAnalysis.spendPeriodMonths} months`)
    }
    
    // Generate main recommendation reason
    let whyRecommended = ''
    if (analysis.netFirstYearValue > 50000) { // $500+
      whyRecommended = `Excellent first-year value of $${(analysis.netFirstYearValue / 100).toFixed(0)} with strong category multipliers`
    } else if (analysis.signupBonusAnalysis?.achievable && analysis.signupBonusAnalysis.valueInCents > 30000) {
      whyRecommended = `Strong achievable signup bonus worth $${(analysis.signupBonusAnalysis.valueInCents / 100).toFixed(0)}`
    } else if (topRewards.length > 0) {
      whyRecommended = `Good category multipliers for your spending pattern, especially ${topRewards[0].category}`
    } else {
      whyRecommended = 'Solid overall value with good approval odds'
    }
    
    return {
      whyRecommended,
      pros,
      cons,
      bestFor
    }
  }
  
  /**
   * Helper methods
   */
  private static getAnnualFeeTier(annualFee: number): AnnualFeeTier {
    if (annualFee === 0) return AnnualFeeTier.NO_FEE
    if (annualFee <= 150) return AnnualFeeTier.LOW_FEE
    if (annualFee <= 300) return AnnualFeeTier.MID_FEE
    if (annualFee <= 500) return AnnualFeeTier.HIGH_FEE
    return AnnualFeeTier.PREMIUM
  }
  
  private static estimateMinimumIncome(annualFee: number): number {
    // Rough estimate: 100x annual fee as minimum income
    if (annualFee === 0) return 25000
    if (annualFee <= 150) return 35000
    if (annualFee <= 300) return 60000
    if (annualFee <= 500) return 80000
    return 120000
  }
  
  static estimatePointType(card: EnhancedCardData): keyof typeof POINT_VALUATIONS {
    const name = card.name.toLowerCase()
    const bank = card.bank.toLowerCase()
    
    if (name.includes('aeroplan')) return 'AEROPLAN'
    if (name.includes('avion')) return 'AVION'
    if (name.includes('scene')) return 'SCENE_PLUS'
    if (name.includes('air miles')) return 'AIR_MILES'
    if (name.includes('aventura')) return 'AVENTURA'
    if (name.includes('marriott') || name.includes('bonvoy')) return 'MARRIOTT_BONVOY'
    if (name.includes('cash') || name.includes('cashback')) return 'CASHBACK'
    if (bank.includes('american express') || card.network === 'AMEX') return 'MEMBERSHIP_REWARDS'
    
    return 'CASHBACK' // Default to cashback
  }
  
  private static calculateConfidence(approvalProbability: number, categoryCount: number): number {
    // Base confidence on approval probability and data completeness
    const baseConfidence = approvalProbability * 70 // Max 70 from approval
    const dataConfidence = Math.min(30, categoryCount * 5) // Max 30 from data completeness
    
    return Math.round(baseConfidence + dataConfidence)
  }
}