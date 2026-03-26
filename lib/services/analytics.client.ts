/**
 * Client-side Analytics Service
 * 
 * Provides type-safe, error-handled analytics tracking for client components
 * 
 * Architecture Rules:
 * - All analytics calls must fail silently
 * - Never block application flows
 * - Type-safe event definitions
 */

import type { AnalyticsEvent } from '@/lib/types/analytics'

/**
 * Client-side analytics tracking (PostHog)
 * 
 * Usage:
 * ```typescript
 * import { trackEvent } from '@/lib/services/analytics.client'
 * import { usePostHog } from 'posthog-js/react'
 * 
 * const posthog = usePostHog()
 * trackEvent(posthog, {
 *   name: 'recommendation_completed',
 *   properties: { card_name: 'Amex Cobalt', ... }
 * })
 * ```
 */
export function trackEvent(
  posthog: any,
  event: AnalyticsEvent
): void {
  try {
    if (!posthog) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Analytics] PostHog not initialized')
      }
      return
    }

    posthog.capture(event.name, event.properties)

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Event tracked:', event.name, event.properties)
    }
  } catch (error) {
    // Silent failure - never break application flow
    if (process.env.NODE_ENV === 'development') {
      console.error('[Analytics] Failed to track event:', error)
    }
  }
}

/**
 * Batch event tracking for multiple events
 * 
 * Usage:
 * ```typescript
 * trackBatchEvents(posthog, [
 *   { name: 'event1', properties: {...} },
 *   { name: 'event2', properties: {...} }
 * ])
 * ```
 */
export function trackBatchEvents(
  posthog: any,
  events: AnalyticsEvent[]
): void {
  events.forEach(event => trackEvent(posthog, event))
}

/**
 * Identify user for analytics
 * 
 * Usage:
 * ```typescript
 * identifyUser(posthog, userId, {
 *   email: 'user@example.com',
 *   isPremium: true
 * })
 * ```
 */
export function identifyUser(
  posthog: any,
  userId: string,
  properties?: Record<string, any>
): void {
  try {
    if (!posthog) return

    posthog.identify(userId, properties)

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] User identified:', userId)
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Analytics] Failed to identify user:', error)
    }
  }
}

/**
 * Reset analytics identity (on logout)
 * 
 * Usage:
 * ```typescript
 * resetAnalytics(posthog)
 * ```
 */
export function resetAnalytics(posthog: any): void {
  try {
    if (!posthog) return

    posthog.reset()

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Analytics reset')
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Analytics] Failed to reset analytics:', error)
    }
  }
}

/**
 * Track page view manually
 * 
 * Usage:
 * ```typescript
 * trackPageView(posthog, '/dashboard')
 * ```
 */
export function trackPageView(
  posthog: any,
  path: string,
  properties?: Record<string, any>
): void {
  try {
    if (!posthog) return

    posthog.capture('$pageview', {
      $current_url: path,
      ...properties,
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Page view tracked:', path)
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Analytics] Failed to track page view:', error)
    }
  }
}

/**
 * Feature flag check
 * 
 * Usage:
 * ```typescript
 * const isEnabled = checkFeatureFlag(posthog, 'new-feature')
 * ```
 */
export function checkFeatureFlag(
  posthog: any,
  flagKey: string
): boolean {
  try {
    if (!posthog) return false

    return posthog.isFeatureEnabled(flagKey) || false
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Analytics] Failed to check feature flag:', error)
    }
    return false
  }
}
