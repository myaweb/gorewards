/**
 * Server-side Analytics Service
 * 
 * Provides type-safe, error-handled analytics tracking for server components and API routes
 * 
 * Architecture Rules:
 * - All analytics calls must fail silently
 * - Never block application flows
 * - Type-safe event definitions
 */

import type { AnalyticsEvent } from '@/lib/types/analytics'

/**
 * Server-side analytics tracking
 * 
 * Usage:
 * ```typescript
 * import { trackServerEvent } from '@/lib/services/analytics.server'
 * 
 * await trackServerEvent({
 *   name: 'premium_trial_converted',
 *   properties: { ... },
 *   distinctId: userId
 * })
 * ```
 */
export async function trackServerEvent(
  event: AnalyticsEvent & { distinctId: string }
): Promise<void> {
  try {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

    if (!posthogKey) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Analytics] PostHog key not configured for server-side tracking')
      }
      return
    }

    // Use PostHog Node SDK for server-side tracking
    const { PostHog } = await import('posthog-node')
    const client = new PostHog(posthogKey, { host: posthogHost })

    client.capture({
      distinctId: event.distinctId,
      event: event.name,
      properties: event.properties,
    })

    await client.shutdown()

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Server event tracked:', event.name)
    }
  } catch (error) {
    // Silent failure - never break application flow
    if (process.env.NODE_ENV === 'development') {
      console.error('[Analytics] Failed to track server event:', error)
    }
  }
}
