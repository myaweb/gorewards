'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  TrendingUp, 
  Calculator, 
  RefreshCw,
  ShoppingCart,
  Car,
  Utensils,
  Receipt,
  Plane,
  Package,
  MoreHorizontal,
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { CardOptimizationResult, CategoryOptimization } from '@/lib/types/cardOptimization'
import { SpendingCategory } from '@prisma/client'

interface CardOptimizationDisplayProps {
  onRefresh?: () => void
}

const CATEGORY_ICONS: Record<SpendingCategory, any> = {
  GROCERY: ShoppingCart,
  GAS: Car,
  DINING: Utensils,
  RECURRING: Receipt,
  TRAVEL: Plane,
  SHOPPING: Package,
  ENTERTAINMENT: MoreHorizontal,
  UTILITIES: Receipt,
  STUDENT: CreditCard,
  BUSINESS: CreditCard,
  SIGNUP_BONUS: Sparkles,
  OTHER: MoreHorizontal
}

const CATEGORY_NAMES: Record<SpendingCategory, string> = {
  GROCERY: 'Grocery',
  GAS: 'Gas',
  DINING: 'Dining',
  RECURRING: 'Bills',
  TRAVEL: 'Travel',
  SHOPPING: 'Shopping',
  ENTERTAINMENT: 'Entertainment',
  UTILITIES: 'Utilities',
  STUDENT: 'Student',
  BUSINESS: 'Business',
  SIGNUP_BONUS: 'Sign-up Bonus',
  OTHER: 'Other'
}

const getConfidenceLabel = (confidence: number): { label: string; variant: 'default' | 'secondary' | 'outline' } => {
  if (confidence >= 80) return { label: 'High confidence', variant: 'default' }
  if (confidence >= 50) return { label: 'Medium confidence', variant: 'secondary' }
  return { label: 'Limited confidence', variant: 'outline' }
}

export function CardOptimizationDisplay({ onRefresh }: CardOptimizationDisplayProps) {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [optimization, setOptimization] = useState<CardOptimizationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadOptimization()
    }
  }, [user])

  const loadOptimization = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/optimize/cards')
      const data = await response.json()
      
      if (data.success) {
        setOptimization(data.data)
      } else {
        setError(data.error || 'Failed to load optimization')
      }
    } catch (err) {
      console.error('Error loading optimization:', err)
      setError('Failed to load card optimization')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadOptimization()
    onRefresh?.()
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Sign in to optimize</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Sign in to see personalized card recommendations based on your spending
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
          <h3 className="font-semibold text-lg mb-2">Analyzing your cards</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Finding the best card for each spending category
          </p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    const isNoCards = error.toLowerCase().includes('no active cards') || error.toLowerCase().includes('no cards')
    const isNoProfile = error.toLowerCase().includes('profile') || error.toLowerCase().includes('spending')

    return (
      <Card className="glass-premium border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
          <div className="rounded-full bg-primary/10 p-4">
            <AlertCircle className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">
              {isNoCards ? 'No cards in your portfolio' : isNoProfile ? 'Spending profile incomplete' : 'Unable to load optimization'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {isNoCards
                ? 'Add your credit cards to your portfolio first, then we can show which card to use for each category.'
                : isNoProfile
                ? 'Complete your spending profile so we can calculate the best card for each category.'
                : error}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {isNoCards && (
              <Button asChild size="sm" className="bg-primary/20 hover:bg-primary/30 text-primary border-0">
                 <a href="/users/cards">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Add Cards
                        </a>
              </Button>
            )}
            {isNoProfile && (
              <Button asChild size="sm" className="bg-primary/20 hover:bg-primary/30 text-primary border-0">
                <a href="/users/profile">
                  <Calculator className="h-4 w-4 mr-2" />
                  Set Up Profile
                </a>
              </Button>
            )}
            {!isNoCards && !isNoProfile && (
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!optimization) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <Calculator className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Ready to optimize</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Add your cards and spending profile to see which card to use for each category
            </p>
          </div>
          <Button onClick={handleRefresh} size="sm">
            <Calculator className="h-4 w-4 mr-2" />
            Analyze Cards
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Your Optimization
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Based on your spending profile
              </p>
            </div>
            <Button onClick={handleRefresh} variant="ghost" size="sm" className="shrink-0">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rewards Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Monthly rewards</div>
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(optimization.totalMonthlyRewards)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Yearly potential</div>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(optimization.totalYearlyRewards)}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Categories optimized</div>
              <div className="text-xl font-semibold">
                {optimization.summary.totalCategories}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Average multiplier</div>
              <div className="text-xl font-semibold">
                {optimization.summary.averageMultiplier}x
              </div>
            </div>
          </div>
          
          {/* Best Overall Card Highlight */}
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/20 p-2 shrink-0">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Most versatile card
                </div>
                {optimization.summary.bestOverallCard ? (
                  <>
                    <div className="text-lg font-semibold truncate">
                      {optimization.summary.bestOverallCard.name}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Best for {optimization.summary.bestOverallCard.categoriesCount} {optimization.summary.bestOverallCard.categoriesCount === 1 ? 'category' : 'categories'}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No card data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Optimizations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Card recommendations by category</h3>
          <Badge variant="secondary" className="text-xs">
            {optimization.optimizations.length} {optimization.optimizations.length === 1 ? 'category' : 'categories'}
          </Badge>
        </div>
        
        <div className="grid gap-3">
          {optimization.optimizations.map((opt: CategoryOptimization) => {
            const IconComponent = CATEGORY_ICONS[opt.category]
            const categoryName = CATEGORY_NAMES[opt.category]
            const confidenceInfo = getConfidenceLabel(opt.confidence)
            
            return (
              <Card key={opt.category} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-5">
                  {/* Header: Category + Confidence */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base mb-0.5">{categoryName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(opt.monthlySpending * 100)}/month
                        </p>
                      </div>
                    </div>
                    <Badge variant={confidenceInfo.variant} className="shrink-0 text-xs">
                      {confidenceInfo.label}
                    </Badge>
                  </div>
                  
                  {/* Recommendation Card */}
                  <div className="bg-muted/50 rounded-lg p-4 mb-3">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-semibold truncate">{opt.recommendedCard.name}</span>
                      </div>
                      <Badge variant="outline" className="shrink-0 font-mono">
                        {opt.multiplier}x
                      </Badge>
                    </div>
                    
                    <div className="flex items-baseline justify-between">
                      <div className="text-sm text-muted-foreground">
                        Estimated rewards
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(opt.monthlyRewards)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(opt.yearlyRewards)}/year
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Explanation */}
                  {opt.explanation && (
                    <div className="pt-3 border-t border-border/50">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {opt.explanation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground text-center pt-2">
        Last updated {new Date(optimization.lastCalculated).toLocaleString('en-CA', { 
          month: 'short', 
          day: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit' 
        })}
      </div>
    </div>
  )
}
