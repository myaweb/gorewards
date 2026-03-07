# Seed Data Quick Reference

## Quick Commands

```bash
# Seed database
npm run db:seed

# Or use Prisma's built-in command
npx prisma db seed

# View data in GUI
npm run db:studio
```

## Cards at a Glance

| Card | Annual Fee | Welcome Bonus | Best Category | Point Type |
|------|-----------|---------------|---------------|------------|
| **Amex Cobalt** | $156 | 30,000 pts | Grocery/Dining (5x) | Membership Rewards |
| **TD Aeroplan** | $139 | 50,000 pts | Grocery (3x) | Aeroplan |
| **Scotia Momentum** | $120 | $100 back | Grocery/Gas (4%) | Cashback |
| **CIBC Aeroplan** | $0 | 20,000 pts | Grocery (2x) | Aeroplan |
| **Scotia Passport** | $139 | 40,000 pts | Dining (3x) | Scene+ |

## Multiplier Comparison

### Grocery
1. Amex Cobalt: **5x**
2. TD Aeroplan: **3x**
3. Scotia Momentum: **4%**
4. CIBC Aeroplan: **2x**
5. Scotia Passport: **2x**

### Dining
1. Amex Cobalt: **5x**
2. Scotia Passport: **3x**
3. TD Aeroplan: **2x**
4. Scotia Momentum: **2%**
5. CIBC Aeroplan: **1.5x**

### Gas
1. Scotia Momentum: **4%**
2. Amex Cobalt: **2x**
3. TD Aeroplan: **2x**
4. Scotia Passport: **2x**
5. CIBC Aeroplan: **1.5x**

### Travel
1. Amex Cobalt: **3x**
2. TD Aeroplan: **2x**
3. Scotia Passport: **2x**
4. CIBC Aeroplan: **1.5x**
5. Scotia Momentum: **1%**

## Welcome Bonus Requirements

| Card | Bonus | Min Spend | Months |
|------|-------|-----------|--------|
| TD Aeroplan | 50,000 pts | $3,000 | 3 |
| Scotia Passport | 40,000 pts | $4,000 | 4 |
| Amex Cobalt | 30,000 pts | $3,000 | 3 |
| CIBC Aeroplan | 20,000 pts | $1,500 | 3 |
| Scotia Momentum | $100 | $3,000 | 3 |

## Sample Goals

| Goal | Points Needed | Point Type | Est. Value |
|------|--------------|------------|------------|
| Tokyo Flight | 75,000 | Aeroplan | $3,000 |
| Europe Flight | 60,000 | Aeroplan | $1,200 |
| Caribbean Flight | 35,000 | Aeroplan | $700 |
| $1,000 Cashback | 100,000 | Cashback | $1,000 |
| Hotel Stay | 50,000 | Scene+ | $1,500 |

## Card IDs (for queries)

```typescript
// Card IDs
'amex-cobalt-001'
'td-aeroplan-001'
'scotia-momentum-001'
'cibc-aeroplan-001'
'scotia-passport-001'

// Bonus IDs
'bonus-amex-cobalt-001'
'bonus-td-aeroplan-001'
'bonus-scotia-momentum-001'
'bonus-cibc-aeroplan-001'
'bonus-scotia-passport-001'

// Goal IDs
'goal-tokyo-flight'
'goal-europe-flight'
'goal-caribbean-flight'
'goal-cashback-1000'
'goal-hotel-stay'
```

## Quick Queries

### Get all cards with bonuses
```typescript
const cards = await prisma.card.findMany({
  include: {
    bonuses: true,
    multipliers: true,
  },
})
```

### Get Aeroplan cards
```typescript
const aeroplanCards = await prisma.card.findMany({
  where: {
    bonuses: {
      some: {
        pointType: 'AEROPLAN',
      },
    },
  },
  include: {
    bonuses: true,
    multipliers: true,
  },
})
```

### Get cards with no annual fee
```typescript
const freeCards = await prisma.card.findMany({
  where: {
    annualFee: 0,
  },
  include: {
    bonuses: true,
    multipliers: true,
  },
})
```

### Get highest grocery multipliers
```typescript
const groceryCards = await prisma.cardMultiplier.findMany({
  where: {
    category: 'GROCERY',
  },
  include: {
    card: true,
  },
  orderBy: {
    multiplierValue: 'desc',
  },
})
```

## Best Card For...

### Foodies
**Winner:** Amex Cobalt
- 5x on dining and groceries
- Best overall for food spending

### Travelers
**Winner:** TD Aeroplan
- 50,000 point welcome bonus
- Strong Aeroplan earning
- Travel benefits

### Budget Conscious
**Winner:** CIBC Aeroplan
- No annual fee
- Decent earning rates
- Lower bonus requirement

### Cashback Lovers
**Winner:** Scotia Momentum
- 4% on grocery, gas, recurring
- Simple cashback structure
- No point conversions

### International Travelers
**Winner:** Scotia Passport
- No foreign transaction fees
- Airport lounge access
- Strong dining rewards

## Testing the Seed

### Verify Card Count
```bash
npx prisma studio
# Navigate to Card table
# Should see 5 cards
```

### Check Multipliers
```sql
SELECT c.name, cm.category, cm."multiplierValue"
FROM "Card" c
JOIN "CardMultiplier" cm ON c.id = cm."cardId"
WHERE cm.category = 'GROCERY'
ORDER BY cm."multiplierValue" DESC;
```

### Validate Bonuses
```sql
SELECT c.name, cb."bonusPoints", cb."minimumSpendAmount"
FROM "Card" c
JOIN "CardBonus" cb ON c.id = cb."cardId"
ORDER BY cb."bonusPoints" DESC;
```

## Resetting Data

### Clear all data
```sql
TRUNCATE TABLE "CardMultiplier" CASCADE;
TRUNCATE TABLE "CardBonus" CASCADE;
TRUNCATE TABLE "Card" CASCADE;
TRUNCATE TABLE "Goal" CASCADE;
```

### Re-seed
```bash
npm run db:seed
```

## Common Use Cases

### 1. Find best card for $1,200 grocery spending
```typescript
// Amex Cobalt: 1200 * 5 = 6,000 points/month
// TD Aeroplan: 1200 * 3 = 3,600 points/month
// Scotia Momentum: 1200 * 0.04 = $48/month
```

### 2. Calculate time to reach Tokyo goal
```typescript
// Goal: 75,000 Aeroplan points
// TD Aeroplan bonus: 50,000 points
// Remaining: 25,000 points
// Monthly earning (example): 5,000 points
// Time: 5 months (3 for bonus + 2 for remaining)
```

### 3. Compare annual value
```typescript
// Amex Cobalt: High earning - $156 fee = Net value
// CIBC Aeroplan: Lower earning - $0 fee = Good for light users
```

---

**Quick Tip:** Run `npm run db:studio` to visually explore all seeded data!
