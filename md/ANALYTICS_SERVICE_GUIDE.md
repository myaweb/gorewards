# Analytics Service Usage Guide

## Quick Start

### Client-Side Tracking

```typescript
import { usePostHog } from 'posthog-js/react'
import { trackEvent } from '@/lib/services/analytics'

const posthog = usePostHog()

trackEvent(posthog, {
  name: 'recommendation_completed',
  properties: {
    card_name: 'Amex Cobalt',
    card_bank: 'American Express',
    net_value: 850,
    spending_profile: { grocery: 500, gas: 200, dining: 300, bills: 100 }
  }
})
```

### Server-Side Tracking

```typescript
import { trackServerEvent } from '@/lib/services/analytics'

await trackServerEvent({
  name: 'premium_trial_converted',
  properties: {
    stripe_customer_id: 'cus_xxx',
    stripe_subscription_id: 'sub_xxx',
    plan: 'premium',
    amount: 9,
    currency: 'CAD',
    timestamp: new Date().toISOString()
  },
  distinctId: userId
})
```

## All Available Events

See `lib/types/analytics.ts` for complete type definitions.

## Benefits

- Type-safe event tracking
- Silent error handling
- IDE autocomplete
- Compile-time validation
