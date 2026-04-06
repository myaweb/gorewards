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
import { updateStrategyCompletion, deleteStrategy } from '@/app/actions/strategy.actions'
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
          <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Saved Strategies</h3>
          <p className="text-muted-foreground mb-6">
            Calculate your first optimization strategy to get started
          </p>
          <Button asChild className="bg-gradient-to-r from-primary to-cyan-400">
            <a href="/product#calculator">
              <Sparkles className="mr-2 h-4 w-4" />
              Calculate Strategy
            </a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Strategies</h2>
        <Badge variant="outline" className="text-sm">
          {strategies.length} {strategies.length === 1 ? 'Strategy' : 'Strategies'}
        </Badge>
      </div>

      <div className="grid gap-6">
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
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const roadmapData = strategy.roadmapData as RoadmapData
  const steps = roadmapData.steps || []

  // Get the first card from the roadmap (recommended card)
  const recommendedCard = steps.length > 0 ? steps[0] : null
  
  // Mock Plaid spending data for demo (in production, fetch from actual Plaid data)
  const mockSpendingProgress = 1200
  const mockSpendingTarget = 3000

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

    // Check if all 5 steps are completed
    const totalRoadmapSteps = 5
    if (newCompleted.size === totalRoadmapSteps && !strategy.isCompleted) {
      // Mark strategy as completed
      await updateStrategyCompletion(strategy.id, true)
      
      // Trigger confetti!
      triggerConfetti()
    } else if (newCompleted.size < totalRoadmapSteps && strategy.isCompleted) {
      // Mark as incomplete if user unchecks
      await updateStrategyCompletion(strategy.id, false)
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
    <Card className={`glass-premium ${strategy.isCompleted ? 'border-primary/30 glow-teal' : 'border-primary/20'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl">{strategy.goalName}</CardTitle>
              {strategy.isCompleted && (
                <Badge className="bg-gradient-to-r from-primary to-cyan-400 text-background">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
            <CardDescription className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(strategy.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {roadmapData.totalPointsEarned?.toLocaleString() || 0} points
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {roadmapData.totalMonths || 0} months
              </span>
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground transition-transform duration-300"
            >
              <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{completedCount} / 5 steps</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-500 ease-out"
              style={{ width: `${(completedCount / 5) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="border-t border-white/10 bg-white/[0.02] transition-all duration-300">
          <div className="space-y-6 p-6">
            {/* 5-Step Interactive Roadmap */}
            <div className="space-y-4">
              
              {/* Step 1: Apply for Recommended Card */}
              <div className="relative pl-8">
                {/* Timeline connector */}
                <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-white/10" />
                
                <div className="flex items-start gap-4">
                  <div className={`w-4 h-4 rounded-full border-2 mt-1 flex-shrink-0 ${
                    completedSteps.has(0) 
                      ? 'bg-cyan-400 border-cyan-400' 
                      : 'bg-background border-gray-400'
                  }`} />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`font-semibold ${
                        completedSteps.has(0) ? 'text-cyan-400' : 'text-white'
                      }`}>
                        Step 1: Apply for Recommended Card
                      </h4>
                    </div>
                    
                    {recommendedCard && (
                      <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 mb-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-cyan-400" />
                            <div>
                              <p className="font-medium">{recommendedCard.cardName}</p>
                              <p className="text-xs text-muted-foreground">
                                Earn {recommendedCard.bonusProgress?.bonusPoints.toLocaleString() || 0} bonus points
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          asChild
                          className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 text-background font-semibold"
                        >
                          <a 
                            href={`/api/go/${recommendedCard.cardName.toLowerCase().replace(/\s+/g, '-')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Apply Now
                          </a>
                        </Button>
                      </div>
                    )}
                    
                    <Checkbox
                      id={`step-1-${strategy.id}`}
                      checked={completedSteps.has(0)}
                      onCheckedChange={(checked) => handleStepToggle(0, checked as boolean)}
                      className="mt-2"
                    />
                    <label 
                      htmlFor={`step-1-${strategy.id}`}
                      className="ml-2 text-sm text-muted-foreground cursor-pointer"
                    >
                      Mark as completed
                    </label>
                  </div>
                </div>
              </div>

              {/* Step 2: Connect Card */}
              <div className="relative pl-8">
                <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-white/10" />
                
                <div className="flex items-start gap-4">
                  <div className={`w-4 h-4 rounded-full border-2 mt-1 flex-shrink-0 ${
                    completedSteps.has(1) 
                      ? 'bg-cyan-400 border-cyan-400' 
                      : completedSteps.has(0)
                      ? 'bg-background border-white'
                      : 'bg-background border-gray-400'
                  }`} />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`font-semibold ${
                        completedSteps.has(1) 
                          ? 'text-cyan-400' 
                          : completedSteps.has(0)
                          ? 'text-white'
                          : 'text-gray-400'
                      }`}>
                        Step 2: Connect Card
                      </h4>
                    </div>
                    
                    <p className={`text-sm mb-3 ${
                      completedSteps.has(0) ? 'text-muted-foreground' : 'text-gray-500'
                    }`}>
                      Once your {recommendedCard?.cardName || 'new card'} arrives, link it via Plaid to track your spending automatically.
                    </p>
                    
                    <Checkbox
                      id={`step-2-${strategy.id}`}
                      checked={completedSteps.has(1)}
                      onCheckedChange={(checked) => handleStepToggle(1, checked as boolean)}
                      className="mt-2"
                    />
                    <label 
                      htmlFor={`step-2-${strategy.id}`}
                      className="ml-2 text-sm text-muted-foreground cursor-pointer"
                    >
                      Mark as completed
                    </label>
                  </div>
                </div>
              </div>

              {/* Step 3: Hit Minimum Spend - CRITICAL STEP */}
              <div className="relative pl-8">
                <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-white/10" />
                
                <div className="flex items-start gap-4">
                  <div className={`w-4 h-4 rounded-full border-2 mt-1 flex-shrink-0 ${
                    completedSteps.has(2) 
                      ? 'bg-cyan-400 border-cyan-400' 
                      : completedSteps.has(1)
                      ? 'bg-background border-white'
                      : 'bg-background border-gray-400'
                  }`} />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`font-semibold ${
                        completedSteps.has(2) 
                          ? 'text-cyan-400' 
                          : completedSteps.has(1)
                          ? 'text-white'
                          : 'text-gray-400'
                      }`}>
                        Step 3: Hit Minimum Spend
                      </h4>
                      <Badge variant="outline" className="text-xs border-cyan-400/50 text-cyan-400">
                        CRITICAL
                      </Badge>
                    </div>
                    
                    <p className={`text-sm mb-3 ${
                      completedSteps.has(1) ? 'text-muted-foreground' : 'text-gray-500'
                    }`}>
                      Spend ${mockSpendingTarget.toLocaleString()} in 3 months to unlock your welcome bonus
                    </p>
                    
                    {/* Progress Bar with Plaid Data */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Spending Progress</span>
                        <span className="text-sm font-semibold text-cyan-400">
                          ${mockSpendingProgress.toLocaleString()} / ${mockSpendingTarget.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
                          style={{ width: `${(mockSpendingProgress / mockSpendingTarget) * 100}%` }}
                        />
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        ${(mockSpendingTarget - mockSpendingProgress).toLocaleString()} remaining • 
                        {' '}{Math.ceil((mockSpendingTarget - mockSpendingProgress) / 30)} days left
                      </p>
                    </div>
                    
                    <Checkbox
                      id={`step-3-${strategy.id}`}
                      checked={completedSteps.has(2)}
                      onCheckedChange={(checked) => handleStepToggle(2, checked as boolean)}
                      className="mt-2"
                    />
                    <label 
                      htmlFor={`step-3-${strategy.id}`}
                      className="ml-2 text-sm text-muted-foreground cursor-pointer"
                    >
                      Mark as completed
                    </label>
                  </div>
                </div>
              </div>

              {/* Step 4: Receive Welcome Bonus */}
              <div className="relative pl-8">
                <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-white/10" />
                
                <div className="flex items-start gap-4">
                  <div className={`w-4 h-4 rounded-full border-2 mt-1 flex-shrink-0 ${
                    completedSteps.has(3) 
                      ? 'bg-cyan-400 border-cyan-400' 
                      : completedSteps.has(2)
                      ? 'bg-background border-white'
                      : 'bg-background border-gray-400'
                  }`} />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`font-semibold ${
                        completedSteps.has(3) 
                          ? 'text-cyan-400' 
                          : completedSteps.has(2)
                          ? 'text-white'
                          : 'text-gray-400'
                      }`}>
                        Step 4: Receive Welcome Bonus
                      </h4>
                    </div>
                    
                    <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-cyan-400">
                            {recommendedCard?.bonusProgress?.bonusPoints.toLocaleString() || '30,000'} Points
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Pending welcome bonus drop
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Checkbox
                      id={`step-4-${strategy.id}`}
                      checked={completedSteps.has(3)}
                      onCheckedChange={(checked) => handleStepToggle(3, checked as boolean)}
                      className="mt-2"
                    />
                    <label 
                      htmlFor={`step-4-${strategy.id}`}
                      className="ml-2 text-sm text-muted-foreground cursor-pointer"
                    >
                      Mark as completed
                    </label>
                  </div>
                </div>
              </div>

              {/* Step 5: Transfer & Book */}
              <div className="relative pl-8">
                <div className="flex items-start gap-4">
                  <div className={`w-4 h-4 rounded-full border-2 mt-1 flex-shrink-0 ${
                    completedSteps.has(4) 
                      ? 'bg-cyan-400 border-cyan-400' 
                      : completedSteps.has(3)
                      ? 'bg-background border-white'
                      : 'bg-background border-gray-400'
                  }`} />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`font-semibold ${
                        completedSteps.has(4) 
                          ? 'text-cyan-400' 
                          : completedSteps.has(3)
                          ? 'text-white'
                          : 'text-gray-400'
                      }`}>
                        Step 5: Transfer & Book
                      </h4>
                    </div>
                    
                    <p className={`text-sm mb-3 ${
                      completedSteps.has(3) ? 'text-muted-foreground' : 'text-gray-500'
                    }`}>
                      Transfer your points to your preferred loyalty program and book your {strategy.goalName}!
                    </p>
                    
                    <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-400/10 border border-cyan-400/30 rounded-lg p-4 mb-3">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-cyan-400">Goal: {strategy.goalName}</p>
                          <p className="text-xs text-muted-foreground">
                            Total points earned: {roadmapData.totalPointsEarned?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Checkbox
                      id={`step-5-${strategy.id}`}
                      checked={completedSteps.has(4)}
                      onCheckedChange={(checked) => handleStepToggle(4, checked as boolean)}
                      className="mt-2"
                    />
                    <label 
                      htmlFor={`step-5-${strategy.id}`}
                      className="ml-2 text-sm text-muted-foreground cursor-pointer"
                    >
                      Mark as completed
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {strategy.isCompleted && (
            <div className="mx-6 mb-6 p-4 rounded-lg bg-gradient-to-r from-primary/20 to-cyan-400/20 border border-primary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Strategy Completed! 🎉</p>
                  <p className="text-sm text-muted-foreground">
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

