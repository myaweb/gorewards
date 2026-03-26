# Card Sync Bot Documentation

## Overview

The Card Sync Bot is an automated system that populates and updates the BonusGo credit card database with the latest Canadian credit card data. It ensures our recommendation engine always has access to current card information.

## Architecture

### Components

1. **Master Data File** (`app/lib/cardData.ts`)
   - Contains 30+ Canadian credit cards
   - Includes all major banks: Amex, TD, RBC, CIBC, Scotiabank, BMO, National Bank, Tangerine, Desjardins
   - Structured data with accurate multipliers and fees

2. **Sync API Endpoint** (`app/api/admin/sync-cards/route.ts`)
   - POST endpoint that performs the sync operation
   - Uses Prisma's `upsert` to create or update cards
   - Returns detailed sync statistics

3. **Sync Script** (`scripts/sync-cards.ts`)
   - Command-line tool to trigger the sync
   - Provides formatted output and error handling

## Database Schema

The `CreditCard` model uses the `name` field as a unique identifier:

```prisma
model CreditCard {
  id                 String   @id @default(cuid())
  name               String   @unique  // Used for upsert operations
  bank               String
  network            String
  annualFee          Float
  welcomeBonusValue  Float
  baseRewardRate     Float
  groceryMultiplier  Float
  gasMultiplier      Float
  diningMultiplier   Float
  billsMultiplier    Float
  applyLink          String
  image              String
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}
```

## Usage

### Initial Setup

1. **Update the database schema:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

2. **Run the sync bot:**
   ```bash
   # Option 1: Using the script (requires dev server running)
   npx tsx scripts/sync-cards.ts

   # Option 2: Direct API call
   curl -X POST http://localhost:3000/api/admin/sync-cards
   ```

### Checking Sync Status

Get information about the current sync state without running it:

```bash
curl http://localhost:3000/api/admin/sync-cards
```

Response:
```json
{
  "message": "Card Sync Bot Status",
  "stats": {
    "totalInMasterList": 32,
    "totalInDatabase": 32,
    "needsSync": false
  }
}
```

### Running the Sync

Trigger a full sync operation:

```bash
curl -X POST http://localhost:3000/api/admin/sync-cards
```

Response:
```json
{
  "success": true,
  "message": "Card sync completed successfully",
  "stats": {
    "totalInMasterList": 32,
    "created": 29,
    "updated": 3,
    "errors": 0,
    "totalInDatabase": 32
  },
  "timestamp": "2024-03-08T12:00:00.000Z"
}
```

## Card Data Structure

Each card in the master list follows this structure:

```typescript
{
  name: "American Express Cobalt Card",
  bank: "American Express",
  network: "Amex",
  annualFee: 155.88,
  welcomeBonusValue: 300,
  baseRewardRate: 0.01,
  groceryMultiplier: 0.05,    // 5% back on grocery
  gasMultiplier: 0.02,         // 2% back on gas
  diningMultiplier: 0.05,      // 5% back on dining
  billsMultiplier: 0.01,       // 1% back on bills
  applyLink: "/api/go/amex-cobalt",
  image: "/cards/amex-cobalt.png"
}
```

## Current Card Inventory

The master list includes **32 cards** across:

- **American Express** (4 cards)
  - Cobalt, Platinum, Gold, SimplyCash

- **TD Bank** (4 cards)
  - Aeroplan Infinite, Aeroplan Privilege, Cash Back, First Class

- **RBC** (4 cards)
  - Avion Infinite, Avion Privilege, Cash Back, ION

- **CIBC** (4 cards)
  - Aeroplan Infinite, Aeroplan Basic, Dividend, Aventura

- **Scotiabank** (4 cards)
  - Momentum, Passport, Gold Amex, Scene+

- **BMO** (4 cards)
  - Eclipse, Ascend, CashBack World Elite, AIR MILES

- **National Bank** (2 cards)
  - World Elite, Syncro

- **Tangerine** (2 cards)
  - Money-Back, World

- **Other** (4 cards)
  - Marriott Bonvoy, Costco, Desjardins

## Maintenance

### Adding New Cards

1. Open `app/lib/cardData.ts`
2. Add the new card to the `canadianCardsMasterList` array
3. Run the sync bot to update the database

```typescript
{
  name: "New Card Name",
  bank: "Bank Name",
  network: "Visa",
  annualFee: 0,
  welcomeBonusValue: 100,
  baseRewardRate: 0.01,
  groceryMultiplier: 0.02,
  gasMultiplier: 0.01,
  diningMultiplier: 0.01,
  billsMultiplier: 0.01,
  applyLink: "/api/go/new-card-slug",
  image: "/cards/new-card.png"
}
```

### Updating Existing Cards

1. Find the card in `app/lib/cardData.ts`
2. Update the relevant fields (fees, bonuses, multipliers)
3. Run the sync bot - it will automatically update the existing record

### Removing Cards

1. Remove the card from `app/lib/cardData.ts`
2. Manually delete from database if needed:
   ```typescript
   await prisma.creditCard.delete({
     where: { name: "Card Name" }
   })
   ```

## Automation

### Scheduled Syncs

For production, consider setting up automated syncs:

1. **Cron Job** (recommended for production)
   ```bash
   # Run sync daily at 3 AM
   0 3 * * * curl -X POST https://yourdomain.com/api/admin/sync-cards
   ```

2. **Vercel Cron** (if using Vercel)
   Add to `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/admin/sync-cards",
       "schedule": "0 3 * * *"
     }]
   }
   ```

## Security Considerations

⚠️ **Important**: In production, protect the sync endpoint with authentication:

```typescript
// Add to route.ts
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  
  // Check if user is admin
  if (!userId || !isAdmin(userId)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // ... rest of sync logic
}
```

## Troubleshooting

### Sync fails with "unique constraint" error

This means there's a duplicate card name. Ensure all card names in the master list are unique.

### Cards not appearing in recommendations

1. Check if sync completed successfully
2. Verify cards exist in database:
   ```bash
   npx prisma studio
   ```
3. Check recommendation engine is querying `creditCard` table

### Performance issues

If syncing becomes slow with many cards:
- Consider batch operations
- Add database indexes
- Use transactions for atomic updates

## Future Enhancements

- [ ] Web scraping integration for automatic data updates
- [ ] Admin dashboard UI for manual card management
- [ ] Validation rules for card data
- [ ] Historical tracking of card changes
- [ ] A/B testing for different card recommendations
- [ ] Integration with bank APIs for real-time data

## Support

For issues or questions about the Card Sync Bot, contact the development team or open an issue in the repository.
