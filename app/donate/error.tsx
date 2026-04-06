'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function BillingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Billing page error:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen pt-2 pb-12">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="glass-premium border-red-500/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <CardTitle className="text-2xl">Page Error</CardTitle>
                <CardDescription>
                  Unable to load this page
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400 mb-2">
                We encountered an error while loading this page.
              </p>
              <p className="text-xs text-muted-foreground">
                This could be due to a temporary connection issue. Please try again.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={reset}
                className="flex-1 bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-white/10"
                asChild
              >
                <Link href="/users">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-muted-foreground">
                <strong>Need help?</strong> If this error persists, please try again later. 
                Error ID: {error.digest || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

