# RouteEngine & CardService Documentation

## Overview

The RouteEngine is the core optimization algorithm for the Credit Card Rewards Optimization Engine. It calculates the optimal strategy for earning points based on user spending patterns and available credit cards.

## Architecture

```
lib/
├── services/
│   ├── routeEngine.ts          # Core optimization algorithm
│   ├── cardService.ts          # Database operations for cards
│   ├── examples/
│   │   ├── routeEngineExample.ts    # Basic usage examples
│   │   └── fullStackExample.ts      # Full-stack integration examples
│   └── __tests__/
│       └── routeEngine.test.ts      # Unit tests
├── types/
│   └── spending.ts             # TypeScript types and interfaces
└── validations/
    └── card.ts                 # Zod validation schemas
```

## Core Concepts

### SpendingProfile

Represents a user's monthly spending across four categories:

```typescript
type SpendingProfile = {
  grocery: number    // Monthly grocery spending
  gas: number        // Monthly gas spending
  dining: number     // Monthly dining spending
  recurring: number  // Monthly recurring bills/subscriptions
}
```

### Goal

Represents a redemption target:

```typescript
type Goal = {
  id: string
  name: string
  requiredPoints: number
  pointType: string  // e.g., 'AEROPLAN', 'AVION', etc.
}
```

### CardWithDetails

Card with all related bonuses and multipliers:

```typescript
type CardWithDetails = {
  id: string
  name: string
  bank: string
  network: string
  annualFee: number
  bonuses: Array<{
    id: string
    bonusPoints: number
    pointType: string
    minimumSpendAmount: number
    spendPeriodMonths: number
  }>
  multipliers: Array<{
    id: string
    category: string
    multiplierValue: number
  }>
}
```

## RouteEngine API

### Main Method

#### `calculateOptimalRoadmap()`

Calculates the optimal strategy to reach a goal.

```typescript
RouteEngine.calculateOptimalRoadmap(
  monthlySpending: SpendingProfile,
  targetGoal: Goal,
  availableCards: CardWithDetails[]
): OptimalRoadmap
```

**Returns:**
```typescript
{
  steps: RoadmapStep[]           // Chronological action steps
  totalMonths: number            // Total months to goal
  totalPointsEarned: number      // Total points accumulated
  goalAchieved: boolean          // Whether goal was reached
  efficiency: {
    pointsPerDollar: number      // Average earning rate
    monthsToGoal: number         // Months until goal reached
    totalSpend: number           // Total spending required
  }
}
```

### Utility Methods

#### `validateSpendingProfile()`

Validates that all spending values are non-negative.

```typescript
RouteEngine.validateSpendingProfile(spending: SpendingProfile): boolean
```

#### `calculateBonusCompletionTime()`

Calculates months needed to meet a bonus requirement.

```typescript
RouteEngine.calculateBonusCompletionTime(
  minimumSpend: number,
  monthlySpending: number
): number
```

#### `compareCards()`

Compares two cards for a specific spending profile.

```typescript
RouteEngine.compareCards(
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
}
```

## CardService API

### Query Methods

#### `getAllCardsWithDetails()`

Fetch all active cards with bonuses and multipliers.

```typescript
await CardService.getAllCardsWithDetails(): Promise<CardWithDetails[]>
```

#### `getCardsByPointType()`

Fetch cards that earn a specific point type.

```typescript
await CardService.getCardsByPointType(
  pointType: PointType
): Promise<CardWithDetails[]>
```

#### `getCardById()`

Fetch a single card by ID.

```typescript
await CardService.getCardById(
  cardId: string
): Promise<CardWithDetails | null>
```

#### `getCardsByBank()`

Fetch cards from a specific bank.

```typescript
await CardService.getCardsByBank(
  bank: string
): Promise<CardWithDetails[]>
```

#### `getCardsByNetwork()`

Fetch cards by network (VISA, MASTERCARD, AMEX, etc.).

```typescript
await CardService.getCardsByNetwork(
  network: string
): Promise<CardWithDetails[]>
```

#### `searchCards()`

Search cards by name or bank.

```typescript
await CardService.searchCards(
  query: string
): Promise<CardWithDetails[]>
```

#### `getTopBonusCards()`

Get cards with highest bonuses for a point type.

```typescript
await CardService.getTopBonusCards(
  pointType: PointType,
  limit: number = 5
): Promise<CardWithDetails[]>
```

#### `getCardStatistics()`

Get aggregate statistics about cards.

