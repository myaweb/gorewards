# Integration Guide - Transaction Intelligence & Beta User Flow

Quick reference for integrating the new Step 7-9 fixes into the BonusGo platform.

---

## 1. Database Migration

### Run Migration

```bash
# Update Prisma schema first (add models below)
npx prisma migrate dev --name add_transaction_intelligence

# Generate Prisma client
npx prisma generate
```

### Add to `prisma/schema.prisma`

```prisma
model Transaction {
  id                   String          @id @default(cuid())
  userId               String
  linkedAccountId      String
  userCardId           String?
  plaidTransactionId   String          @unique
  merchantName         String
  normalizedMerchant   String
  amount               Decimal         @db.Decimal(10, 2)
  date                 DateTime
  category             SpendingCategory
  categoryConfidence   Decimal         @default(0.5) @db.Decimal(3, 2)
  plaidCategories      String[]
  needsReview          Boolean         @default(false)
  correctedByUser      Boolean         @default(false)
  correctedAt          DateTime?
  createdAt            DateTime        @default(now())
  updatedAt            DateTime        @updatedAt

  user                 User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  linkedAccount        LinkedAccount   @relation(fields: [linkedAccountId], references: [id], onDelete: Cascade)
  userCard             UserCard?       @relation(fields: [userCardId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([linkedAccountId])
  @@index([userCardId])
  @@index([date])
  @@index([needsReview])
  @@index([normalizedMerchant])
}

model CardMapping {
  id                String        @id @default(cuid())
  userId            String
  linkedAccountId   String        @unique
  userCardId        String
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  user              User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  linkedAccount     LinkedAccount @relation(fields: [linkedAccountId], references: [id], onDelete: Cascade)
  userCard          UserCard      @relation(fields: [userCardId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userCardId])
}

model BetaFeedback {
  id          String   @id @default(cuid())
  userId      String
  feedback    String
  source      String   @default("unknown")
  userAgent   String?
  ipAddress   String?
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
}
```

### Update Existing Models

Add relations to existing models:

```prisma
model User {
  // ... existing fields
  transactions    Transaction[]
  cardMappings    CardMapping[]
  betaFeedback    BetaFeedback[]
}

model LinkedAccount {
  // ... existing fields
  transactions    Transaction[]
  cardMapping     CardMapping?
}

model UserCard {
  // ... existing fields
  transactions    Transaction[]
  cardMappings    CardMapping[]
}
```

---

## 2. Component Integration

### Dashboard Integration

**File:** `app/dashboard/page.tsx`

```typescript
import { BetaFeedbackWidget } from '@/components/beta-feedback-widget'
import { CardMappingModal } from '@/components/card-mapping-modal'

export default function DashboardPage() {
  const [showCardMapping, setShowCardMapping] = useState(false)
  
  return (
    <div>
      {/* Existing dashboard content */}
      
      {/* Add Beta Feedback Widget */}
      <BetaFeedbackWidget />
      
      {/* Add Card Mapping Button */}
      <Button onClick={() => setShowCardMapping(true)}>
        Map Bank Accounts
      </Button>
      
      <CardMappingModal
        open={showCardMapping}
        onClose={() => setShowCardMapping(false)}
        linkedAccounts={linkedAccounts}
        userCards={userCards}
      />
    </div>
  )
}
```

### Transaction View Integration

