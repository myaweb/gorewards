/**
 * Merchant Normalization Service
 * 
 * STEP 7 FIX: Transaction Intelligence Layer
 * 
 * Architecture Rule: This service sits between Plaid and the reward engine.
 * All raw transaction data must pass through normalization before analysis.
 * 
 * Flow: Plaid transaction → normalization → category lookup → confidence score → reward engine
 */

import { SpendingCategory } from '@prisma/client'
import { MERCHANT_PATTERNS, CATEGORY_KEYWORDS } from '@/lib/data/merchantCategories'
import { securityLogger } from './securityLogger'
import { generateCorrelationId, generateSessionId } from '../utils/crypto'

export interface NormalizedMerchant {
  originalName: string
  normalizedName: string
  suggestedCategory: SpendingCategory | null
  confidence: number
  matchedPattern?: string
}

export interface PlaidTransaction {
  transaction_id: string
  name: string
  merchant_name?: string
  amount: number
  category?: string[]
  date: string
}

export interface NormalizedTransaction {
  transactionId: string
  merchantName: string
  normalizedMerchant: string
  amount: number
  date: string
  suggestedCategory: SpendingCategory | null
  categoryConfidence: number
  plaidCategories: string[]
  needsReview: boolean
}

export class MerchantNormalizerService {
  
  /**
   * Normalize merchant name
   * Example: "WALMART SUPERCENTER #123 TORONTO" → "walmart"
   */
  normalizeMerchantName(merchantName: string): string {
    return merchantName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ') // Replace special chars with space
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .replace(/\b(store|supercenter|supermarket|inc|ltd|llc|corp)\b/gi, '') // Remove common suffixes
      .replace(/\b\d+\b/g, '') // Remove standalone numbers
      .trim()
  }

  /**
   * Lookup merchant category using pattern matching
   */
  lookupMerchantCategory(normalizedName: string): NormalizedMerchant {
    const correlationId = generateCorrelationId()

    try {
      // Check high-confidence patterns first
      for (const pattern of MERCHANT_PATTERNS) {
        const regex = pattern.pattern instanceof RegExp 
          ? pattern.pattern 
          : new RegExp(pattern.pattern, 'i')
        
        if (regex.test(normalizedName)) {
          securityLogger.logInfo('Merchant pattern matched', {
            normalizedName,
            category: pattern.category,
            confidence: pattern.confidence,
            correlationId
          })

          return {
            originalName: normalizedName,
            normalizedName,
            suggestedCategory: pattern.category,
            confidence: pattern.confidence,
            matchedPattern: pattern.pattern.toString()
          }
        }
      }

      // Fallback to keyword matching
      const keywordMatch = this.matchByKeywords(normalizedName)
      if (keywordMatch) {
        return keywordMatch
      }

      // No match found
      securityLogger.logWarn('No merchant category match found', {
        normalizedName,
        correlationId
      })

      return {
        originalName: normalizedName,
        normalizedName,
        suggestedCategory: null,
        confidence: 0.5
      }

    } catch (error) {
      securityLogger.logError('Merchant lookup error', error as Error, {
        normalizedName,
        correlationId
      })

      return {
        originalName: normalizedName,
        normalizedName,
        suggestedCategory: null,
        confidence: 0.3
      }
    }
  }

  /**
   * Match merchant by category keywords
   */
  private matchByKeywords(normalizedName: string): NormalizedMerchant | null {
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      const matchCount = keywords.filter(keyword => 
        normalizedName.includes(keyword.toLowerCase())
      ).length

      if (matchCount > 0) {
        const confidence = Math.min(0.7 + (matchCount * 0.1), 0.85)
        
        return {
          originalName: normalizedName,
          normalizedName,
          suggestedCategory: category as SpendingCategory,
          confidence
        }
      }
    }

    return null
  }

  /**
   * Normalize Plaid transaction
   * 
   * Architecture Rule: This is the ONLY entry point for Plaid transactions
   * into the reward calculation system.
   */
  normalizeTransaction(plaidTransaction: PlaidTransaction): NormalizedTransaction {
    const correlationId = generateCorrelationId()

    try {
      // Use merchant_name if available, otherwise use name
      const rawMerchantName = plaidTransaction.merchant_name || plaidTransaction.name
      const normalizedName = this.normalizeMerchantName(rawMerchantName)
      
      // Lookup category
      const merchantInfo = this.lookupMerchantCategory(normalizedName)
      
      // Determine if needs review (low confidence)
      const needsReview = merchantInfo.confidence < 0.7

      const normalized: NormalizedTransaction = {
        transactionId: plaidTransaction.transaction_id,
        merchantName: rawMerchantName,
        normalizedMerchant: normalizedName,
        amount: plaidTransaction.amount,
        date: plaidTransaction.date,
        suggestedCategory: merchantInfo.suggestedCategory,
        categoryConfidence: merchantInfo.confidence,
        plaidCategories: plaidTransaction.category || [],
        needsReview
      }

      // Log normalization
      securityLogger.logInfo('Transaction normalized', {
        transactionId: plaidTransaction.transaction_id,
        merchantName: rawMerchantName,
        normalizedMerchant: normalizedName,
        suggestedCategory: merchantInfo.suggestedCategory,
        confidence: merchantInfo.confidence,
        needsReview,
        correlationId
      })

      return normalized

    } catch (error) {
      securityLogger.logError('Transaction normalization error', error as Error, {
        transactionId: plaidTransaction.transaction_id,
        correlationId
      })

      // Return safe default
      return {
        transactionId: plaidTransaction.transaction_id,
        merchantName: plaidTransaction.name,
        normalizedMerchant: this.normalizeMerchantName(plaidTransaction.name),
        amount: plaidTransaction.amount,
        date: plaidTransaction.date,
        suggestedCategory: null,
        categoryConfidence: 0.3,
        plaidCategories: plaidTransaction.category || [],
        needsReview: true
      }
    }
  }

  /**
   * Batch normalize transactions
   */
  normalizeTransactions(plaidTransactions: PlaidTransaction[]): NormalizedTransaction[] {
    return plaidTransactions.map(tx => this.normalizeTransaction(tx))
  }
}

// Singleton instance
export const merchantNormalizer = new MerchantNormalizerService()
