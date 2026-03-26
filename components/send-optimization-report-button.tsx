'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, Loader2, Check, X, AlertCircle } from 'lucide-react'

export function SendOptimizationReportButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSend = async () => {
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/email/optimization-report', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'profile_incomplete') {
          setMessage('Complete your spending profile first.')
        } else if (data.error === 'no_cards') {
          setMessage('Add cards to your portfolio first.')
        } else {
          setMessage(data.message || data.error || 'Failed to send. Try again.')
        }
        setStatus('error')
        setTimeout(() => setStatus('idle'), 5000)
        return
      }

      setStatus('success')
      setMessage('Report sent to your email!')
      setTimeout(() => setStatus('idle'), 5000)
    } catch {
      setStatus('error')
      setMessage('Failed to send. Try again.')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="border-primary/30 hover:border-primary hover:bg-white hover:text-[#090A0F] text-primary h-9 transition-all flex-shrink-0"
        onClick={handleSend}
        disabled={status === 'loading' || status === 'success'}
      >
        {status === 'loading' ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
        ) : status === 'success' ? (
          <><Check className="h-4 w-4 mr-2" />Sent!</>
        ) : (
          <><Mail className="h-4 w-4 mr-2" />Email Report</>
        )}
      </Button>

      {/* Success overlay */}
      {status === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto mx-4 max-w-sm w-full bg-[#0F1117] border border-primary/40 rounded-2xl p-8 shadow-[0_0_60px_rgba(6,182,212,0.3)] animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                <div className="relative w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Check className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-white font-semibold text-lg mb-1">Report Sent</p>
                <p className="text-muted-foreground text-sm">{message}</p>
              </div>
              <div className="w-full h-0.5 bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-[shrink_5s_linear_forwards]" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {status === 'error' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto mx-4 max-w-sm w-full bg-[#0F1117] border border-red-500/40 rounded-2xl p-8 shadow-[0_0_60px_rgba(239,68,68,0.2)] animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
                <div className="relative w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
              </div>
              <div>
                <p className="text-white font-semibold text-lg mb-1">Could Not Send</p>
                <p className="text-muted-foreground text-sm">{message}</p>
              </div>
              <button
                onClick={() => setStatus('idle')}
                className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
