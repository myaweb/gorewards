# The Money Router - Usage Examples

## Example 1: Basic Card Application Flow

### Scenario
User wants to apply for the American Express Cobalt Card

### Frontend Code (card-comparison.tsx)
```tsx
// Helper function to create slug
const createSlug = (cardName: string): string => {
  return cardName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Generate affiliate URL
const card1AffiliateUrl = card1.affiliateLink 
  ? `/api/go/${createSlug(card1.name)}` 
  : `/compare`

// Render button
<a
  href={card1AffiliateUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="affiliate-link"
>
  Apply Now
</a>
```

### Generated URL
```
Card Name: "American Express Cobalt Card"
Generated Slug: "american-express-cobalt-card"
Final URL: /api/go/american-express-cobalt-card
```

### What Happens
1. User clicks button
2. Browser navigates to `/api/go/american-express-cobalt-card`
3. API route looks up card in database
4. Click count increments from 42 to 43
5. User redirects to `https://americanexpress.com/apply/cobalt`

## Example 2: Testing the Router Directly

### Using cURL
```bash
# Test redirect
curl -I http://localhost:3000/api/go/amex-cobalt-card

# Expected response:
# HTTP/1.1 307 Temporary Redirect
# Location: https://americanexpress.com/apply/cobalt
```

### Using Browser
```
1. Open: http://localhost:3000/api/go/amex-cobalt-card
2. Should redirect to the affiliate URL
3. Check database: clickCount should increment
```

### Using Postman
```
GET http://localhost:3000/api/go/td-aeroplan-visa-infinite
Follow Redirects: ON
Expected: Lands on TD Bank application page
```

## Example 3: Admin Dashboard View

### Before Click
```
┌──────────────────────────────────┬────────┬────────┐
│ Card Name                        │ Bank   │ Clicks │
├──────────────────────────────────┼────────┼────────┤
│ American Express Cobalt Card     │ Amex   │ 42     │
│ TD Aeroplan Visa Infinite        │ TD     │ 18     │
│ CIBC Aeroplan Visa Infinite      │ CIBC   │ 7      │
└──────────────────────────────────┴────────┴────────┘
```

### After User Clicks Amex Cobalt
```
┌──────────────────────────────────┬────────┬────────┐
│ Card Name                        │ Bank   │ Clicks │
├──────────────────────────────────┼────────┼────────┤
│ American Express Cobalt Card     │ Amex   │ 43     │ ← Incremented
│ TD Aeroplan Visa Infinite        │ TD     │ 18     │
│ CIBC Aeroplan Visa Infinite      │ CIBC   │ 7      │
└──────────────────────────────────┴────────┴────────┘
```

## Example 4: Database Query

### Check Click Count
```sql
-- View all cards with click counts
SELECT 
  name, 
  bank, 
  "clickCount", 
  "affiliateLink"
FROM "Card"
ORDER BY "clickCount" DESC;

-- Result:
┌──────────────────────────────────┬────────┬────────────┬─────────────────────────────┐
│ name                             │ bank   │ clickCount │ affiliateLink               │
├──────────────────────────────────┼────────┼────────────┼─────────────────────────────┤
│ American Express Cobalt Card     │ Amex   │ 43         │ https://amex.com/apply/...  │
│ TD Aeroplan Visa Infinite        │ TD     │ 18         │ https://td.com/apply/...    │
│ CIBC Aeroplan Visa Infinite      │ CIBC   │ 7          │ https://cibc.com/apply/...  │
└──────────────────────────────────┴────────┴────────────┴─────────────────────────────┘
```

### Manual Click Count Update (for testing)
```sql
-- Reset all click counts
UPDATE "Card" SET "clickCount" = 0;

-- Set specific card click count
UPDATE "Card" 
SET "clickCount" = 100 
WHERE name LIKE '%Cobalt%';
```

## Example 5: Error Handling

### Scenario 1: Card Not Found
```
URL: /api/go/non-existent-card
Result: Redirects to /compare (fallback)
Console: "Card not found or no affiliate link for slug: non-existent-card"
```

### Scenario 2: No Affiliate Link
```
Card in DB: "Test Card" (affiliateLink = null)
URL: /api/go/test-card
Result: Redirects to /compare (fallback)
Console: "Card not found or no affiliate link for slug: test-card"
```

