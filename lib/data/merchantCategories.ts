/**
 * Merchant Category Database
 * 
 * Lightweight, expandable merchant-to-category mapping system
 * for transaction intelligence layer.
 * 
 * Architecture Rule: This is the single source of truth for merchant categorization
 */

import { SpendingCategory } from '@prisma/client'

export interface MerchantPattern {
  pattern: string | RegExp
  category: SpendingCategory
  confidence: number
}

/**
 * High-confidence merchant patterns
 * These are well-known merchants with clear categorization
 */
export const MERCHANT_PATTERNS: MerchantPattern[] = [
  // GROCERY
  { pattern: /walmart/i, category: 'GROCERY', confidence: 0.95 },
  { pattern: /costco/i, category: 'GROCERY', confidence: 0.95 },
  { pattern: /loblaws/i, category: 'GROCERY', confidence: 0.95 },
  { pattern: /sobeys/i, category: 'GROCERY', confidence: 0.95 },
  { pattern: /metro/i, category: 'GROCERY', confidence: 0.90 },
  { pattern: /safeway/i, category: 'GROCERY', confidence: 0.95 },
  { pattern: /whole foods/i, category: 'GROCERY', confidence: 0.95 },
  { pattern: /trader joe/i, category: 'GROCERY', confidence: 0.95 },
  { pattern: /kroger/i, category: 'GROCERY', confidence: 0.95 },
  { pattern: /food basics/i, category: 'GROCERY', confidence: 0.95 },
  { pattern: /no frills/i, category: 'GROCERY', confidence: 0.95 },
  
  // GAS
  { pattern: /shell/i, category: 'GAS', confidence: 0.95 },
  { pattern: /esso/i, category: 'GAS', confidence: 0.95 },
  { pattern: /petro-?canada/i, category: 'GAS', confidence: 0.95 },
  { pattern: /chevron/i, category: 'GAS', confidence: 0.95 },
  { pattern: /exxon/i, category: 'GAS', confidence: 0.95 },
  { pattern: /bp/i, category: 'GAS', confidence: 0.95 },
  { pattern: /mobil/i, category: 'GAS', confidence: 0.95 },
  { pattern: /sunoco/i, category: 'GAS', confidence: 0.95 },
  { pattern: /husky/i, category: 'GAS', confidence: 0.95 },
  
  // DINING
  { pattern: /starbucks/i, category: 'DINING', confidence: 0.95 },
  { pattern: /mcdonald/i, category: 'DINING', confidence: 0.95 },
  { pattern: /tim hortons/i, category: 'DINING', confidence: 0.95 },
  { pattern: /subway/i, category: 'DINING', confidence: 0.90 },
  { pattern: /pizza/i, category: 'DINING', confidence: 0.85 },
  { pattern: /burger king/i, category: 'DINING', confidence: 0.95 },
  { pattern: /wendy/i, category: 'DINING', confidence: 0.95 },
  { pattern: /kfc/i, category: 'DINING', confidence: 0.95 },
  { pattern: /chipotle/i, category: 'DINING', confidence: 0.95 },
  { pattern: /panera/i, category: 'DINING', confidence: 0.95 },
  { pattern: /restaurant/i, category: 'DINING', confidence: 0.80 },
  { pattern: /cafe/i, category: 'DINING', confidence: 0.80 },
  
  // TRAVEL
  { pattern: /air canada/i, category: 'TRAVEL', confidence: 0.95 },
  { pattern: /westjet/i, category: 'TRAVEL', confidence: 0.95 },
  { pattern: /united airlines/i, category: 'TRAVEL', confidence: 0.95 },
  { pattern: /delta/i, category: 'TRAVEL', confidence: 0.90 },
  { pattern: /american airlines/i, category: 'TRAVEL', confidence: 0.95 },
  { pattern: /marriott/i, category: 'TRAVEL', confidence: 0.95 },
  { pattern: /hilton/i, category: 'TRAVEL', confidence: 0.95 },
  { pattern: /airbnb/i, category: 'TRAVEL', confidence: 0.95 },
  { pattern: /uber/i, category: 'TRAVEL', confidence: 0.90 },
  { pattern: /lyft/i, category: 'TRAVEL', confidence: 0.90 },
  { pattern: /expedia/i, category: 'TRAVEL', confidence: 0.95 },
  { pattern: /booking\.com/i, category: 'TRAVEL', confidence: 0.95 },
  
  // SHOPPING
  { pattern: /amazon/i, category: 'SHOPPING', confidence: 0.95 },
  { pattern: /best buy/i, category: 'SHOPPING', confidence: 0.95 },
  { pattern: /target/i, category: 'SHOPPING', confidence: 0.95 },
  { pattern: /canadian tire/i, category: 'SHOPPING', confidence: 0.95 },
  { pattern: /home depot/i, category: 'SHOPPING', confidence: 0.95 },
  { pattern: /lowes/i, category: 'SHOPPING', confidence: 0.95 },
  { pattern: /ikea/i, category: 'SHOPPING', confidence: 0.95 },
  
  // ENTERTAINMENT
  { pattern: /netflix/i, category: 'ENTERTAINMENT', confidence: 0.95 },
  { pattern: /spotify/i, category: 'ENTERTAINMENT', confidence: 0.95 },
  { pattern: /disney\+/i, category: 'ENTERTAINMENT', confidence: 0.95 },
  { pattern: /apple music/i, category: 'ENTERTAINMENT', confidence: 0.95 },
  { pattern: /youtube premium/i, category: 'ENTERTAINMENT', confidence: 0.95 },
  { pattern: /cineplex/i, category: 'ENTERTAINMENT', confidence: 0.95 },
  
  // UTILITIES / RECURRING
  { pattern: /rogers/i, category: 'RECURRING', confidence: 0.90 },
  { pattern: /bell canada/i, category: 'RECURRING', confidence: 0.90 },
  { pattern: /telus/i, category: 'RECURRING', confidence: 0.90 },
  { pattern: /hydro/i, category: 'UTILITIES', confidence: 0.90 },
  { pattern: /enbridge/i, category: 'UTILITIES', confidence: 0.90 },
  { pattern: /toronto hydro/i, category: 'UTILITIES', confidence: 0.95 },
]

/**
 * Category keywords for fuzzy matching
 */
export const CATEGORY_KEYWORDS: Record<SpendingCategory, string[]> = {
  GROCERY: ['grocery', 'supermarket', 'food', 'market', 'produce'],
  GAS: ['gas', 'fuel', 'petro', 'station'],
  DINING: ['restaurant', 'cafe', 'coffee', 'food', 'bar', 'grill'],
  RECURRING: ['subscription', 'monthly', 'bill', 'payment'],
  TRAVEL: ['airline', 'hotel', 'flight', 'resort', 'taxi', 'rental'],
  SHOPPING: ['shop', 'store', 'retail', 'mall'],
  ENTERTAINMENT: ['movie', 'theater', 'cinema', 'streaming', 'music'],
  UTILITIES: ['electric', 'water', 'power', 'utility'],
  STUDENT: ['student', 'university', 'college', 'education'],
  BUSINESS: ['business', 'corporate', 'company', 'office'],
  SIGNUP_BONUS: ['signup', 'bonus', 'welcome', 'offer'],
  OTHER: []
}
