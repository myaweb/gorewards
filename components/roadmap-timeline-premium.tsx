"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, TrendingUp, Sparkles } from "lucide-react"
import { CardImage } from "@/components/card-image"
import type { OptimalRoadmap } from "@/lib/types/spending"

// Extract bank name from card name
function bankFromCardName(name: string): string {
  const n = name.toLowerCase()
  if (n.includes("td ") || n.startsWith("td ")) return "TD"
  if (n.includes("cibc")) return "CIBC"
  if (n.includes("rbc") || n.includes("royal bank")) return "RBC"
  if (n.includes("scotiabank") || n.includes("scotia")) return "Scotiabank"
  if (n.includes("bmo")) return "BMO"
  if (n.includes("american express") || n.includes("amex") || n.includes("simplycash") || n.includes("marriott bonvoy")) return "American Express"
  if (n.includes("national bank")) return "National Bank"
  if (n.includes("tangerine")) return "Tangerine"
  if (n.includes("desjardins")) return "Desjardins"
  if (n.includes("pc ") || n.includes("pc mastercard") || n.includes("pc world")) return "PC Financial"
  if (n.includes("simplii")) return "Simplii Financial"
  if (n.includes("rogers")) return "Rogers"
  if (n.includes("mbna")) return "MBNA"
  if (n.includes("home trust")) return "Home Trust"
  if (n.includes("canadian tire") || n.includes("triangle")) return "Canadian Tire"
  if (n.includes("costco")) return "Costco"
  return "Unknown"
}

function networkFromCardName(name: string): string {
  const n = name.toLowerCase()
  if (n.includes("mastercard")) return "MASTERCARD"
  if (n.includes("amex") || n.includes("american express") || n.includes("simplycash") || n.includes("marriott bonvoy")) return "AMEX"
  return "VISA"
}

interface RoadmapTimelineProps {
  roadmap: OptimalRoadmap
  goalName: string
}

export function RoadmapTimeline({ roadmap, goalName }: RoadmapTimelineProps) {
  const { steps, efficiency, goalAchieved, totalPointsEarned } = roadmap
  const timelineNodes = steps.filter(step => step.action === 'APPLY' || step.action === 'USE')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Summary Card */}
      <Card className="glass-premium border-primary/20 glow-teal">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-gradient">Your Optimized Route</CardTitle>
              <CardDescription className="text-lg mt-3 text-gray-400">
                {goalAchieved ? (
                  <span className="text-primary font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Goal achieved in {efficiency.monthsToGoal} months!
                  </span>
                ) : (
                  <span>Strategy to reach {goalName}</span>
                )}
              </CardDescription>
            </div>
            {goalAchieved && (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center glow-teal">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Total Points</p>
              <p className="text-2xl sm:text-3xl font-bold text-gradient-teal">{Math.round(totalPointsEarned).toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Time to Goal</p>
              <p className="text-2xl sm:text-3xl font-bold">{efficiency.monthsToGoal} <span className="text-lg text-gray-500">mo</span></p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Efficiency</p>
              <p className="text-3xl font-bold text-primary">{efficiency.pointsPerDollar.toFixed(2)}x</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Total Spend</p>
              <p className="text-2xl sm:text-3xl font-bold">${efficiency.totalSpend.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical glowing line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-cyan-500 to-primary/20" 
             style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)' }} />

        {/* Timeline nodes */}
        <div className="space-y-8">
          {timelineNodes.map((step, index) => {
            const isCompleted = step.projectedGoalCompletion >= 100
            const isApplication = step.action === 'APPLY'
            
            return (
              <div key={index} className="relative pl-14 sm:pl-20 animate-in fade-in slide-in-from-left duration-500" 
                   style={{ animationDelay: `${index * 100}ms` }}>
                {/* Glowing dot */}
                <div className="absolute left-0 top-0">
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center relative
                    ${isCompleted ? 'bg-primary/20 glow-teal-strong' : 'bg-primary/10 glow-teal'}
                  `}>
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" 
                         style={{ animationDuration: '3s' }} />
                    {isCompleted ? (
                      <CheckCircle2 className="h-8 w-8 text-primary relative z-10" />
                    ) : (
                      <Circle className="h-8 w-8 text-primary relative z-10" />
                    )}
                  </div>
                </div>

                {/* Content Card */}
                <Card className="glass-premium border-white/[0.08] hover:border-primary/30 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary">
                        Month {step.month}
                      </Badge>
                      {isApplication && (
                        <Badge className="text-xs bg-gradient-to-r from-primary to-cyan-400 text-background border-0">
                          <Sparkles className="h-3 w-3 mr-1" />
                          New Card
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-start gap-4">
                      <CardImage
                        name={step.cardName}
                        bank={step.cardBank || bankFromCardName(step.cardName)}
                        network={step.cardNetwork || networkFromCardName(step.cardName)}
                        imageUrl={step.cardImageUrl}
                        className="w-20 h-12 rounded-lg flex-shrink-0"
                      />
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-xl mb-1">{step.cardName}</h4>
                        <p className="text-sm text-gray-400">
                          {isApplication ? 'Apply for this card' : 'Active card'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {!isApplication && step.categoryAllocations.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-300">Your Strategy:</p>
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-sm leading-relaxed">
                            Route all{' '}
                            <span className="text-primary font-semibold">
                              {step.categoryAllocations.filter(cat => cat.amount > 0).map(cat => cat.category).join(' & ')}
                            </span>
                            {' '}spend here to maximize points
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {step.categoryAllocations.map((cat, catIndex) => (
                            cat.amount > 0 && (
                              <div key={catIndex} className="text-xs bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.05]">
                                <span className="text-gray-400 capitalize">{cat.category}:</span>
                                <span className="ml-2 font-semibold text-primary">${cat.amount} × {cat.multiplier}x</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {step.bonusProgress && (
                      <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-cyan-500/5 border border-primary/20">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300 font-medium">Signup Bonus Progress</span>
                          <span className="font-bold text-primary">
                            ${step.bonusProgress.currentSpend.toLocaleString()} / ${step.bonusProgress.requiredSpend.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={(step.bonusProgress.currentSpend / step.bonusProgress.requiredSpend) * 100} className="h-2" />
                        {step.bonusProgress.bonusEarned && (
                          <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                            <TrendingUp className="h-4 w-4" />
                            <span>Bonus unlocked: +{step.bonusProgress.bonusPoints.toLocaleString()} points!</span>
                          </div>
                        )}
                      </div>
                    )}

                    {!isApplication && (
                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                        <span className="text-sm text-gray-400">Points This Month</span>
                        <span className="text-2xl font-bold text-gradient-teal">+{Math.round(step.monthlyPointsEarned).toLocaleString()}</span>
                      </div>
                    )}

                    <div className="space-y-3 pt-3 border-t border-white/[0.05]">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Total Progress to Goal</span>
                        <span className="font-semibold">
                          {Math.round(step.cumulativePoints).toLocaleString()} points 
                          <span className="text-primary ml-2">({step.projectedGoalCompletion.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <Progress value={step.projectedGoalCompletion} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      {/* Auto-tracking section removed — feature not yet active */}
    </div>
  )
}
