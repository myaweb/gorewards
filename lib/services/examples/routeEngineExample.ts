/**
 * Example usage of the RouteEngine
 * This demonstrates how to use the RouteEngine to calculate optimal card strategies
 */

import { RouteEngine } from '../routeEngine'
import type { SpendingProfile, CardWithDetails } from '../../types/spending'

// Example 1: Basic usage with a single goal
export function exampleBasicUsage() {
  // Define user's monthly spending
  const monthlySpending: SpendingProfile = {
    grocery: 1000,  // $1000/month on groceries
    gas: 300,       // $300/month on gas
    dining: 500,    // $500/month on dining
    recurring: 400, // $400/month on subscriptions/bills
  }

  // Define the target goal
  const targetGoal = {
    id: 'goal-1',
    name: 'Round-trip flight to Tokyo',
    requiredPoints: 75000,
    pointType: 'AEROPLAN',
  }

  // Define available cards with their bonuses and multipliers
  const availableCards: CardWithDetails[] = [
    {
      id: 'card-1',
      name: 'TD Aeroplan Visa Infinite',
      bank: 'TD',
      network: 'VISA',
      annualFee: 139,
      baseRewardRate: 0.01,
      bonuses: [
        {
          id: 'bonus-1',
          bonusPoints: 50000,
          pointType: 'AEROPLAN',
          minimumSpendAmount: 3000,
          spendPeriodMonths: 3,
        },
      ],
      multipliers: [
        { id: 'm1', category: 'GROCERY', multiplierValue: 3 },
        { id: 'm2', category: 'GAS', multiplierValue: 2 },
        { id: 'm3', category: 'DINING', multiplierValue: 2 },
        { id: 'm4', category: 'RECURRING', multiplierValue: 1.5 },
      ],
    },
    {
      id: 'card-2',
      name: 'CIBC Aeroplan Visa',
      bank: 'CIBC',
      network: 'VISA',
      annualFee: 0,
      baseRewardRate: 0.01,
      bonuses: [
        {
          id: 'bonus-2',
          bonusPoints: 20000,
          pointType: 'AEROPLAN',
          minimumSpendAmount: 1500,
          spendPeriodMonths: 3,
        },
      ],
      multipliers: [
        { id: 'm5', category: 'GROCERY', multiplierValue: 2 },
        { id: 'm6', category: 'GAS', multiplierValue: 1.5 },
        { id: 'm7', category: 'DINING', multiplierValue: 1.5 },
        { id: 'm8', category: 'RECURRING', multiplierValue: 1 },
      ],
    },
  ]

  // Calculate the optimal roadmap
  const roadmap = RouteEngine.calculateOptimalRoadmap(
    monthlySpending,
    targetGoal,
    availableCards
  )

  console.log('=== OPTIMAL ROADMAP ===')
  console.log(`Goal: ${targetGoal.name} (${targetGoal.requiredPoints} points)`)
  console.log(`Total Months: ${roadmap.totalMonths}`)
  console.log(`Goal Achieved: ${roadmap.goalAchieved}`)
  console.log(`Total Points Earned: ${roadmap.totalPointsEarned}`)
  console.log(`\nEfficiency Metrics:`)
  console.log(`  - Points per Dollar: ${roadmap.efficiency.pointsPerDollar.toFixed(2)}`)
  console.log(`  - Months to Goal: ${roadmap.efficiency.monthsToGoal}`)
  console.log(`  - Total Spend: $${roadmap.efficiency.totalSpend.toFixed(2)}`)
  console.log('\n=== ROADMAP STEPS ===')

  roadmap.steps.forEach((step, index) => {
    console.log(`\nStep ${index + 1} - Month ${step.month}`)
    console.log(`Action: ${step.action}`)
    console.log(`Card: ${step.cardName}`)

    if (step.action === 'USE') {
      console.log('Category Allocations:')
      step.categoryAllocations.forEach(cat => {
        console.log(`  - ${cat.category}: $${cat.amount} × ${cat.multiplier}x = ${cat.pointsEarned} points`)
      })

      if (step.bonusProgress) {
        console.log(`Bonus Progress: $${step.bonusProgress.currentSpend}/$${step.bonusProgress.requiredSpend}`)
        if (step.bonusProgress.bonusEarned) {
          console.log(`  ✓ BONUS EARNED: ${step.bonusProgress.bonusPoints} points!`)
        }
      }

      console.log(`Monthly Points: ${step.monthlyPointsEarned}`)
      console.log(`Cumulative Points: ${step.cumulativePoints}`)
      console.log(`Goal Completion: ${step.projectedGoalCompletion.toFixed(1)}%`)
    }
  })

  return roadmap
}

