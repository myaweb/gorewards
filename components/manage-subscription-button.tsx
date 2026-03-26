'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session')
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Failed to open billing portal')
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleManageSubscription}
      disabled={isLoading}
      variant="outline"
      className="w-full border-white/10 hover:bg-white/5 hover:border-white/20 transition-all"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Opening billing portal...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Manage billing
          <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-60" />
        </>
      )}
    </Button>
  )
}
