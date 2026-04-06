'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  MoreVertical,
  Sparkles,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { CardOwnershipStatus } from '@/lib/types/userProfile'
import { AddCardModal } from './add-card-modal'
import { cn } from '@/lib/utils'

interface UserCardPortfolioProps {
  onAddCard?: () => void
}

// Map DB spending categories to profile monthly fields
const CATEGORY_TO_PROFILE_FIELD: Record<string, string> = {
  GROCERY: 'monthlyGrocery',
  GAS: 'monthlyGas',
  DINING: 'monthlyDining',
  RECURRING: 'monthlyBills',
  TRAVEL: 'monthlyTravel',
  SHOPPING: 'monthlyShopping',
  OTHER: 'monthlyOther',
}

function calcMonthlyValue(
  multipliers: { category: string; value: number }[] | undefined,
  profile: Record<string, number> | null
): number | null {
  if (!multipliers?.length || !profile) return null
  let total = 0
  for (const m of multipliers) {
    const field = CATEGORY_TO_PROFILE_FIELD[m.category]
    const spend = field ? (profile[field] ?? 0) : 0
    // Assume 1 point = $0.01 (1 cent), multiplier = points per dollar
    total += spend * m.value * 0.01
  }
  return total > 0 ? total : null
}

export function UserCardPortfolio({ onAddCard }: UserCardPortfolioProps) {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [cards, setCards] = useState<CardOwnershipStatus[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [spendingProfile, setSpendingProfile] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    if (user) {
      loadCards()
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      const data = await res.json()
      if (data.success && data.data?.profile) {
        setSpendingProfile(data.data.profile)
      }
    } catch {
      // non-critical, silently fail
    }
  }

  const loadCards = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/profile/cards')
      const data = await response.json()
      
      if (data.success) {
        setCards(data.data)
      } else {
        setError(data.error || 'Failed to load cards')
      }
    } catch (error) {
      console.error('Error loading cards:', error)
      setError('Unable to connect. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCard = () => {
    setShowAddModal(true)
    onAddCard?.()
  }

  const handleCardAdded = () => {
    loadCards()
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateProgress = (currentSpend: number, requiredSpend: number) => {
    return Math.min((currentSpend / requiredSpend) * 100, 100)
  }

  const getDaysUntil = (date: Date | string) => {
    const target = new Date(date)
    const today = new Date()
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getNetworkIcon = (network?: string) => {
    if (!network) return null
    const networkLower = network.toLowerCase()
    if (networkLower.includes('visa')) return '💳'
    if (networkLower.includes('mastercard')) return '💳'
    if (networkLower.includes('amex')) return '💳'
    return '💳'
  }

  // Portfolio summary calculations
  const portfolioStats = {
    totalCards: cards.length,
    activeBonuses: cards.reduce((sum, card) => sum + card.activeBonuses.filter(b => !b.isCompleted).length, 0),
    completedBonuses: cards.reduce((sum, card) => sum + card.activeBonuses.filter(b => b.isCompleted).length, 0),
    upcomingFees: cards.filter(card => {
      if (!card.annualFeeDate) return false
      const daysUntil = getDaysUntil(card.annualFeeDate)
      return daysUntil > 0 && daysUntil <= 90
    }).length
  }

  if (!user) {
    return (
      <Card className="border-muted">
        <CardContent className="p-8 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">Please sign in to manage your card portfolio</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header — removed, page already has title */}

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Unable to load cards</p>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadCards}
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-48 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : cards.length === 0 ? (
        /* Empty State */
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Build Your Card Portfolio</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Add your current credit cards to unlock personalized recommendations, 
                track welcome bonuses, and optimize your rewards strategy.
              </p>
            </div>
            <Button onClick={handleAddCard} size="lg" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Portfolio Summary + Add Card */}
          <div className="flex items-center justify-between mb-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 mr-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <CreditCard className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{portfolioStats.totalCards}</p>
                      <p className="text-[10px] text-muted-foreground">Cards</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{portfolioStats.activeBonuses}</p>
                      <p className="text-[10px] text-muted-foreground">Bonuses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-green-500/10">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{portfolioStats.completedBonuses}</p>
                      <p className="text-[10px] text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-500/10">
                      <Clock className="h-3.5 w-3.5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{portfolioStats.upcomingFees}</p>
                      <p className="text-[10px] text-muted-foreground">Fees Due</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Button onClick={handleAddCard} size="sm" className="flex-shrink-0">
              <Plus className="h-4 w-4 mr-1" />
              Add Card
            </Button>
          </div>
          {/* Card List */}
          <div className="grid gap-4">
            {cards.map((cardStatus) => {
              const hasActiveBonuses = cardStatus.activeBonuses.length > 0
              const inProgressBonuses = cardStatus.activeBonuses.filter(b => !b.isCompleted)
              const completedBonuses = cardStatus.activeBonuses.filter(b => b.isCompleted)
              const feesDue = cardStatus.annualFeeDate ? getDaysUntil(cardStatus.annualFeeDate) : null
              const showFeeWarning = feesDue !== null && feesDue > 0 && feesDue <= 90

              return (
                <Card key={cardStatus.cardId} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4 bg-gradient-to-br from-muted/30 to-muted/10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Card Name */}
                        <CardTitle className="text-xl mb-2 flex items-center gap-2">
                          <span className="text-2xl">{getNetworkIcon(cardStatus.network)}</span>
                          <span className="truncate">
                            {cardStatus.cardName || 'Credit Card'}
                          </span>
                        </CardTitle>
                        
                        {/* Card Details */}
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          {cardStatus.bank && (
                            <span className="font-medium">{cardStatus.bank}</span>
                          )}
                          {cardStatus.network && (
                            <>
                              <span>•</span>
                              <span>{cardStatus.network}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                          Active
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5 pt-5">
                    {/* Key Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {cardStatus.openDate && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10 mt-0.5">
                            <Calendar className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-0.5">Opened</p>
                            <p className="font-semibold text-sm">{formatDate(cardStatus.openDate)}</p>
                          </div>
                        </div>
                      )}

                      {cardStatus.annualFeeDate && (
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-lg mt-0.5",
                            showFeeWarning ? "bg-orange-500/10" : "bg-muted"
                          )}>
                            <DollarSign className={cn(
                              "h-4 w-4",
                              showFeeWarning ? "text-orange-500" : "text-muted-foreground"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-0.5">
                              Annual Fee {showFeeWarning && `(${feesDue}d)`}
                            </p>
                            <p className="font-semibold text-sm">{formatDate(cardStatus.annualFeeDate)}</p>
                            {cardStatus.annualFee !== undefined && (
                              <p className="text-xs text-muted-foreground">
                                {cardStatus.annualFee === 0 ? 'No annual fee' : `$${cardStatus.annualFee}/yr`}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {cardStatus.canDowngrade && cardStatus.downgradeEligibleDate && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-purple-500/10 mt-0.5">
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-0.5">Downgrade Ready</p>
                            <p className="font-semibold text-sm">{formatDate(cardStatus.downgradeEligibleDate)}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Optimization hint */}
                    <div className="pt-2 border-t border-white/5">
                      {(() => {
                        const monthlyValue = calcMonthlyValue(cardStatus.multipliers, spendingProfile)
                        if (monthlyValue !== null) {
                          return (
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Sparkles className="h-3 w-3 text-amber-500 flex-shrink-0" />
                              Estimated monthly value with your spending:{' '}
                              <span className="font-semibold text-foreground">${monthlyValue.toFixed(2)}</span>
                            </p>
                          )
                        }
                        if (cardStatus.topMultiplier) {
                          return (
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Sparkles className="h-3 w-3 text-amber-500 flex-shrink-0" />
                              Best earning rate: <span className="font-semibold text-foreground">{cardStatus.topMultiplier.value}x</span> on <span className="capitalize font-medium">{cardStatus.topMultiplier.category.toLowerCase()}</span>
                            </p>
                          )
                        }
                        return (
                          <a href="/users/optimization" className="text-xs text-primary hover:underline flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            See which categories this card is best for
                          </a>
                        )
                      })()}
                    </div>

                    {/* Active Bonuses */}
                    {hasActiveBonuses && (
                      <div className="space-y-3 pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            Welcome Bonuses
                          </h4>
                          <div className="flex items-center gap-2">
                            {inProgressBonuses.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {inProgressBonuses.length} Active
                              </Badge>
                            )}
                            {completedBonuses.length > 0 && (
                              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400">
                                {completedBonuses.length} Complete
                              </Badge>
                            )}
                          </div>
                        </div>

                        {cardStatus.activeBonuses.map((bonus, index) => {
                          const progress = calculateProgress(bonus.currentSpend, bonus.requiredSpend)
                          const isCompleted = bonus.isCompleted
                          const daysLeft = getDaysUntil(bonus.deadline)
                          const isUrgent = daysLeft > 0 && daysLeft <= 30
                          const remaining = bonus.requiredSpend - bonus.currentSpend

                          return (
                            <div 
                              key={index} 
                              className={cn(
                                "space-y-3 p-4 rounded-lg border transition-colors",
                                isCompleted 
                                  ? "bg-green-500/5 border-green-500/20" 
                                  : "bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20"
                              )}
                            >
                              {/* Bonus Header */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold">
                                      ${bonus.requiredSpend.toLocaleString()} Spend Target
                                    </p>
                                    {isCompleted ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    ) : isUrgent ? (
                                      <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                                    ) : null}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {isCompleted ? (
                                      'Bonus requirement met'
                                    ) : (
                                      <>
                                        ${remaining.toLocaleString()} remaining • {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                                      </>
                                    )}
                                  </p>
                                </div>
                                <Badge 
                                  variant={isCompleted ? "default" : "secondary"}
                                  className={cn(
                                    isCompleted && "bg-green-500 hover:bg-green-600",
                                    isUrgent && !isCompleted && "bg-orange-500/10 text-orange-700 dark:text-orange-400"
                                  )}
                                >
                                  {isCompleted ? "Complete" : "In Progress"}
                                </Badge>
                              </div>

                              {/* Progress Bar */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="font-medium">
                                    ${bonus.currentSpend.toLocaleString()} spent
                                  </span>
                                  <span className="text-muted-foreground">
                                    {progress.toFixed(0)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={progress} 
                                  className={cn(
                                    "h-2.5",
                                    isCompleted && "[&>div]:bg-green-500"
                                  )}
                                />
                              </div>

                              {/* Deadline */}
                              <div className="flex items-center justify-between text-xs pt-1">
                                <span className="text-muted-foreground">
                                  Deadline: {formatDate(bonus.deadline)}
                                </span>
                                {!isCompleted && daysLeft > 0 && (
                                  <span className={cn(
                                    "font-medium",
                                    isUrgent ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"
                                  )}>
                                    {isUrgent && '⚠️ '}{daysLeft} days remaining
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
      
      <AddCardModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        onCardAdded={handleCardAdded}
      />
    </div>
  )
}