```typescript
await CardService.getCardStatistics(): Promise<{
  totalCards: number
  cardsByNetwork: Array<{ network: string, _count: number }>
  cardsByBank: Array<{ bank: string, _count: number }>
  averageAnnualFee: number
  totalBonuses: number
}>
```

## Algorithm Details

### Optimization Strategy

The RouteEngine uses a greedy algorithm with the following priorities:

1. **Maximize Bonus Value**: Prioritizes cards with high signup bonuses
2. **Optimize Category Spending**: Routes spending to highest multiplier categories
3. **Minimize Time to Goal**: Sequences cards to reach goal fastest
4. **Respect Natural Spending**: Never exceeds user's actual spending capacity

### Card Ranking Formula

Cards are scored using:

```
score = (bonusPoints / bonusMonths) * 2 + monthlyEarningRate
```

Where:
- `bonusPoints / bonusMonths`: Average bonus value per month
- Multiplied by 2 to weight time-limited bonuses higher
- `monthlyEarningRate`: Ongoing points from category multipliers

### Roadmap Building Process

1. **Filter Cards**: Only cards matching target point type
2. **Rank Cards**: Sort by value score (highest first)
3. **Sequential Application**: Apply for cards one at a time
4. **Bonus Completion**: Focus spending on completing active bonuses
5. **Point Tracking**: Accumulate points month-by-month
6. **Goal Check**: Stop when goal is reached or cards exhausted

## Usage Examples

### Example 1: Basic Roadmap

```typescript
import { RouteEngine } from '@/lib/services/routeEngine'

const spending = {
  grocery: 1000,
  gas: 300,
  dining: 500,
  recurring: 400,
}

const goal = {
  id: 'goal-1',
  name: 'Flight to Europe',
  requiredPoints: 60000,
  pointType: 'AEROPLAN',
}

const cards = [/* ... card data ... */]

const roadmap = RouteEngine.calculateOptimalRoadmap(
  spending,
  goal,
  cards
)

console.log(`Reach goal in ${roadmap.totalMonths} months`)
roadmap.steps.forEach(step => {
  console.log(`Month ${step.month}: ${step.action} ${step.cardName}`)
})
```

### Example 2: With Database

```typescript
import { RouteEngine } from '@/lib/services/routeEngine'
import { CardService } from '@/lib/services/cardService'

const spending = { grocery: 1000, gas: 300, dining: 500, recurring: 400 }
const goal = { id: '1', name: 'Trip', requiredPoints: 60000, pointType: 'AEROPLAN' }

// Fetch cards from database
const cards = await CardService.getCardsByPointType('AEROPLAN')

// Calculate roadmap
const roadmap = RouteEngine.calculateOptimalRoadmap(spending, goal, cards)
```

### Example 3: Card Comparison

```typescript
const card1 = await CardService.getCardById('card-1')
const card2 = await CardService.getCardById('card-2')

const comparison = RouteEngine.compareCards(
  card1,
  card2,
  spending,
  'AEROPLAN',
  12
)

console.log(`Better card: ${comparison.betterCard.name}`)
console.log(`Difference: ${comparison.difference} points`)
```

## Testing

Run tests:

```bash
npm test
```

Run specific test file:

```bash
npm test routeEngine.test.ts
```

Watch mode:

```bash
npm run test:watch
```

## Performance Considerations

- **Time Complexity**: O(n * m) where n = number of cards, m = months to goal
- **Space Complexity**: O(m) for storing roadmap steps
- **Database Queries**: Use indexes on `pointType`, `isActive`, `cardId`
- **Optimization**: Cards are pre-filtered and ranked before roadmap building

## Error Handling

The RouteEngine throws errors for:

- Zero or negative spending values
- No cards available for target point type
- Invalid spending profile

Always wrap calls in try-catch:

```typescript
try {
  const roadmap = RouteEngine.calculateOptimalRoadmap(spending, goal, cards)
} catch (error) {
  console.error('Optimization failed:', error.message)
}
```

## Future Enhancements

Potential improvements:

1. **Multi-Goal Optimization**: Optimize for multiple goals simultaneously
2. **Dynamic Programming**: Use DP for globally optimal solutions
3. **Risk Analysis**: Factor in approval odds and credit score impact
4. **Seasonal Bonuses**: Account for limited-time category bonuses
5. **Point Transfers**: Optimize transfer ratios between programs
6. **Annual Fee Timing**: Optimize when to pay/cancel cards