### Scenario 3: Database Error
```
Database: Connection lost
URL: /api/go/amex-cobalt-card
Result: Redirects to /compare (fallback)
Console: "Error in affiliate router: [error details]"
```

## Example 6: Integration with PostHog

### Dual Tracking
```tsx
// Both systems track the click
const handleAffiliateClick = (card: PrismaCard, position: string) => {
  // PostHog event (client-side analytics)
  posthog?.capture('affiliate_link_clicked', {
    cardName: card.name,
    cardId: card.id,
    position: position,
    timestamp: new Date().toISOString(),
  })
  
  // Money Router handles server-side tracking automatically
  // when user navigates to /api/go/[slug]
}
```

### Result
- PostHog: Rich event data with user context
- Money Router: Simple click counter in database
- Both: Available in admin dashboard

## Example 7: A/B Testing Setup (Future)

### Current Implementation
```tsx
// Single affiliate URL per card
const affiliateUrl = `/api/go/${createSlug(card.name)}`
```

### Future Enhancement
```tsx
// Multiple affiliate URLs with A/B testing
const affiliateUrl = `/api/go/${createSlug(card.name)}?variant=${abTestVariant}`

// API route handles variant tracking
// Increments: card.clickCountVariantA or card.clickCountVariantB
```

## Example 8: Conversion Tracking (Future)

### Current: Click Tracking Only
```
User clicks → Router increments clickCount → Redirect
```

### Future: Full Funnel Tracking
```
User clicks → Router increments clickCount → Redirect
              ↓
User applies → Webhook from bank → Increment conversionCount
              ↓
User approved → Webhook from bank → Increment approvalCount
```

## Testing Checklist with Examples

### ✅ Test 1: Basic Redirect
```bash
# Visit this URL
http://localhost:3000/api/go/amex-cobalt-card

# Expected: Redirects to Amex affiliate URL
# Check: Database clickCount incremented
```

### ✅ Test 2: Invalid Slug
```bash
# Visit this URL
http://localhost:3000/api/go/invalid-card-name

# Expected: Redirects to /compare
# Check: No database changes
```

### ✅ Test 3: Admin Dashboard
```bash
# 1. Note current click count for a card
# 2. Click "Apply Now" on comparison page
# 3. Refresh admin dashboard
# Expected: Click count increased by 1
```

### ✅ Test 4: Multiple Clicks
```bash
# Click same card 5 times
# Expected: Click count increases by 5
```

### ✅ Test 5: Different Cards
```bash
# Click Card A: clickCount A = 1
# Click Card B: clickCount B = 1
# Click Card A: clickCount A = 2
# Expected: Each card tracks independently
```

## Performance Considerations

### Current Implementation
```typescript
// Fire-and-forget analytics update
prisma.card.update({
  where: { id: card.id },
  data: { clickCount: { increment: 1 } }
}).catch(error => {
  console.error('Error incrementing click count:', error)
  // Don't fail the redirect if analytics update fails
})

// Immediate redirect (doesn't wait for DB update)
return NextResponse.redirect(card.affiliateLink)
```

### Why This Matters
- User redirect is NOT blocked by database update
- If DB update fails, user still gets redirected
- Analytics are important but not critical path
- Average redirect time: <50ms

## Monitoring & Alerts

### Key Metrics to Track
```
1. Total clicks per day
2. Click-through rate by card
3. Failed redirects (404s)
4. Database update failures
5. Average redirect latency
```

### Example Monitoring Query
```sql
-- Daily click summary
SELECT 
  DATE("updatedAt") as date,
  SUM("clickCount") as total_clicks,
  COUNT(*) as cards_clicked
FROM "Card"
WHERE "updatedAt" >= NOW() - INTERVAL '7 days'
GROUP BY DATE("updatedAt")
ORDER BY date DESC;
```

## Common Issues & Solutions

### Issue 1: Clicks Not Incrementing
```
Problem: Click count stays at 0
Solution: Check if affiliateLink is set in database
Query: SELECT name, affiliateLink FROM "Card" WHERE "affiliateLink" IS NULL;
```

### Issue 2: Wrong Redirect URL
```
Problem: Redirects to wrong page
Solution: Check slug generation matches card name
Debug: console.log(createSlug(card.name))
```

### Issue 3: 404 on Router
```
Problem: /api/go/[slug] returns 404
Solution: Ensure file is at app/api/go/[slug]/route.ts (not route.tsx)
```
