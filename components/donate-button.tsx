'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, Loader2 } from 'lucide-react'

interface DonateButtonProps {
  amount: number
  variant?: 'default' | 'outline' | 'primary'
  className?: string
  children?: React.ReactNode
}

export function DonateButton({ amount, variant = 'default', className, children }: DonateButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDonate = async () => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Donate error:', error)
      alert(error instanceof Error ? error.message : 'Failed to start donation. Please try again.')
      setIsLoading(false)
    }
  }

  const buttonClass = variant === 'primary'
    ? 'w-full bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-[#090A0F]'
    : variant === 'outline'
    ? 'w-full bg-primary/20 hover:bg-primary/30 text-primary border-0'
    : 'w-full bg-primary/20 hover:bg-primary/30 text-primary border-0'

  return (
    <Button
      onClick={handleDonate}
      disabled={isLoading}
      className={`${buttonClass} ${className || ''}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        children || <>
          <Heart className="mr-2 h-4 w-4" />
          Donate ${amount}
        </>
      )}
    </Button>
  )
}
