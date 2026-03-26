# Database Seed Documentation

## Overview

The seed script populates the database with 5 realistic Canadian credit cards, their welcome bonuses, category multipliers, and sample redemption goals.

## Cards Included

### 1. American Express Cobalt Card

**Details:**
- Bank: American Express
- Network: AMEX
- Annual Fee: $156 ($12.99/month)
- Currency: CAD

**Welcome Bonus:**
- 30,000 Membership Rewards points
- Minimum Spend: $3,000
- Time Period: 3 months

**Category Multipliers:**
- Grocery: 5x points
- Dining: 5x points
- Gas: 2x points
- Travel: 3x points
- Recurring Bills: 1x points

**Best For:**
- Foodies and frequent diners
- Grocery shoppers
- Young professionals
- Points collectors

---

### 2. TD Aeroplan Visa Infinite

**Details:**
- Bank: TD Bank
- Network: VISA
- Annual Fee: $139
- Currency: CAD

**Welcome Bonus:**
- 50,000 Aeroplan points
- Minimum Spend: $3,000
- Time Period: 3 months

**Category Multipliers:**
- Grocery: 3x Aeroplan points
- Dining: 2x Aeroplan points
- Gas: 2x Aeroplan points
- Travel: 2x Aeroplan points
- Recurring Bills: 1.5x Aeroplan points

**Best For:**
- Frequent Air Canada travelers
- Aeroplan collectors
- Grocery shoppers
- Canadian travel enthusiasts

---

### 3. Scotiabank Momentum Visa Infinite

**Details:**
- Bank: Scotiabank
- Network: VISA
- Annual Fee: $120
- Currency: CAD

**Welcome Bonus:**
- $100 cashback (10,000 points)
- Minimum Spend: $3,000
- Time Period: 3 months

**Category Multipliers:**
- Grocery: 4% cashback
- Dining: 2% cashback
- Gas: 4% cashback
- Travel: 1% cashback
- Recurring Bills: 4% cashback

**Best For:**
- Cashback enthusiasts
- High grocery/gas spenders
- Budget-conscious users
- Simple rewards seekers

---

### 4. CIBC Aeroplan Visa

**Details:**
- Bank: CIBC
- Network: VISA
- Annual Fee: $0 (No annual fee)
- Currency: CAD

**Welcome Bonus:**
- 20,000 Aeroplan points
- Minimum Spend: $1,500
- Time Period: 3 months

**Category Multipliers:**
- Grocery: 2x Aeroplan points
- Dining: 1.5x Aeroplan points
- Gas: 1.5x Aeroplan points
- Travel: 1.5x Aeroplan points
- Recurring Bills: 1x Aeroplan points

**Best For:**
- First-time credit card users
- Budget-conscious travelers
- Occasional Aeroplan users
- Students and young adults

---

### 5. Scotiabank Passport Visa Infinite

**Details:**
- Bank: Scotiabank
- Network: VISA
- Annual Fee: $139
- Currency: CAD

**Welcome Bonus:**
- 40,000 Scene+ points
- Minimum Spend: $4,000
- Time Period: 4 months

**Category Multipliers:**
- Grocery: 2x Scene+ points
- Dining: 3x Scene+ points
- Gas: 2x Scene+ points
- Travel: 2x Scene+ points
- Recurring Bills: 1x Scene+ points

**Best For:**
- International travelers (no FX fees)
- Restaurant enthusiasts
- Scene+ program users
- Premium card seekers

---

## Sample Goals

The seed script also creates 5 sample redemption goals:

1. **Round-trip Flight to Tokyo**
   - 75,000 Aeroplan points
   - Estimated value: $3,000
   - Business class via Aeroplan

2. **Round-trip Flight to Europe**
   - 60,000 Aeroplan points
   - Estimated value: $1,200
   - Economy via Aeroplan

3. **Round-trip Flight to Caribbean**
   - 35,000 Aeroplan points
   - Estimated value: $700
   - Economy via Aeroplan

4. **$1,000 Cashback**
   - 100,000 cashback points
   - Estimated value: $1,000
   - Statement credit

5. **Luxury Hotel Stay**
   - 50,000 Scene+ points
   - Estimated value: $1,500
   - 5-night premium hotel stay

## Running the Seed Script

### Prerequisites

1. PostgreSQL database running
2. `.env` file configured with `DATABASE_URL`
3. Prisma schema pushed to database

### Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (if not done)
npm run db:push

# Run seed script
npm run db:seed

# Or use Prisma's built-in seed command
npx prisma db seed
```

### Expected Output

```
🌱 Starting database seed...
✅ Seeded: American Express Cobalt Card
✅ Seeded: TD Aeroplan Visa Infinite
✅ Seeded: Scotiabank Momentum Visa Infinite
✅ Seeded: CIBC Aeroplan Visa
✅ Seeded: Scotiabank Passport Visa Infinite
✅ Seeded: Sample Goals

📊 Seed Summary:
   Cards: 5
   Bonuses: 5
   Multipliers: 25
   Goals: 5