// Example 2: Comparing multiple cards
export function exampleCompareCards() {
  const spending: SpendingProfile = {
    grocery: 800,
    gas: 200,
    dining: 600,
    recurring: 500,
  }

  const card1: CardWithDetails = {
    id: 'card-a',
    name: 'High Grocery Multiplier Card',
    bank: 'Bank A',
    network: 'VISA',
    annualFee: 120,
    baseRewardRate: 0.01,
    bonuses: [
      {
        id: 'bonus-a',
        bonusPoints: 30000,
        pointType: 'AEROPLAN',
        minimumSpendAmount: 3000,
        spendPeriodMonths: 3,
      },
    ],
    multipliers: [
      { id: 'm1', category: 'GROCERY', multiplierValue: 5 },
      { id: 'm2', category: 'GAS', multiplierValue: 1 },
      { id: 'm3', category: 'DINING', multiplierValue: 1 },
      { id: 'm4', category: 'RECURRING', multiplierValue: 1 },
    ],
  }

  const card2: CardWithDetails = {
    id: 'card-b',
    name: 'Balanced Multiplier Card',
    bank: 'Bank B',
    network: 'MASTERCARD',
    annualFee: 95,
    baseRewardRate: 0.01,
    bonuses: [
      {
        id: 'bonus-b',
        bonusPoints: 25000,
        pointType: 'AEROPLAN',
        minimumSpendAmount: 2000,
        spendPeriodMonths: 3,
      },
    ],
    multipliers: [
      { id: 'm5', category: 'GROCERY', multiplierValue: 3 },
      { id: 'm6', category: 'GAS', multiplierValue: 2 },
      { id: 'm7', category: 'DINING', multiplierValue: 3 },
      { id: 'm8', category: 'RECURRING', multiplierValue: 2 },
    ],
  }

  const comparison = RouteEngine.compareCards(
    card1,
    card2,
    spending,
    'AEROPLAN',
    12 // 12-month horizon
  )

  console.log('=== CARD COMPARISON ===')
  console.log(`Card 1: ${card1.name}`)
  console.log(`  Value over 12 months: ${comparison.card1Value.toFixed(2)} points`)
  console.log(`\nCard 2: ${card2.name}`)
  console.log(`  Value over 12 months: ${comparison.card2Value.toFixed(2)} points`)
  console.log(`\nBetter Card: ${comparison.betterCard.name}`)
  console.log(`Difference: ${comparison.difference.toFixed(2)} points`)

  return comparison
}

// Example 3: Calculate bonus completion time
export function exampleBonusCompletion() {
  const minimumSpend = 5000
  const monthlySpending = 2200

  const months = RouteEngine.calculateBonusCompletionTime(
    minimumSpend,
    monthlySpending
  )

  console.log('=== BONUS COMPLETION TIME ===')
  console.log(`Minimum Spend Required: $${minimumSpend}`)
  console.log(`Monthly Spending: $${monthlySpending}`)
  console.log(`Months to Complete: ${months}`)

  return months
}

// Example 4: Validate spending profile
export function exampleValidateSpending() {
  const validSpending: SpendingProfile = {
    grocery: 1000,
    gas: 300,
    dining: 500,
    recurring: 400,
  }

  const invalidSpending: SpendingProfile = {
    grocery: -100,
    gas: 300,
    dining: 500,
    recurring: 400,
  }

  console.log('=== SPENDING VALIDATION ===')
  console.log(`Valid Spending: ${RouteEngine.validateSpendingProfile(validSpending)}`)
  console.log(`Invalid Spending: ${RouteEngine.validateSpendingProfile(invalidSpending)}`)

  return {
    valid: RouteEngine.validateSpendingProfile(validSpending),
    invalid: RouteEngine.validateSpendingProfile(invalidSpending),
  }
}

// Run all examples
if (require.main === module) {
  console.log('\n📊 Running RouteEngine Examples\n')
  
  console.log('\n' + '='.repeat(50))
  exampleBasicUsage()
  
  console.log('\n' + '='.repeat(50))
  exampleCompareCards()
  
  console.log('\n' + '='.repeat(50))
  exampleBonusCompletion()
  
  console.log('\n' + '='.repeat(50))
  exampleValidateSpending()
}
