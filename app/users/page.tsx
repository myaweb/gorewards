import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlaidSection } from '@/components/plaid-section'
import { BetaFeedbackWidget } from '@/components/beta-feedback-widget'
import { Sparkles, Building2, CheckCircle2, Target, TrendingUp, CreditCard, ArrowRight, ChevronRight } from 'lucide-react'
import { StrategyKanban } from '@/components/strategy-kanban'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: user.id },
    include: {
      linkedAccounts: true,
      savedStrategies: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!dbUser) {
    const newUser = await prisma.user.create({
      data: {
        clerkUserId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
      },
      include: {
        linkedAccounts: true,
        savedStrategies: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    
    const totalStrategies = 0
    const completedStrategies = 0
    const activeStrategies = 0

    return renderDashboard(newUser, totalStrategies, completedStrategies, activeStrategies)
  }

  const totalStrategies = dbUser.savedStrategies.length
  const completedStrategies = dbUser.savedStrategies.filter((s: any) => s.isCompleted).length
  const activeStrategies = totalStrategies - completedStrategies

  return renderDashboard(dbUser, totalStrategies, completedStrategies, activeStrategies)
}

function renderDashboard(
  dbUser: any,
  totalStrategies: number,
  completedStrategies: number,
  activeStrategies: number
) {
  const isNewUser = totalStrategies === 0

  return (
    <div className="min-h-screen pt-2 pb-12">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header - Simplified */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {isNewUser 
                ? 'Let\'s optimize your credit card rewards' 
                : 'Track your optimization strategies'}
            </p>
          </div>
          <Button variant="outline" size="sm" className="border-primary/30" asChild>
            <Link href="/donate">
              <CreditCard className="mr-2 h-4 w-4" />
              Support Us
            </Link>
          </Button>
        </div>

        {/* New User Experience: Guided Onboarding */}
        {isNewUser && (
          <>
            {/* Primary CTA - Hero Section */}
            <Card className="glass-premium border-primary/30 mb-6 overflow-hidden">
              <CardContent className="py-10 px-6">
                <div className="max-w-3xl mx-auto">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-cyan-400/20 rounded-full blur-xl" />
                      <div className="relative z-10 w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-primary" />
                      </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Calculate Your First Strategy
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        Enter your spending profile and discover which cards maximize your rewards. Takes 2 minutes.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          size="lg"
                          className="bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-[#090A0F] shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all"
                          asChild
                        >
                          <Link href="/product#calculator">
                            <Sparkles className="mr-2 h-5 w-5" />
                            Start Calculating
                          </Link>
                        </Button>
                        <Button 
                          size="lg"
                          variant="outline"
                          className="border-primary/30 hover:border-primary/50"
                          asChild
                        >
                          <Link href="/compare">
                            Browse Cards
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progressive Onboarding Steps */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-white">Setup Progress</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Step 1: Active - Financial Profile */}
                <Card className="glass-premium border-primary/30 relative">
                  <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-xs font-bold text-[#090A0F] shadow-lg">
                    1
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Financial Profile</CardTitle>
                    <CardDescription className="text-xs">
                      Tell us your spending habits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Start here</span>
                      </div>
                      <Button size="sm" className="bg-primary/20 hover:bg-primary/30 text-primary border-0" asChild>
                        <Link href="/users/profile">
                          Set Up
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 2: Locked - Card Portfolio */}
                <Card className="glass-premium border-white/10 relative opacity-60">
                  <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    2
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-gray-400">Card Portfolio</CardTitle>
                    <CardDescription className="text-xs">
                      Track your current cards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-gray-500" />
                        </div>
                        <span className="text-sm text-gray-500">Next step</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 3: Locked - Optimization */}
                <Card className="glass-premium border-white/10 relative opacity-60">
                  <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    3
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-gray-400">Card Optimization</CardTitle>
                    <CardDescription className="text-xs">
                      See best card per category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-gray-500" />
                        </div>
                        <span className="text-sm text-gray-500">Final step</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

          </>        )}

        {/* Active User Experience: Strategies First */}
        {!isNewUser && (
          <>
            {/* Stats Overview - Compact */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mb-6">
              <Card className="glass-premium border-primary/20">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Account</p>
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary">Free for All</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-premium border-primary/20">
                <CardContent className="py-4">
                  <p className="text-xs text-muted-foreground mb-1">Total Strategies</p>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{totalStrategies}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-premium border-primary/20">
                <CardContent className="py-4">
                  <p className="text-xs text-muted-foreground mb-1">In Progress</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-yellow-500" />
                    <span className="text-2xl font-bold">{activeStrategies}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-premium border-primary/20">
                <CardContent className="py-4">
                  <p className="text-xs text-muted-foreground mb-1">Completed</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{completedStrategies}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Strategies - Primary Content */}
            <div className="mb-6">
              <StrategyKanban strategies={dbUser.savedStrategies} />
            </div>

            {/* Quick Actions - Secondary */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-white">Quick Actions</h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <Link href="/users/profile">
                  <Card className="glass-premium border-primary/20 hover:border-primary/40 transition-all cursor-pointer h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Target className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Update Profile</h3>
                          <p className="text-xs text-muted-foreground">Spending habits</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/users/cards">
                  <Card className="glass-premium border-primary/20 hover:border-primary/40 transition-all cursor-pointer h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Manage Cards</h3>
                          <p className="text-xs text-muted-foreground">Track portfolio</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/users/optimization">
                  <Card className="glass-premium border-primary/20 hover:border-primary/40 transition-all cursor-pointer h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Optimize Usage</h3>
                          <p className="text-xs text-muted-foreground">Category matching + email report</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Bank Connections - Minimal */}
        <Card className="glass-premium border-white/5 mb-6">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">Bank Connection</span>
                  <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[10px] px-1.5 py-0">Beta</Badge>
                </div>
                <p className="text-[10px] text-gray-600 mt-0.5">Transaction insights coming soon</p>
              </div>
              <PlaidSection linkedAccounts={dbUser.linkedAccounts} />
            </div>
          </CardContent>
        </Card>
        {/* Beta Feedback - Bottom of Page */}
        <div>
          <BetaFeedbackWidget />
        </div>
      </div>
    </div>
  )
}

