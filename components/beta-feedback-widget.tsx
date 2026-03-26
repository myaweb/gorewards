/**
 * Beta Feedback Widget
 * 
 * STEP 8 FIX: Beta User Flow - Feedback System
 * 
 * Allows beta users to submit feedback directly from the dashboard.
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, Check, AlertCircle } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'

interface BetaFeedbackWidgetProps {
  compact?: boolean
}

export function BetaFeedbackWidget({ compact = false }: BetaFeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const posthog = usePostHog()

  const handleSubmit = async () => {
    if (!feedback.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedback.trim(),
          source: 'beta_widget',
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      // Track analytics event
      posthog?.capture('beta_feedback_submitted', {
        feedback_length: feedback.length,
        source: 'dashboard_widget'
      })

      setSubmitted(true)
      setFeedback('')
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSubmitted(false)
        setIsOpen(false)
      }, 3000)

    } catch (err) {
      setError('Failed to submit feedback. Please try again.')
      console.error('Feedback error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (compact) {
    return (
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="border-primary/30"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Send Feedback
      </Button>
    )
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Beta Feedback
            </CardTitle>
            <CardDescription>
              Help us improve CreditRich with your feedback
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            Beta
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isOpen ? (
          <Button
            onClick={() => setIsOpen(true)}
            variant="outline"
            className="w-full border-primary/30"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Share Your Thoughts
          </Button>
        ) : submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">Thank you!</p>
              <p className="text-sm text-muted-foreground">
                Your feedback helps us build a better product
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              placeholder="What's working well? What could be better? Any bugs or issues?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="resize-none"
            />

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false)
                  setFeedback('')
                  setError(null)
                }}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-primary to-cyan-400"
                disabled={isSubmitting || !feedback.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Feedback
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
