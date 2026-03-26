'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PostHog only on client side
    if (typeof window !== 'undefined') {
      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
      const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

      // Only initialize if we have a real key (not placeholder)
      if (posthogKey && posthogKey !== 'phc_placeholder' && !posthogKey.includes('placeholder')) {
        posthog.init(posthogKey, {
          api_host: posthogHost,
          // Enable session recording
          capture_pageview: false, // We'll handle this manually for better control
          capture_pageleave: true,
          // Autocapture interactions
          autocapture: true,
          // Enable feature flags
          loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('PostHog initialized')
            }
          },
        })
      } else if (process.env.NODE_ENV === 'development') {
        console.log('PostHog disabled - no valid key configured')
      }
    }
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
