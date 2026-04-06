'use client'

import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RedirectCountdownProps {
  url: string
  seconds: number
}

export function RedirectCountdown({ url, seconds }: RedirectCountdownProps) {
  const [count, setCount] = useState(seconds)

  useEffect(() => {
    if (count <= 0) {
      window.location.href = url
      return
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, url])

  // Circle progress
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const progress = ((seconds - count) / seconds) * circumference

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Countdown ring */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" width="80" height="80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          <circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke="url(#grad)"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>
        <span className="text-2xl font-bold text-primary">{count}</span>
      </div>

      <p className="text-muted-foreground text-sm">
        {count > 0 ? `Redirecting in ${count} second${count !== 1 ? 's' : ''}...` : 'Redirecting now...'}
      </p>

      {/* Manual button */}
      <Button
        onClick={() => { window.location.href = url }}
        className="bg-gradient-to-r from-primary to-cyan-400 text-[#090A0F] font-semibold"
      >
        Continue Now
        <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}

