'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  Trash2, 
  CheckCircle2,
  Target,
  Sparkles,
  ChevronDown
} from 'lucide-react'
import { updateStrategyCompletion, deleteStrategy, updateStrategySteps } from '@/app/actions/strategy.actions'
import confetti from 'canvas-confetti'

interface StrategyKanbanProps {
  strategies: any[]
}

interface RoadmapStep {
  month: number
  cardId: string
  cardName: string
  action: 'APPLY' | 'USE'
  monthlyPointsEarned: number
  cumulativePoints: number
  bonusProgress?: {
    bonusEarned: boolean
    bonusPoints: number
  } | null
}

interface RoadmapData {
  steps: RoadmapStep[]
  totalMonths: number
  totalPointsEarned: number
  goalAchieved: boolean
}

export function StrategyKanban({ strategies }: StrategyKanbanProps) {
  if (strategies.length === 0) {
    return (
      <Card className="glass-premium border-primary/20">
        <CardContent className="py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
              <div className="relative w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-10 w-10 text-primary" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-3">Start Your First Strategy</h3>
            <p className="text-muted-foreground mb-6">
              Build a personalized roadmap to earn maximum rewards and reach your travel goals
            </p>
            
            <div className="space-y-2 mb-8 text-left max-w-xs mx-auto">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Get personalized card recommendations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Track welcome bonuses step-by-step</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Reach your travel goals faster</span>
              </div>
            </div>
            
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-[#090A0F] shadow-[0_0_20px_rgba(6,182,212,0.6)]">
              <a href="/">
                <Sparkles className="mr-2 h-5 w-5" />
                Calculate My Strategy
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold">Your Strategies</h2>
        <Badge variant="outline" className="text-xs sm:text-sm">
          {strategies.length} {strategies.length === 1 ? 'Strategy' : 'Strategies'}
        </Badge>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {strategies.map((strategy) => (
          <StrategyCard key={strategy.id} strategy={strategy} />
        ))}
      </div>
    </div>
  )
}

function StrategyCard({ strategy }: { strategy: any }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Initialize completedSteps from database
  const initialCompletedSteps = strategy.completedSteps 
    ? new Set<number>(
        Array.isArray(strategy.completedSteps) 
          ? strategy.completedSteps 
          : JSON.parse(strategy.completedSteps as string)
      )
    : new Set<number>()
  
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(initialCompletedSteps)

  const roadmapData = strategy.roadmapData as RoadmapData
  const steps = roadmapData.steps || []

  // Get the first card from the roadmap (recommended card)
  const recommendedCard = steps.length > 0 ? steps[0] : null

  // Calculate progress
  const totalSteps = steps.length
  const completedCount = completedSteps.size
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0

  const handleStepToggle = async (stepIndex: number, checked: boolean) => {
    const newCompleted = new Set(completedSteps)
    
    if (checked) {
      newCompleted.add(stepIndex)
    } else {
      newCompleted.delete(stepIndex)
    }
    
    setCompletedSteps(newCompleted)

    // Save to database
    const completedArray = Array.from(newCompleted)
    await updateStrategySteps(strategy.id, completedArray)

    // Check if all 5 steps are completed
    const totalRoadmapSteps = 5
    if (newCompleted.size === totalRoadmapSteps && !strategy.isCompleted) {
      // Mark strategy as completed
      await updateStrategyCompletion(strategy.id, true, completedArray)
      
      // Trigger confetti!
      triggerConfetti()
    } else if (newCompleted.size < totalRoadmapSteps && strategy.isCompleted) {
      // Mark as incomplete if user unchecks
      await updateStrategyCompletion(strategy.id, false, completedArray)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this strategy?')) return

    setIsDeleting(true)
    const result = await deleteStrategy(strategy.id)
    
    if (result.success) {
      window.location.reload()
    } else {
      alert(result.error)
      setIsDeleting(false)
    }
  }

  const triggerConfetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#00FFFF', '#00CED1', '#40E0D0', '#48D1CC', '#AFEEEE']
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#00FFFF', '#00CED1', '#40E0D0', '#48D1CC', '#AFEEEE']
      })
    }, 250)
  }

  return (
    <Card className={`glass-premium transition-all ${
      strategy.isCompleted 
        ? 'border-green-500/30 bg-green-500/5' 
        : 'border-amber-500/30 bg-amber-500/5'
    }`}>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <CardTitle className="text-base sm:text-xl truncate">{strategy.goalName}</CardTitle>
              {strategy.isCompleted ? (
                <Badge className="bg-green-600 hover:bg-green-600 text-white border-0 text-xs w-fit shadow-lg">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              ) : (
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs w-fit">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {completedCount === 0 ? 'Ready to Start' : 'In Progress'}
                </Badge>
              )}
            </div>
            <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{new Date(strategy.createdAt).toLocaleDateString()}</span>
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{roadmapData.totalPointsEarned?.toLocaleString() || 0} points</span>
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{roadmapData.totalMonths || 0} months</span>
              </span>
            </CardDescription>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-[#090A0F] hover:bg-cyan-400 transition-all duration-300 h-8 w-8 p-0"
            >
              <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-muted-foreground">Progress</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                      completedSteps.has(i) ? 'bg-cyan-400' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="font-semibold">{completedCount} / 5 steps</span>
          </div>
          <div className="h-1.5 sm:h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-500 ease-out"
              style={{ width: `${(completedCount / 5) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>

      {/* Next Action - Collapsed View */}
      {!isExpanded && !strategy.isCompleted && recommendedCard && (
        <CardContent className="pt-0 pb-4 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate">
                  {completedCount === 0 ? 'Start: ' : 'Next: '}
                  Apply for {recommendedCard.cardName}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Step 1 of 5</p>
              </div>
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-xs sm:text-sm" asChild>
              <a 
                href={`/go/${recommendedCard.cardName.toLowerCase().replace(/\s+/g, '-')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Apply →
              </a>
            </Button>
          </div>
        </CardContent>
      )}

      {isExpanded && (
        <CardContent className="border-t border-white/10 bg-white/[0.02] transition-all duration-300 p-0">
          <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* 5-Step Interactive Roadmap */}
            <div className="space-y-3 sm:space-y-4">
              
              {/* Step 1: Apply for Recommended Card */}
              <div className="relative pl-6 sm:pl-8">
                {/* Timeline connector */}
                <div className="absolute left-1.5 sm:left-2 top-8 bottom-0 w-0.5 bg-white/10" />
                
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 mt-1 flex-shrink-0 ${
                    completedSteps.has(0) 
                      ? 'bg-cyan-400 border-cyan-400' 
                      : 'bg-background border-gray-400'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`text-sm sm:text-base font-semibold ${
                        completedSteps.has(0) ? 'text-cyan-400' : 'text-white'
                      }`}>
                        Step 1: Apply for Recommended Card
                      </h4>
                    </div>
                    
                    {recommendedCard && (
                      <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3 sm:p-4 mb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm sm:text-base font-medium truncate">{recommendedCard.cardName}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">
                                Earn {recommendedCard.bonusProgress?.bonusPoints.toLocaleString() || 0} bonus points
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          asChild
                          className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-background font-semibold text-xs sm:text-sm"
                        >
                          <a 
                            href={`/go/${recommendedCard.cardName.toLowerCase().replace(/\s+/g, '-')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Sparkles className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Apply Now
                          </a>
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`step-1-${strategy.id}`}
                        checked={completedSteps.has(0)}
                        onCheckedChange={(checked) => handleStepToggle(0, checked as boolean)}
                        className="mt-2"
                      />
                      <label 
                        htmlFor={`step-1-${strategy.id}`}
                        className="text-xs sm:text-sm text-muted-foreground cursor-pointer mt-2"
                      >
                        Mark as completed
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Add to Portfolio */}
              <div className="relative pl-6 sm:pl-8">
                <div className="absolute left-1.5 sm:left-2 top-8 bottom-0 w-0.5 bg-white/10" />
                
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 mt-1 flex-shrink-0 ${
                    completedSteps.has(1) 
                      ? 'bg-cyan-400 border-cyan-400' 
                      : completedSteps.has(0)
                      ? 'bg-background border-white'
                      : 'bg-background border-gray-400'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`text-sm sm:text-base font-semibold ${
                        completedSteps.has(1) 
                          ? 'text-cyan-400' 
                          : completedSteps.has(0)
                          ? 'text-white'
                          : 'text-gray-400'
                      }`}>
                        Step 2: Add Card to Portfolio
                      </h4>
                    </div>
                    
                    <p className={`text-xs sm:text-sm mb-3 ${
                      completedSteps.has(0) ? 'text-muted-foreground' : 'text-gray-500'
                    }`}>
                      Once your {recommendedCard?.cardName || 'new card'} arrives, add it to your Cards section to track bonuses and annual fees.
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`step-2-${strategy.id}`}
                        checked={completedSteps.has(1)}
                        onCheckedChange={(checked) => handleStepToggle(1, checked as boolean)}
                        className="mt-2"
                      />
                      <label 
                        htmlFor={`step-2-${strategy.id}`}
                        className="text-xs sm:text-sm text-muted-foreground cursor-pointer mt-2"
                      >
                        Mark as completed
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Hit Minimum Spend - CRITICAL STEP */}
              <div className="relative pl-8">
                <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-white/10" />
                
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 mt-1 flex-shrink-0 ${
                    completedSteps.has(2) 
                      ? 'bg-cyan-400 border-cyan-400' 
                      : completedSteps.has(1)
                      ? 'bg-background border-white'
                      : 'bg-background border-gray-400'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h4 className={`text-sm sm:text-base font-semibold ${
                        completedSteps.has(2) 
                          ? 'text-cyan-400' 
                          : completedSteps.has(1)
                          ? 'text-white'
                          : 'text-gray-400'
                      }`}>
                        Step 3: Hit Minimum Spend
                      </h4>
                      <Badge variant="outline" className="text-[10px] sm:text-xs border-cyan-400/50 text-cyan-400 w-fit">
                        CRITICAL
                      </Badge>
                    </div>
                    
                    <p className={`text-xs sm:text-sm mb-3 ${
                      completedSteps.has(1) ? 'text-muted-foreground' : 'text-gray-500'
                    }`}>
                      Meet the minimum spending requirement within the specified timeframe to unlock your welcome bonus. Check your card's terms for the exact amount and deadline.
                    </p>
                    
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 sm:p-3 mb-3">
                      <p className="text-[10px] sm:text-xs text-amber-400 flex items-center gap-2">
                        <Sparkles className="h-3 w-3 flex-shrink-0" />
                        <span>Tip: Track your progress in the Cards section after adding your card to the portfolio</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`step-3-${strategy.id}`}
                        checked={completedSteps.has(2)}
                        onCheckedChange={(checked) => handleStepToggle(2, checked as boolean)}
                        className="mt-2"
                      />
                      <label 
                        htmlFor={`step-3-${strategy.id}`}
                        className="text-xs sm:text-sm text-muted-foreground cursor-pointer mt-2"
                      >
                        Mark as completed
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Receive Welcome Bonus */}
              <div className="relative pl-6 sm:pl-8">
                <div className="absolute left-1.5 sm:left-2 top-8 bottom-0 w-0.5 bg-white/10" />
                
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 mt-1 flex-shrink-0 ${
                    completedSteps.has(3) 
                      ? 'bg-cyan-400 border-cyan-400' 
                      : completedSteps.has(2)
                      ? 'bg-background border-white'
                      : 'bg-background border-gray-400'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`text-sm sm:text-base font-semibold ${
                        completedSteps.has(3) 
                          ? 'text-cyan-400' 
                          : completedSteps.has(2)
                          ? 'text-white'
                          : 'text-gray-400'
                      }`}>
                        Step 4: Receive Welcome Bonus
                      </h4>
                    </div>
                    
                    <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3 sm:p-4 mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-cyan-400 truncate">
                            {recommendedCard?.bonusProgress?.bonusPoints.toLocaleString() || '30,000'} Points
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            Pending welcome bonus drop
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`step-4-${strategy.id}`}
                        checked={completedSteps.has(3)}
                        onCheckedChange={(checked) => handleStepToggle(3, checked as boolean)}
                        className="mt-2"
                      />
                      <label 
                        htmlFor={`step-4-${strategy.id}`}
                        className="text-xs sm:text-sm text-muted-foreground cursor-pointer mt-2"
                      >
                        Mark as completed
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5: Transfer & Book */}
              <div className="relative pl-6 sm:pl-8">
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 mt-1 flex-shrink-0 ${
                    completedSteps.has(4) 
                      ? 'bg-cyan-400 border-cyan-400' 
                      : completedSteps.has(3)
                      ? 'bg-background border-white'
                      : 'bg-background border-gray-400'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`text-sm sm:text-base font-semibold ${
                        completedSteps.has(4) 
                          ? 'text-cyan-400' 
                          : completedSteps.has(3)
                          ? 'text-white'
                          : 'text-gray-400'
                      }`}>
                        Step 5: Transfer & Book
                      </h4>
                    </div>
                    
                    <p className={`text-xs sm:text-sm mb-3 ${
                      completedSteps.has(3) ? 'text-muted-foreground' : 'text-gray-500'
                    }`}>
                      Transfer your points to your preferred loyalty program and book your {strategy.goalName}!
                    </p>
                    
                    <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-400/10 border border-cyan-400/30 rounded-lg p-3 sm:p-4 mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Target className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-medium text-cyan-400 truncate">Goal: {strategy.goalName}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            Total points earned: {roadmapData.totalPointsEarned?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`step-5-${strategy.id}`}
                        checked={completedSteps.has(4)}
                        onCheckedChange={(checked) => handleStepToggle(4, checked as boolean)}
                        className="mt-2"
                      />
                      <label 
                        htmlFor={`step-5-${strategy.id}`}
                        className="text-xs sm:text-sm text-muted-foreground cursor-pointer mt-2"
                      >
                        Mark as completed
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {strategy.isCompleted && (
            <div className="mx-4 sm:mx-6 mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-primary/20 to-cyan-400/20 border border-primary/30">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-primary">Strategy Completed! 🎉</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    You've earned {roadmapData.totalPointsEarned?.toLocaleString()} points toward your goal
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

