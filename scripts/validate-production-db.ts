#!/usr/bin/env tsx

/**
 * Validation script for the production database refactor
 * Tests that all components work correctly with the new database structure
 */

import { CardService } from '../lib/services/cardService'
import { RouteEngine } from '../lib/services/routeEngine'
import { EnhancedRecommendationEngine } from '../lib/services/enhancedRecommendationEngine'
import { CreditScoreRange } from '../lib/types/recommendation'

async function validateCardService() {
  console.log('🧪 Testing CardService...')
  
  // Test 1: Get all cards
  const allCards = await CardService.getAllCardsWithDetails()
  console.log(`   ✅ getAllCardsWithDetails: ${allCards.length} cards`)
  
  // Test 2: Get cards by point type
  const aeroplanCards = await CardService.getCardsByPointType('AEROPLAN')
  console.log(`   ✅ getCardsByPointType(AEROPLAN): ${aeroplanCards.length} cards`)
  
  // Test 3: Search cards
  const amexCards = await CardService.searchCards('American Express')
  console.log(`   ✅ searchCards('American Express'): ${amexCards.length} cards`)
  
  // Test 4: Get statistics
  const stats = await CardService.getCardStatistics()
  console.log(`   ✅ getCardStatistics: ${stats.cards.active} active cards`)
  
  return allCards
}

async function validateRecommendationEngine() {
  console.log('\n🧪 Testing Recommendation Engine...')
  
  const testProfile = {
    spending: {
      grocery: 1000,
      gas: 300,
      dining: 500,
      bills: 400,
      travel: 100,
      shopping: 200,
      other: 150
    },
    creditScore: CreditScoreRange.GOOD,
    annualIncome: 75000,
    preferredPointTypes: ['AEROPLAN', 'CASHBACK'],
    maxAnnualFee: 200,
    prioritizeSignupBonus: true,
    timeHorizon: 'LONG_TERM' as const
  }
  
  const result = await EnhancedRecommendationEngine.getRecommendations(testProfile)
  console.log(`   ✅ getRecommendations: ${result.recommendations.length} recommendations`)
  
  if (result.recommendations.length > 0) {
    const topCard = result.recommendations[0]
    console.log(`   ✅ Top recommendation: ${topCard.card.name} (Approval: ${topCard.scores.approvalProbability}%)`)
  }
  
  return result.recommendations
}

async function validateRouteEngine(cards: any[]) {
  console.log('\n🧪 Testing RouteEngine...')
  
  const spendingProfile = {
    grocery: 1000,
    gas: 300,
    dining: 500,
    recurring: 400
  }
  
  const goal = {
    id: 'test-goal',
    name: 'Domestic Flight',
    requiredPoints: 25000,
    pointType: 'AEROPLAN'
  }
  
  const roadmap = RouteEngine.calculateOptimalRoadmap(spendingProfile, goal, cards)
  console.log(`   ✅ calculateOptimalRoadmap: ${roadmap.steps.length} steps`)
  console.log(`   ✅ Goal achieved: ${roadmap.goalAchieved}`)
  console.log(`   ✅ Total months: ${roadmap.totalMonths}`)
  
  return roadmap
}

async function main() {
  try {
    console.log('🚀 Validating Production Database Refactor...\n')
    
    // Test CardService
    const cards = await validateCardService()
    
    // Test RecommendationEngine
    const recommendations = await validateRecommendationEngine()
    
    // Test RouteEngine
    const roadmap = await validateRouteEngine(cards)
    
    console.log('\n📊 Validation Summary:')
    console.log(`   • Cards in database: ${cards.length}`)
    console.log(`   • Recommendations generated: ${recommendations.length}`)
    console.log(`   • Roadmap steps: ${roadmap.steps.length}`)
    console.log(`   • Goal achievable: ${roadmap.goalAchieved}`)
    
    if (cards.length > 0 && recommendations.length > 0 && roadmap.steps.length > 0) {
      console.log('\n🎉 All validations passed! Production database is ready.')
    } else {
      throw new Error('Validation failed: Missing data or functionality')
    }
    
  } catch (error) {
    console.error('\n❌ Validation failed:', error)
    process.exit(1)
  }
}

main()
