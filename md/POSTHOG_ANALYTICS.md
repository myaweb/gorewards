# PostHog Analytics Integration

## Overview
PostHog is integrated to track user behavior, affiliate conversions, and product analytics across the entire application. This enables data-driven decision making and conversion optimization.

## Setup

### 1. Installation
```bash
npm install posthog-js posthog-node
```

### 2. Environment Variables
Add to your `.env.local`:
```env
NEXT_PUBLIC_POSTHOG_KEY="phc_your_project_api_key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

Get your API key from: https://app.posthog.com/project/settings

### 3. Provider Setup
The `PostHogProvider` is already configured in `app/providers.tsx` and wrapped around the entire app in `app/layout.tsx`.

## Tracked Events

### 1. Automatic Pageview Tracking
**Event**: `$pageview`

**Triggered**: On every route change (App Router compatible)

**Properties**:
- `$current_url`: Full URL including query parameters
- Automatic UTM parameter capture
- Referrer tracking

**Implementation**: `app/posthog-pageview.tsx`

### 2. Affiliate Link Clicks
**Event**: `affiliate_link_clicked`

**Triggered**: When user clicks any "Apply Now" button on comparison pages

**Properties**:
```typescript
{
  cardName: string,        // e.g., "American Express Cobalt Card"
  cardId: string,          // Database ID
  targetBank: string,      // e.g., "American Express"
  network: string,         // e.g., "AMEX", "VISA"
  annualFee: number,       // e.g., 156
  pageSlug: string,        // e.g., "amex-cobalt-vs-td-aeroplan"
  position: string,        // "side_by_side", "verdict_primary", "verdict_secondary"
  timestamp: string        // ISO timestamp
}
```

**Use Cases**:
- Track which cards get the most clicks
- Identify high-performing comparison pages
- Calculate click-through rates by position
- Optimize CTA placement

**Implementation**: `components/card-comparison.tsx`

### 3. Checkout Started
**Event**: `checkout_started`

**Triggered**: When user clicks "Unlock Auto-Tracking" premium upgrade button

**Properties**:
```typescript
{
  product: "premium_subscription",
  price: 9,
  currency: "USD",
  billing_cycle: "monthly",
  source: "roadmap_timeline",
  goal_name: string,           // User's selected goal
  total_points_earned: number, // Projected points
  efficiency_score: number,    // Route efficiency
  timestamp: string
}
```

**Use Cases**:
- Track conversion funnel
- Calculate checkout abandonment rate
- Identify which goals drive upgrades
- A/B test pricing

**Implementation**: `components/roadmap-timeline-premium.tsx`

### 4. Checkout Error
**Event**: `checkout_error`

**Triggered**: When checkout process fails

**Properties**:
```typescript
{
  error: string,
  source: string
}
```

**Use Cases**:
- Monitor payment issues
- Identify technical problems
- Improve error handling

## Analytics Dashboards

### Affiliate Performance Dashboard

**Key Metrics**:
1. Total affiliate clicks
2. Click-through rate (CTR) by card
3. CTR by comparison page
4. CTR by button position
5. Most popular card comparisons

**Insights**:
```sql
-- Top performing cards (PostHog SQL)
SELECT 
  properties.cardName,
  properties.targetBank,
  COUNT(*) as clicks,
  COUNT(DISTINCT person_id) as unique_users