**File:** `app/dashboard/transactions/page.tsx` (create if doesn't exist)

```typescript
import { CategoryCorrectionModal } from '@/components/category-correction-modal'

export default function TransactionsPage() {
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showCorrection, setShowCorrection] = useState(false)
  
  return (
    <div>
      {/* Transaction list */}
      {transactions.map(tx => (
        <div key={tx.id}>
          <p>{tx.merchantName}</p>
          <Badge>{tx.category}</Badge>
          {tx.needsReview && (
            <Button 
              size="sm" 
              onClick={() => {
                setSelectedTransaction(tx)
                setShowCorrection(true)
              }}
            >
              Review Category
            </Button>
          )}
        </div>
      ))}
      
      <CategoryCorrectionModal
        open={showCorrection}
        onClose={() => setShowCorrection(false)}
        transaction={selectedTransaction}
        onCorrect={() => {
          // Refresh transactions
          loadTransactions()
        }}
      />
    </div>
  )
}
```

---

## 3. Transaction Processing Flow

### Implement Plaid Transaction Sync

**File:** `app/api/plaid/sync-transactions/route.ts` (create new)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { plaidClient } from '@/lib/plaid'
import { prisma } from '@/lib/prisma'
import { merchantNormalizer } from '@/lib/services/merchantNormalizer'
import { confidenceScorer } from '@/lib/services/confidenceScorer'
import { tokenEncryptor } from '@/lib/services/tokenEncryptor'
import { TokenType } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
      include: { linkedAccounts: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let totalSynced = 0

    // Sync transactions for each linked account
    for (const account of dbUser.linkedAccounts) {
      // Decrypt access token
      const accessToken = await tokenEncryptor.decryptToken(
        dbUser.id,
        TokenType.PLAID_ACCESS_TOKEN
      )

      // Fetch transactions from Plaid
      const response = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: '2024-01-01', // Adjust as needed
        end_date: new Date().toISOString().split('T')[0]
      })

      // Process each transaction
      for (const plaidTx of response.data.transactions) {
        // Check if already exists
        const existing = await prisma.transaction.findUnique({
          where: { plaidTransactionId: plaidTx.transaction_id }
        })

        if (existing) continue

        // Normalize transaction
        const normalized = merchantNormalizer.normalizeTransaction({
          transaction_id: plaidTx.transaction_id,
          name: plaidTx.name,
          merchant_name: plaidTx.merchant_name,
          amount: plaidTx.amount,
          category: plaidTx.category,
          date: plaidTx.date
        })

        // Calculate confidence
        const confidence = await confidenceScorer.calculateConfidence(
          normalized.merchantName,
          normalized.amount,
          normalized.suggestedCategory || 'OTHER',
          dbUser.id
        )

        // Store in database
        await prisma.transaction.create({
          data: {
            userId: dbUser.id,
            linkedAccountId: account.id,
            plaidTransactionId: normalized.transactionId,
            merchantName: normalized.merchantName,
            normalizedMerchant: normalized.normalizedMerchant,
            amount: normalized.amount,
            date: new Date(normalized.date),
            category: normalized.suggestedCategory || 'OTHER',
            categoryConfidence: confidence.confidence,
            plaidCategories: normalized.plaidCategories,
            needsReview: confidence.needsReview
          }
        })

        totalSynced++
      }
    }

    return NextResponse.json({ 
      success: true, 
      synced: totalSynced 
    })

  } catch (error) {
    console.error('Transaction sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync transactions' },
      { status: 500 }
    )
  }
}
```

---

## 4. Testing Checklist

### Unit Tests

- [ ] MerchantNormalizer.normalizeMerchantName()
- [ ] MerchantNormalizer.lookupMerchantCategory()
- [ ] MerchantNormalizer.normalizeTransaction()
- [ ] ConfidenceScorer.calculateConfidence()

### Integration Tests

- [ ] POST /api/profile/card-mappings
- [ ] GET /api/profile/card-mappings
- [ ] POST /api/transactions/correct-category
- [ ] POST /api/feedback
- [ ] POST /api/plaid/sync-transactions

### E2E Tests

- [ ] User connects Plaid account
- [ ] User maps account to card
- [ ] Transactions sync automatically
- [ ] User corrects transaction category
- [ ] User submits beta feedback
- [ ] Analytics events fire correctly

### Analytics Verification

```typescript
// In browser console after each action:
posthog.debug() // Enable debug mode

// Then perform actions and verify events:
// - recommendation_completed
// - plaid_connected
// - card_mapping_completed
// - category_corrected
// - beta_feedback_submitted
```

---

## 5. Environment Variables

No new environment variables required. Existing variables should work:

```env
# Plaid (already configured)
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=sandbox # or production

# PostHog (already configured)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Database (already configured)
DATABASE_URL=

