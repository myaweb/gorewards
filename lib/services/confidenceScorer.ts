/**
 * Confidence Scorer Service
 * 
 * Provides confidence scoring for transaction categorization
 * with learning from user corrections.
 */

import { securityLogger } from './securityLogger'
import { prisma } from '@/lib/prisma'
import { generateCorrelationId, generateSessionId } from '../utils/crypto'

export interface TransactionConfidence {
  transactionId: string
  category: string
  confidence: number
  factors: ConfidenceFactors
  needsReview: boolean
}

export interface ConfidenceFactors {
  merchantMatch: number
  amountPattern: number
  historicalData: number
  categoryConsistency: number
}

export interface UserCorrection {
  transactionId: string
  originalCategory: string
  correctedCategory: string
  merchantName: string
  amount: number
  userId: string
}

export class ConfidenceScorerService {
  private readonly lowConfidenceThreshold = 0.7
  private readonly merchantPatterns: Map<string, string> = new Map()
  private readonly userCorrections: Map<string, UserCorrection[]> = new Map()

  constructor() {
    this.initializeMerchantPatterns()
  }

  /**
   * Calculate confidence score for a transaction
   */
  async calculateConfidence(
    merchantName: string,
    amount: number,
    category: string,
    userId?: string
  ): Promise<TransactionConfidence> {
    const correlationId = generateCorrelationId()
    const transactionId = generateCorrelationId()

    try {
      // Calculate individual confidence factors
      const merchantMatch = this.calculateMerchantMatch(merchantName, category)
      const amountPattern = this.calculateAmountPattern(amount, category)
      const historicalData = userId 
        ? await this.calculateHistoricalConfidence(userId, merchantName, category)
        : 0.5
      const categoryConsistency = this.calculateCategoryConsistency(merchantName, category)

      // Weighted average of factors
      const confidence = (
        merchantMatch * 0.4 +
        amountPattern * 0.2 +
        historicalData * 0.3 +
        categoryConsistency * 0.1
      )

      const needsReview = confidence < this.lowConfidenceThreshold

      // Log low confidence transactions
      if (needsReview) {
        securityLogger.logWarn('Low confidence transaction detected', {
          transactionId,
          merchantName,
          category,
          confidence,
          correlationId
        })
      }

      return {
        transactionId,
        category,
        confidence,
        factors: {
          merchantMatch,
          amountPattern,
          historicalData,
          categoryConsistency
        },
        needsReview
      }

    } catch (error) {
      securityLogger.logError('Confidence calculation error', error as Error, {
        merchantName,
        category,
        correlationId
      })

      // Return low confidence on error
      return {
        transactionId,
        category,
        confidence: 0.5,
        factors: {
          merchantMatch: 0.5,
          amountPattern: 0.5,
          historicalData: 0.5,
          categoryConsistency: 0.5
        },
        needsReview: true
      }
    }
  }

  /**
   * Learn from user correction
   */
  async learnFromCorrection(correction: UserCorrection): Promise<void> {
    const correlationId = generateCorrelationId()

    try {
      // Store correction
      if (!this.userCorrections.has(correction.userId)) {
        this.userCorrections.set(correction.userId, [])
      }
      this.userCorrections.get(correction.userId)!.push(correction)

      // Update merchant patterns
      const normalizedMerchant = this.normalizeMerchantName(correction.merchantName)
      this.merchantPatterns.set(normalizedMerchant, correction.correctedCategory)

      // Log the learning event
      await securityLogger.logAuditEvent({
        userId: correction.userId,
        action: 'CATEGORY_CORRECTION',
        resource: 'transaction_category',
        resourceId: correction.transactionId,
        ipAddress: 'system',
        endpoint: '/api/transactions/correct',
        method: 'POST',
        correlationId,
        severity: 'INFO',
        category: 'DATA_MODIFICATION',
        oldData: { category: correction.originalCategory },
        newData: { category: correction.correctedCategory }
      })

      securityLogger.logInfo('Learned from user correction', {
        merchantName: correction.merchantName,
        originalCategory: correction.originalCategory,
        correctedCategory: correction.correctedCategory,
        correlationId
      })

    } catch (error) {
      securityLogger.logError('Failed to learn from correction', error as Error, {
        correction,
        correlationId
      })
    }
  }

  /**
   * Get low confidence transactions for a user
   */
  async getLowConfidenceTransactions(userId: string): Promise<TransactionConfidence[]> {
    // In a real implementation, this would query the database
    // For now, return empty array
    return []
  }

  /**
   * Calculate merchant name match confidence
   */
  private calculateMerchantMatch(merchantName: string, category: string): number {
    const normalized = this.normalizeMerchantName(merchantName)
    
    // Check if we have a pattern for this merchant
    const knownCategory = this.merchantPatterns.get(normalized)
    if (knownCategory === category) {
      return 1.0
    }

    // Check for partial matches
    const categoryKeywords = this.getCategoryKeywords(category)
    const matchCount = categoryKeywords.filter(keyword => 
      normalized.includes(keyword.toLowerCase())
    ).length

    return Math.min(matchCount / categoryKeywords.length, 1.0)
  }