FROM events
WHERE event = 'affiliate_link_clicked'
GROUP BY properties.cardName, properties.targetBank
ORDER BY clicks DESC
LIMIT 10
```

### Conversion Funnel

**Steps**:
1. Page View (comparison page)
2. Affiliate Link Click
3. (External) Application Started
4. (External) Application Completed

**Metrics**:
- Pageview → Click conversion rate
- Average clicks per session
- Time to first click
- Bounce rate on comparison pages

### Premium Conversion Dashboard

**Key Metrics**:
1. Checkout started events
2. Checkout completion rate
3. Revenue by source
4. Average time to upgrade
5. Goal preferences of upgraders

**Insights**:
```sql
-- Conversion rate by goal
SELECT 
  properties.goal_name,
  COUNT(*) as checkouts_started,
  SUM(CASE WHEN event = 'checkout_completed' THEN 1 ELSE 0 END) as completed,
  (SUM(CASE WHEN event = 'checkout_completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as conversion_rate
FROM events
WHERE event IN ('checkout_started', 'checkout_completed')
GROUP BY properties.goal_name
ORDER BY conversion_rate DESC
```

## Custom Events to Add

### Recommended Additional Events

#### 1. Spending Form Submitted
```typescript
posthog.capture('spending_form_submitted', {
  grocery: number,
  dining: number,
  gas: number,
  travel: number,
  total_monthly_spend: number,
  selected_goal: string
})
```

#### 2. Roadmap Generated
```typescript
posthog.capture('roadmap_generated', {
  goal_name: string,
  total_points_needed: number,
  efficiency_score: number,
  cards_recommended: number,
  goal_achievable: boolean
})
```

#### 3. Card Details Viewed
```typescript
posthog.capture('card_details_viewed', {
  card_name: string,
  card_bank: string,
  source: 'comparison_page' | 'roadmap' | 'search'
})
```

#### 4. Comparison Page Shared
```typescript
posthog.capture('comparison_shared', {
  page_slug: string,
  share_method: 'copy_link' | 'twitter' | 'facebook'
})
```

#### 5. Filter Applied
```typescript
posthog.capture('filter_applied', {
  filter_type: 'annual_fee' | 'network' | 'bank',
  filter_value: string
})
```

## Feature Flags

PostHog supports feature flags for A/B testing and gradual rollouts.

### Example: Test CTA Copy
```typescript
import { useFeatureFlagEnabled } from 'posthog-js/react'

function AffiliateButton() {
  const newCopy = useFeatureFlagEnabled('new-cta-copy')
  
  return (
    <Button>
      {newCopy 
        ? 'Get Your Bonus Now' 
        : 'Apply Now'}
    </Button>
  )
}
```

### Example: Test Button Position
```typescript
const showTopCTA = useFeatureFlagEnabled('top-cta-placement')

return (
  <>
    {showTopCTA && <AffiliateButton position="top" />}
    <ComparisonContent />
    <AffiliateButton position="bottom" />
  </>
)
```

## Session Recording

PostHog includes session recording to watch user interactions.

### Enable in Production
```typescript
// app/providers.tsx
posthog.init(posthogKey, {
  api_host: posthogHost,
  capture_pageview: false,
  session_recording: {
    recordCrossOriginIframes: true,
    maskAllInputs: true, // Privacy: mask sensitive inputs
    maskTextSelector: '.sensitive', // Mask elements with this class
  }
})
```

### Privacy Considerations
- Mask credit card numbers
- Mask personal information
- Mask email addresses
- Exclude sensitive pages (e.g., payment forms)

## User Identification

### Identify Logged-In Users
```typescript
// After Clerk authentication
import { useUser } from '@clerk/nextjs'
import { usePostHog } from 'posthog-js/react'

function IdentifyUser() {
  const { user } = useUser()
  const posthog = usePostHog()
  
  useEffect(() => {
    if (user) {
      posthog?.identify(user.id, {
        email: user.emailAddresses[0]?.emailAddress,
        name: user.fullName,
        created_at: user.createdAt,
      })
    }
  }, [user, posthog])
}
```

### Track User Properties
```typescript
posthog?.people.set({
  premium_user: true,
  subscription_start: new Date().toISOString(),
  total_comparisons_viewed: 15,
  favorite_card: 'Amex Cobalt'
})
```

## Cohort Analysis

### Create Cohorts in PostHog

**High-Intent Users**:
- Viewed 3+ comparison pages
- Clicked 2+ affiliate links
- Spent 5+ minutes on site

**Premium Prospects**:
- Generated roadmap
- Viewed premium features
- Didn't start checkout

**Converters**:
- Clicked affiliate link
- Completed checkout
- Active premium user

## Revenue Tracking

### Track Affiliate Revenue (Server-Side)
```typescript
// app/api/webhooks/affiliate/route.ts
import { PostHog } from 'posthog-node'

const posthog = new PostHog(
  process.env.POSTHOG_API_KEY!,
  { host: process.env.POSTHOG_HOST }
)

export async function POST(req: Request) {
  const { userId, cardId, commission } = await req.json()
  
  posthog.capture({
    distinctId: userId,
    event: 'affiliate_commission_earned',
    properties: {
      card_id: cardId,
      commission_amount: commission,
      currency: 'USD'
    }
  })
  
  await posthog.shutdown()
}
```

### Track Stripe Revenue
```typescript
// app/api/webhooks/stripe/route.ts
posthog.capture({
  distinctId: userId,
  event: 'subscription_created',
  properties: {
    plan: 'premium',
    amount: 9,
    currency: 'USD',
    billing_cycle: 'monthly'
  }
})
```

## Performance Monitoring

### Track Page Load Times
```typescript
posthog?.capture('page_performance', {
  page: window.location.pathname,
  load_time: performance.timing.loadEventEnd - performance.timing.navigationStart,
  dom_ready: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
})
```

### Track API Response Times
```typescript
const startTime = Date.now()
const response = await fetch('/api/cards')
const duration = Date.now() - startTime

posthog?.capture('api_call', {
  endpoint: '/api/cards',
  duration_ms: duration,
  status: response.status
})
```

## Privacy & GDPR Compliance

### Opt-Out Mechanism
```typescript
// components/cookie-banner.tsx
import { usePostHog } from 'posthog-js/react'

function CookieBanner() {
  const posthog = usePostHog()
  
  const handleOptOut = () => {
    posthog?.opt_out_capturing()
    localStorage.setItem('analytics_consent', 'false')
  }
  
  const handleOptIn = () => {
    posthog?.opt_in_capturing()
    localStorage.setItem('analytics_consent', 'true')
  }
}
```

### Data Retention
Configure in PostHog settings:
- Event data: 7 years (default)
- Session recordings: 30 days
- User profiles: Indefinite

## Testing

### Development Mode
PostHog automatically detects development environment and logs events to console.

### Test Events
```typescript
// Test in browser console
posthog.capture('test_event', { test: true })
```

### Verify Events
1. Open PostHog dashboard
2. Go to "Events" tab
3. Filter by event name
4. Check properties are correct

## Troubleshooting

### Events Not Appearing

**Check**:
1. PostHog key is correct in `.env.local`
2. PostHog is initialized (check console)
3. Ad blockers are disabled
4. Network tab shows requests to PostHog
5. Events appear in PostHog "Live Events" view

### TypeScript Errors

**Solution**:
```bash
npm install --save-dev @types/posthog-js
```

### Server-Side Events

**Use posthog-node**:
```typescript
import { PostHog } from 'posthog-node'

const posthog = new PostHog(
  process.env.POSTHOG_API_KEY!,
  { host: process.env.POSTHOG_HOST }
)

// Always shutdown after use
await posthog.shutdown()
```

## Best Practices

### 1. Event Naming
- Use snake_case: `affiliate_link_clicked`
- Be descriptive: `checkout_started` not `click`
- Use past tense: `form_submitted` not `submit_form`

### 2. Property Naming
- Use snake_case: `card_name`
- Be consistent across events
- Include context: `page_slug` not just `slug`

### 3. Performance
- Don't track on every keystroke
- Debounce frequent events
- Use sampling for high-volume events

### 4. Privacy
- Never track passwords
- Mask sensitive data
- Respect user opt-out
- Follow GDPR guidelines

## ROI Calculation

### Affiliate Revenue Attribution
```
Total Affiliate Clicks: 1,000
Conversion Rate: 2%
Applications: 20
Average Commission: $100
Total Revenue: $2,000

Cost per Click: $0
ROI: Infinite (organic traffic)
```

### Premium Subscription Revenue
```
Checkout Started: 100
Conversion Rate: 30%
Subscriptions: 30
Monthly Revenue: $270
Annual Revenue: $3,240

Customer Acquisition Cost: $0 (organic)
LTV: $108 (12 months average)
```

---

**Status**: ✅ Fully integrated and ready for production
**Next Steps**: 
1. Add PostHog API key to environment variables
2. Deploy to production
3. Monitor events in PostHog dashboard
4. Create custom dashboards for key metrics
5. Set up alerts for anomalies
