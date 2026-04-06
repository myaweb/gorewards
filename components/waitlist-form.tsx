"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Check, Loader2, Sparkles } from "lucide-react"

interface WaitlistFormProps {
  compact?: boolean
  source?: string
}

export function WaitlistForm({ compact = false, source = "homepage" }: WaitlistFormProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError("Email is required")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim() || null,
          source
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist')
      }

      setSubmitted(true)
      setEmail('')
      setName('')

    } catch (err: any) {
      setError(err.message || 'Failed to join waitlist. Please try again.')
      console.error('Waitlist error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className="glass-premium border-primary/30 glow-teal">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">You're on the list!</h3>
            <p className="text-muted-foreground mb-4">
              Check your inbox for a confirmation email.
            </p>
            <div className="text-sm text-muted-foreground/80 space-y-2 max-w-md mx-auto">
              <p className="font-medium text-foreground/90">What happens next:</p>
              <p>We'll notify you as soon as spots open up. No spam, just launch updates.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 h-12 bg-white/5 border-white/10 focus:border-primary"
          disabled={isSubmitting}
        />
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-12 px-8 bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all font-semibold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Joining...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Join Waitlist
            </>
          )}
        </Button>
        {error && (
          <p className="text-sm text-red-400 mt-2">{error}</p>
        )}
      </form>
    )
  }

  return (
    <Card className="glass-premium border-primary/30 glow-teal">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">Join the Waitlist</CardTitle>
            <CardDescription className="text-base">
              Be the first to know when we open up new spots
            </CardDescription>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email address *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-white/5 border-white/10 focus:border-primary"
              disabled={isSubmitting}
              required
            />
          </div>
          <div>
            <Input
              type="text"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 bg-white/5 border-white/10 focus:border-primary"
              disabled={isSubmitting}
            />
          </div>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-background shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Joining Waitlist...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-5 w-5" />
                Join the Waitlist
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            No spam, launch updates only • We'll never share your email
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

