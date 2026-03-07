"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, CreditCard, TrendingUp } from "lucide-react"
import type { OptimalRoadmap } from "@/lib/types/spending"

interface RoadmapTimelineProps {
  roadmap: OptimalRoadmap
  goalName: string
}

export function RoadmapTimeline({ roadmap, goalName }: RoadmapTimelineProps) {
  const { steps, efficiency, goalAchieved, totalPointsEarned } = roadmap

  // Group steps by card application
  const timelineNodes = steps.filter(step => step.action === 'APPLY' || step.action === 'USE')

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Your Optimized Route</CardTitle>
              <CardDescription className="text-base mt-2">
                {goalAchieved ? (
                  <span className="text-primary font-medium">
                    ✓ Goal achieved in {efficiency.monthsToGoal} months!
                  </span>
                ) : (
                  <span>Strategy to reach {goalName}</span>
                )}
              </CardDescription>
            </div>
            {goalAchieved && (
              <CheckCircle2 className="h-8 w-8 text-primary" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Points</p>
              <p className="text-xl font-bold">{totalPointsEarned.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Time to Goal</p>
              <p className="text-xl font-bold">{efficiency.monthsToGoal} months</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Efficiency</p>
              <p className="text-xl font-bold">{efficiency.pointsPerDollar.toFixed(2)}x</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Spend</p>
              <p className="text-xl font-bold">${efficiency.totalSpend.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Month-by-Month Strategy</CardTitle>
          <CardDescription>Follow this roadmap to maximize your rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary/20" />

            {/* Timeline nodes */}
            <div className="space-y-8">
              {timelineNodes.map((step, index) => {
                const isCompleted = step.projectedGoalCompletion >= 100
                const isApplication = step.action === 'APPLY'
                
                return (
                  <div key={index} className="relative pl-16">
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-0">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        ${isCompleted 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-primary/20 text-primary'
                        }
                      `}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <Circle className="h-6 w-6" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      {/* Month badge */}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Month {step.month}
                        </Badge>
                        {isApplication && (
                          <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                            New Card
                          </Badge>
                        )}
                      </div>

                      {/* Card info */}
                      <div className="glass p-4 rounded-lg space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <CreditCard className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-base">{step.cardName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {isApplication ? 'Apply for this card' : 'Use this card'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Strategy details */}
                        {!isApplication && step.categoryAllocations.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Spending Strategy:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {step.categoryAllocations.map((cat, catIndex) => (
                                cat.amount > 0 && (
                                  <div 
                                    key={catIndex}
                                    className="text-xs bg-background/50 rounded px-2 py-1.5"
                                  >
                                    <span className="text-muted-foreground capitalize">
                                      {cat.category}:
                                    </span>
                                    <span className="ml-1 font-medium">
                                      ${cat.amount} × {cat.multiplier}x
                                    </span>
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Bonus progress */}
                        {step.bonusProgress && (
                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Signup Bonus Progress</span>
                              <span className="font-medium">
                                ${step.bonusProgress.currentSpend.toLocaleString()} / 
                                ${step.bonusProgress.requiredSpend.toLocaleString()}
                              </span>
                            </div>
                            <Progress 
                              value={(step.bonusProgress.currentSpend / step.bonusProgress.requiredSpend) * 100} 
                              className="h-2"
                            />
                            {step.bonusProgress.bonusEarned && (
                              <div className="flex items-center gap-2 text-primary text-sm font-medium">
                                <TrendingUp className="h-4 w-4" />
                                <span>
                                  Bonus earned: +{step.bonusProgress.bonusPoints.toLocaleString()} points!
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Points earned */}
                        {!isApplication && (
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className="text-sm text-muted-foreground">Points This Month</span>
                            <span className="text-lg font-bold text-primary">
                              +{step.monthlyPointsEarned.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {/* Cumulative progress */}
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Total Progress</span>
                            <span className="font-medium">
                              {step.cumulativePoints.toLocaleString()} points 
                              ({step.projectedGoalCompletion.toFixed(0)}%)
                            </span>
                          </div>
                          <Progress value={step.projectedGoalCompletion} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
