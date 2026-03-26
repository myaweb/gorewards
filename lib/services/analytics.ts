/**
 * Centralized Analytics Service
 * 
 * This file re-exports from client and server analytics modules
 * for backward compatibility.
 * 
 * IMPORTANT: 
 * - Client components should import from '@/lib/services/analytics.client'
 * - Server components/API routes should import from '@/lib/services/analytics.server'
 */

// Re-export client-side functions
export {
  trackEvent,
  trackBatchEvents,
  identifyUser,
  resetAnalytics,
  trackPageView,
  checkFeatureFlag,
} from './analytics.client'

// Re-export server-side functions
export {
  trackServerEvent,
} from './analytics.server'