  /**
   * Calculate amount pattern confidence
   */
  private calculateAmountPattern(amount: number, category: string): number {
    // Typical amount ranges for categories
    const typicalRanges: Record<string, { min: number; max: number }> = {
      GROCERY: { min: 20, max: 300 },
      GAS: { min: 30, max: 150 },
      DINING: { min: 10, max: 200 },
      TRAVEL: { min: 50, max: 5000 },
      UTILITIES: { min: 50, max: 500 },
      SHOPPING: { min: 10, max: 1000 }
    }

    const range = typicalRanges[category]
    if (!range) return 0.5

    if (amount >= range.min && amount <= range.max) {
      return 0.9
    } else if (amount < range.min * 0.5 || amount > range.max * 2) {
      return 0.3
    } else {
      return 0.6
    }
  }

  /**
   * Calculate historical confidence based on user's past transactions
   */
  private async calculateHistoricalConfidence(
    userId: string,
    merchantName: string,
    category: string
  ): Promise<number> {
    const corrections = this.userCorrections.get(userId) || []
    const normalized = this.normalizeMerchantName(merchantName)

    // Check if user has corrected this merchant before
    const merchantCorrections = corrections.filter(c => 
      this.normalizeMerchantName(c.merchantName) === normalized
    )

    if (merchantCorrections.length === 0) {
      return 0.5 // No historical data
    }

    // Check if corrections agree with current category
    const agreementCount = merchantCorrections.filter(c => 
      c.correctedCategory === category
    ).length

    return agreementCount / merchantCorrections.length
  }

  /**
   * Calculate category consistency
   */
  private calculateCategoryConsistency(merchantName: string, category: string): number {
    const normalized = this.normalizeMerchantName(merchantName)
    
    // Check if merchant name suggests a specific category
    const suggestedCategory = this.suggestCategoryFromName(normalized)
    
    if (suggestedCategory === category) {
      return 0.9
    } else if (suggestedCategory === 'UNKNOWN') {
      return 0.5
    } else {
      return 0.3
    }
  }

  /**
   * Normalize merchant name
   */
  private normalizeMerchantName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
  }

  /**
   * Get category keywords
   */
  private getCategoryKeywords(category: string): string[] {
    const keywords: Record<string, string[]> = {
      GROCERY: ['grocery', 'supermarket', 'food', 'market', 'walmart', 'costco', 'kroger', 'safeway'],
      GAS: ['gas', 'fuel', 'petro', 'shell', 'esso', 'chevron', 'exxon', 'bp'],
      DINING: ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonalds', 'pizza', 'burger', 'dining'],
      TRAVEL: ['airline', 'hotel', 'airbnb', 'uber', 'lyft', 'taxi', 'flight', 'resort'],
      UTILITIES: ['electric', 'water', 'gas', 'internet', 'phone', 'utility', 'power'],
      SHOPPING: ['amazon', 'target', 'shop', 'store', 'mall', 'retail'],
      ENTERTAINMENT: ['netflix', 'spotify', 'movie', 'theater', 'game', 'cinema']
    }

    return keywords[category] || []
  }

  /**
   * Suggest category from merchant name
   */
  private suggestCategoryFromName(normalizedName: string): string {
    const allKeywords: Record<string, string[]> = {
      GROCERY: ['grocery', 'supermarket', 'food', 'market', 'walmart', 'costco', 'kroger', 'safeway'],
      GAS: ['gas', 'fuel', 'petro', 'shell', 'esso', 'chevron', 'exxon', 'bp'],
      DINING: ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonalds', 'pizza', 'burger', 'dining'],
      TRAVEL: ['airline', 'hotel', 'airbnb', 'uber', 'lyft', 'taxi', 'flight', 'resort'],
      UTILITIES: ['electric', 'water', 'internet', 'phone', 'utility', 'power'],
      SHOPPING: ['amazon', 'target', 'shop', 'store', 'mall', 'retail'],
      ENTERTAINMENT: ['netflix', 'spotify', 'movie', 'theater', 'game', 'cinema']
    }

    for (const [category, keywords] of Object.entries(allKeywords)) {
      if (keywords.some(keyword => normalizedName.includes(keyword))) {
        return category
      }
    }
    return 'UNKNOWN'
  }

  /**
   * Initialize merchant patterns
   */
  private initializeMerchantPatterns(): void {
    // Common merchant patterns
    this.merchantPatterns.set('walmart', 'GROCERY')
    this.merchantPatterns.set('costco', 'GROCERY')
    this.merchantPatterns.set('shell', 'GAS')
    this.merchantPatterns.set('esso', 'GAS')
    this.merchantPatterns.set('starbucks', 'DINING')
    this.merchantPatterns.set('mcdonalds', 'DINING')
    this.merchantPatterns.set('amazon', 'SHOPPING')
    this.merchantPatterns.set('netflix', 'ENTERTAINMENT')
  }

  /**
   * Get confidence statistics
   */
  getStatistics() {
    let totalCorrections = 0
    for (const corrections of this.userCorrections.values()) {
      totalCorrections += corrections.length
    }

    return {
      merchantPatterns: this.merchantPatterns.size,
      totalCorrections,
      users: this.userCorrections.size,
      lowConfidenceThreshold: this.lowConfidenceThreshold
    }
  }
}

// Singleton instance
export const confidenceScorer = new ConfidenceScorerService()
