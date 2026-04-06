import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { CardOptimizationDisplay } from '@/components/card-optimization-display'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { SendOptimizationReportButton } from '../../../components/send-optimization-report-button'

export default async function OptimizationPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen pt-2 pb-12">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link 
            href="/users" 
            className="hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Optimization</span>
        </div>

        {/* Premium Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-3">
            <div className="relative w-12 h-12 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-cyan-400/20 rounded-xl blur-lg" />
              <div className="relative z-10 w-full h-full rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">Card Optimization</h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Discover which card maximizes rewards for each spending category. 
                Our engine analyzes your profile and card portfolio to recommend the optimal card for every purchase.
              </p>
            </div>
            <SendOptimizationReportButton />
          </div>
        </div>

        {/* Main Optimization Component */}
        <CardOptimizationDisplay />
      </div>
    </div>
  )
}

