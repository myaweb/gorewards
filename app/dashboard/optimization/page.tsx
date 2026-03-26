import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { CardOptimizationDisplay } from '@/components/card-optimization-display'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, ChevronRight, User, Database } from 'lucide-react'
import Link from 'next/link'
import { SendOptimizationReportButton } from '../../../components/send-optimization-report-button'

export default async function OptimizationPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link 
            href="/dashboard" 
            className="hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Optimization</span>
        </div>

        {/* Premium Header */}
        <div className="mb-6">
          <div className="flex items-start gap-4 mb-3">
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

        {/* Context Strip - Data Source & Mode */}
        <div className="grid gap-3 md:grid-cols-2 mb-6">
          {/* Data Source Card */}
          <Card className="glass-premium border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-white">Data Source</span>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                        Manual
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on saved spending profile
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sync Status Card */}
          <Card className="glass-premium border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Database className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-300">Transaction Sync</span>
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs">
                        Coming Soon
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">
                      Automatic optimization in development
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Mode Explanation */}
        <Card className="glass-premium border-primary/20 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white text-sm mb-1">How This Works</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Optimization uses your manually entered spending profile and saved cards. 
                  Each category shows the card with the highest reward rate for that spend type. 
                  When transaction sync launches, optimization will automatically update based on real spending patterns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Optimization Component */}
        <CardOptimizationDisplay />
      </div>
    </div>
  )
}