# Encryption (already configured)
ENCRYPTION_KEY=
```

---

## 6. Deployment Checklist

### Pre-Deployment

- [ ] Run database migration in staging
- [ ] Verify all new tables created
- [ ] Test API endpoints in staging
- [ ] Verify analytics events in PostHog
- [ ] Check component rendering
- [ ] Test mobile responsiveness

### Deployment

- [ ] Deploy database migration
- [ ] Deploy API changes
- [ ] Deploy UI components
- [ ] Verify production analytics
- [ ] Monitor error logs

### Post-Deployment

- [ ] Verify Plaid connections still work
- [ ] Test card mapping flow
- [ ] Test category correction
- [ ] Check beta feedback submission
- [ ] Monitor performance metrics

---

## 7. Monitoring

### Key Metrics to Track

1. **Transaction Processing**
   - Transactions synced per day
   - Average confidence score
   - Percentage needing review
   - User correction rate

2. **User Engagement**
   - Card mappings created
   - Category corrections submitted
   - Beta feedback submissions
   - Time to first mapping

3. **System Health**
   - API response times
   - Database query performance
   - Error rates
   - Plaid API success rate

### Alerts to Set Up

```typescript
// Low confidence rate alert
if (lowConfidenceRate > 0.3) {
  alert('High percentage of low-confidence transactions')
}

// Plaid sync failures
if (plaidSyncFailureRate > 0.1) {
  alert('Plaid transaction sync failing')
}

// User feedback spike
if (feedbackSubmissions > averageDaily * 3) {
  alert('Unusual spike in user feedback - check for issues')
}
```

---

## 8. Rollback Plan

If issues arise, rollback in reverse order:

### Step 1: Disable UI Components
```typescript
// Feature flag in config
const ENABLE_CARD_MAPPING = false
const ENABLE_CATEGORY_CORRECTION = false
const ENABLE_BETA_FEEDBACK = false
```

### Step 2: Disable API Endpoints
```typescript
// Add to route handlers
if (!process.env.ENABLE_TRANSACTION_INTELLIGENCE) {
  return NextResponse.json({ error: 'Feature disabled' }, { status: 503 })
}
```

### Step 3: Rollback Database
```sql
-- Drop new tables (in reverse order of creation)
DROP TABLE IF EXISTS "BetaFeedback";
DROP TABLE IF EXISTS "CardMapping";
DROP TABLE IF EXISTS "Transaction";
```

---

## 9. Support Documentation

### For Users

**Card Mapping:**
> "Map your bank accounts to credit cards so we can track which card you used for each transaction and optimize your rewards."

**Category Correction:**
> "If we got a transaction category wrong, you can correct it. This helps our AI learn and improve accuracy for future transactions."

**Beta Feedback:**
> "We're in beta! Your feedback helps us build a better product. Share what's working and what needs improvement."

### For Support Team

**Common Issues:**

1. **"My transactions aren't syncing"**
   - Check Plaid connection status
   - Verify access token is valid
   - Check transaction sync logs

2. **"Categories are wrong"**
   - Guide user to category correction modal
   - Explain confidence scoring
   - Note that corrections improve accuracy

3. **"I can't map my account"**
   - Verify user has cards in portfolio
   - Check linked accounts exist
   - Verify API endpoint is accessible

---

## 10. Quick Reference

### Import Paths

```typescript
// Services
import { merchantNormalizer } from '@/lib/services/merchantNormalizer'
import { confidenceScorer } from '@/lib/services/confidenceScorer'

// Data
import { MERCHANT_PATTERNS, CATEGORY_KEYWORDS } from '@/lib/data/merchantCategories'

// Components
import { CardMappingModal } from '@/components/card-mapping-modal'
import { CategoryCorrectionModal } from '@/components/category-correction-modal'
import { BetaFeedbackWidget } from '@/components/beta-feedback-widget'
```

### API Endpoints

```
POST   /api/profile/card-mappings          # Save card mappings
GET    /api/profile/card-mappings          # Get card mappings
POST   /api/transactions/correct-category  # Correct transaction category
POST   /api/feedback                       # Submit beta feedback
POST   /api/plaid/sync-transactions        # Sync Plaid transactions
```

### Analytics Events

```typescript
posthog.capture('recommendation_completed', { ... })
posthog.capture('plaid_connected', { ... })
posthog.capture('card_mapping_completed', { ... })
posthog.capture('category_corrected', { ... })
posthog.capture('beta_feedback_submitted', { ... })
```

---

## Need Help?

- Architecture questions: See `ARCHITECTURE_FIX_REPORT.md`
- Database schema: See `prisma/schema.prisma`
- Migration SQL: See `prisma/migrations/add_transaction_intelligence_tables.sql`
