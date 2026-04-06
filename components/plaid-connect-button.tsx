"use client"

import { useState, useCallback, useEffect } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { Button } from '@/components/ui/button'
import { Building2, Loader2 } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { trackEvent } from '@/lib/services/analytics.client'

interface PlaidConnectButtonProps {
  onSuccess?: () => void
  hasExistingAccounts?: boolean
  compact?: boolean
}

export function PlaidConnectButton({ onSuccess, hasExistingAccounts = false, compact = false }: PlaidConnectButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const posthog = usePostHog()

  useEffect(() => {
    const createLinkToken = async () => {
      try {
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
        })
        const data = await response.json()
        setLinkToken(data.link_token)
      } catch (error) {
        console.error('Error creating link token:', error)
      }
    }

    createLinkToken()
  }, [])

  const onPlaidSuccess = useCallback(
    async (public_token: string, metadata: any) => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/plaid/exchange-public-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ public_token, metadata }),
        })

        if (response.ok) {
          const data = await response.json()
          
          // Track plaid_connected event
          trackEvent(posthog, {
            name: 'plaid_connected',
            properties: {
              institution_name: data.institution?.name || 'Unknown',
              institution_id: data.institution?.id || 'unknown',
              accounts_count: data.institution?.accounts_count || 0,
              timestamp: new Date().toISOString()
            }
          })

          onSuccess?.()
        } else {
          console.error('Failed to exchange token')
        }
      } catch (error) {
        console.error('Error exchanging token:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [onSuccess, posthog]
  )

  const config = {
    token: linkToken,
    onSuccess: onPlaidSuccess,
  }

  const { open, ready } = usePlaidLink(config)

  return (
    <Button
      onClick={() => open()}
      disabled={!ready || isLoading}
      size={compact ? "sm" : "lg"}
      variant="outline"
      className={
        compact
          ? "h-7 px-2 text-xs border-primary/30 text-primary hover:bg-primary/10"
          : hasExistingAccounts
          ? "h-14 px-8 text-lg font-semibold border-2 border-dashed border-primary/50 bg-transparent text-cyan-400 hover:text-cyan-400 hover:bg-primary/10 hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          : "h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-background shadow-xl shadow-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      }
    >
      {isLoading ? (
        <Loader2 className={compact ? "h-3 w-3 animate-spin" : "mr-2 h-5 w-5 animate-spin"} />
      ) : (
        <>
          <Building2 className={compact ? "h-3 w-3 mr-1" : "mr-2 h-5 w-5"} />
          {compact ? (hasExistingAccounts ? "+ Add" : "Connect") : hasExistingAccounts ? "Add Another Bank" : "Connect Your Bank"}
        </>
      )}
    </Button>
  )
}

