#!/usr/bin/env tsx

/**
 * Validation script for the production database refactor
 * Tests that all components work correctly with the new database structure
 */

import { CardService } from '../lib/services/cardService'
import { RouteEngine } from '../lib/services/routeEngine'
import { calculateBestCards } from '../app/lib/recommendationEngine'

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
  
  const testSpending = {
    grocery: 1000,
    gas: 300,
    dining: 500,
    bills: 400
  }
  
  const recommendations = await calculateBestCards(testSpending)
  console.log(`   ✅ calculateBestCards: ${recommendations.length} recommendations`)
  
  if (recommendations.length > 0) {
    const topCard = recommendations[0]
    console.log(`   ✅ Top recommendation: ${topCard.name} (Net Value: $${topCard.netValue.toFixed(2)})`)
  }
  
  return recommendations
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
    name: 'Tokyo Flight',
    requiredPoints: 75000,
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