✨ Database seeded successfully!
```

## Database Structure After Seeding

### Cards Table
- 5 credit cards with complete details
- Each with unique ID, name, bank, network, and fees

### CardBonus Table
- 5 welcome bonus records
- One per card with points, requirements, and timeframes

### CardMultiplier Table
- 25 multiplier records
- 5 categories per card (Grocery, Dining, Gas, Travel, Recurring)

### Goal Table
- 5 sample redemption goals
- Various point types and values

## Upsert Strategy

The seed script uses `upsert` operations:
- **Safe to run multiple times**
- Won't create duplicates
- Updates existing records if IDs match
- Creates new records if they don't exist

### Example Upsert

```typescript
await prisma.card.upsert({
  where: { id: 'amex-cobalt-001' },
  update: {},  // Empty update = no changes to existing
  create: {    // Create if doesn't exist
    id: 'amex-cobalt-001',
    name: 'American Express Cobalt Card',
    // ... other fields
  },
})
```

## Verifying Seeded Data

### Using Prisma Studio

```bash
npm run db:studio
```

Opens a GUI at http://localhost:5555 to browse data.

### Using SQL Queries

```sql
-- Count cards
SELECT COUNT(*) FROM "Card";

-- View all cards with bonuses
SELECT c.name, c."annualFee", cb."bonusPoints", cb."pointType"
FROM "Card" c
LEFT JOIN "CardBonus" cb ON c.id = cb."cardId";

-- View multipliers by card
SELECT c.name, cm.category, cm."multiplierValue"
FROM "Card" c
LEFT JOIN "CardMultiplier" cm ON c.id = cm."cardId"
ORDER BY c.name, cm.category;

-- View all goals
SELECT name, "requiredPoints", "pointType", "estimatedValue"
FROM "Goal"
WHERE "isActive" = true;
```

### Using Prisma Client

```typescript
import { prisma } from '@/lib/prisma'

// Get all cards with relations
const cards = await prisma.card.findMany({
  include: {
    bonuses: true,
    multipliers: true,
  },
})

// Get cards by point type
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

## Customizing the Seed Data

### Adding a New Card

1. Open `prisma/seed.ts`
2. Add a new card block following the pattern:

```typescript
const newCard = await prisma.card.upsert({
  where: { id: 'unique-card-id' },
  update: {},
  create: {
    id: 'unique-card-id',
    name: 'Card Name',
    bank: 'Bank Name',
    network: CardNetwork.VISA,
    annualFee: 99,
    currency: 'CAD',
    baseImageUrl: '/cards/card-slug.png',
    isActive: true,
  },
})

// Add bonus
await prisma.cardBonus.upsert({
  where: { id: 'bonus-unique-id' },
  update: {},
  create: {
    id: 'bonus-unique-id',
    cardId: newCard.id,
    bonusPoints: 25000,
    pointType: PointType.AEROPLAN,
    minimumSpendAmount: 2000,
    spendPeriodMonths: 3,
    description: 'Bonus description',
    isActive: true,
  },
})

// Add multipliers
await prisma.cardMultiplier.createMany({
  data: [
    {
      id: 'mult-unique-grocery',
      cardId: newCard.id,
      category: SpendingCategory.GROCERY,
      multiplierValue: 2,
      description: '2x points on groceries',
      isActive: true,
    },
    // ... more categories
  ],
  skipDuplicates: true,
})
```

3. Run the seed script again

### Updating Existing Data

1. Modify the values in the `create` object
2. To actually update existing records, add fields to the `update` object:

```typescript
await prisma.card.upsert({
  where: { id: 'amex-cobalt-001' },
  update: {
    annualFee: 168,  // Update to new fee
  },
  create: {
    // ... create data
  },
})
```

3. Run the seed script

## Troubleshooting

### Error: "Unique constraint failed"

**Cause:** Trying to create a record with an ID that already exists.

**Solution:** Use `upsert` instead of `create`, or use `skipDuplicates: true` for `createMany`.

### Error: "Foreign key constraint failed"

**Cause:** Trying to create a bonus/multiplier before the card exists.

**Solution:** Ensure cards are created before their related records.

### Error: "Invalid enum value"

**Cause:** Using a value not defined in the Prisma schema enum.

**Solution:** Check `prisma/schema.prisma` for valid enum values:
- `CardNetwork`: VISA, MASTERCARD, AMEX, DISCOVER
- `SpendingCategory`: GROCERY, GAS, DINING, TRAVEL, RECURRING, etc.
- `PointType`: AEROPLAN, AVION, MEMBERSHIP_REWARDS, CASHBACK, etc.

### Database Connection Issues

**Cause:** PostgreSQL not running or wrong connection string.

**Solution:**
1. Check PostgreSQL is running
2. Verify `.env` file has correct `DATABASE_URL`
3. Test connection: `npx prisma db push`

## Integration with Application

### Using Seeded Data in Dashboard

The main dashboard (`app/page.tsx`) currently uses mock data. To use real database data:

1. Update `app/page.tsx` to fetch from database:

```typescript
import { CardService } from '@/lib/services/cardService'

// In component or server action
const cards = await CardService.getCardsByPointType('AEROPLAN')
```

2. Replace mock `MOCK_CARDS` array with database results

### Using Seeded Data in Comparisons

Update `lib/data/cards-database.ts` to fetch from database instead of using hardcoded data.

## Maintenance

### Regular Updates

- Update welcome bonuses when promotions change
- Adjust multipliers if card benefits change
- Add new cards as they launch
- Update annual fees annually
- Refresh goal values based on redemption rates

### Best Practices

- Always use `upsert` for idempotency
- Use meaningful IDs (e.g., `amex-cobalt-001`)
- Include descriptions for clarity
- Set `isActive: true` for current offers
- Keep historical data by setting `isActive: false`

## Data Sources

Card information based on:
- Official bank websites (as of March 2026)
- Current promotional offers
- Standard earning rates
- Typical welcome bonuses

**Note:** Always verify current offers on official bank websites before making financial decisions.

---

**Last Updated:** March 7, 2026

**Next Review:** April 7, 2026
