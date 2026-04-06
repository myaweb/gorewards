"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { RoadmapTimeline } from "@/components/roadmap-timeline-premium"
import { RouteEngine } from "@/lib/services/routeEngine"
import type { OptimalRoadmap, CardWithDetails } from "@/lib/types/spending"
import { Sparkles, AlertCircle, RefreshCw, Save, Check, X } from "lucide-react"
import { CardImage } from "@/components/card-image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SignInButton, useUser } from '@clerk/nextjs'
import { saveUserStrategy } from '@/app/actions/strategy.actions'
import { usePostHog } from 'posthog-js/react'
import { Badge } from '@/components/ui/badge'
import { StructuredDataHomepage } from '@/components/structured-data-homepage'
import { BlogPostsClient } from "@/components/blog-posts-client"
import { FeaturedCards } from "@/components/featured-cards"
import { HeroCalculator } from "@/components/hero-calculator"
import type { SpendingFormData } from "@/components/spending-form"

export default function Home() {
  const [roadmap, setRoadmap] = useState<OptimalRoadmap | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [goalName, setGoalName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [recommendedCard, setRecommendedCard] = useState<any>(null)
  const { isSignedIn } = useUser()
  const posthog = usePostHog()

  // Reset when logo/home link is clicked while already on home page
  useEffect(() => {
    const handler = () => {
      setRoadmap(null)
      setRecommendedCard(null)
    }
    window.addEventListener('reset-home', handler)
    return () => window.removeEventListener('reset-home', handler)
  }, [])

  const handleSaveStrategy = async () => {
    if (!roadmap || roadmap.status !== 'success') return

    setIsSaving(true)
    setSaveSuccess(false)

    try {
      const result = await saveUserStrategy(roadmap, goalName)

      if (result.success) {
        setSaveSuccess(true)
        
        posthog?.capture('strategy_saved', {
          goal_name: goalName,
          total_months: roadmap.totalMonths,
          total_points: roadmap.totalPointsEarned,
          goal_achieved: roadmap.goalAchieved,
        })

        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        alert(result.error || 'Failed to save strategy')
      }
    } catch (error) {
      console.error('Error saving strategy:', error)
      alert('Failed to save strategy')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateRoute = async (formData: SpendingFormData) => {
    setIsLoading(true)
    setGoalName(formData.goalName)

    setTimeout(() => {
      document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)

    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      // Use enhanced recommendation engine with point valuations and approval scoring
      const enhancedResponse = await fetch('/api/recommend/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spending: {
            grocery: formData.grocery,
            gas: formData.gas,
            dining: formData.dining,
            bills: formData.bills,
          },
          creditScore: 'GOOD',
          preferredPointTypes: [formData.pointType],
          prioritizeSignupBonus: true,
          timeHorizon: 'LONG_TERM',
          goal: {
            name: formData.goalName,
            requiredPoints: formData.requiredPoints,
            pointType: formData.pointType,
          },
        }),
      })

      if (!enhancedResponse.ok) {
        throw new Error('Failed to get recommendations')
      }

      const enhancedData = await enhancedResponse.json()

      if (enhancedData.success && enhancedData.data.recommendations.length > 0) {
        const topRec = enhancedData.data.recommendations[0]
        // Map enhanced response to the format the UI expects
        setRecommendedCard({
          name: topRec.card.name,
          bank: topRec.card.bank,
          network: topRec.card.network,
          annualFee: topRec.card.annualFee,
          imageUrl: topRec.card.imageUrl,
          affiliateLink: topRec.card.affiliateLink,
          slug: topRec.card.slug,
          netValue: topRec.scores.expectedYearlyValue / 100,
          categoryEarnings: topRec.scores.yearlySpendRewards / 100,
          welcomeBonusValue: topRec.scores.signupBonusValue / 100,
          groceryMultiplier: topRec.breakdown.categoryRewards.find((r: any) => r.category === 'grocery')?.multiplier || 0.01,
          gasMultiplier: topRec.breakdown.categoryRewards.find((r: any) => r.category === 'gas')?.multiplier || 0.01,
          diningMultiplier: topRec.breakdown.categoryRewards.find((r: any) => r.category === 'dining')?.multiplier || 0.01,
          billsMultiplier: topRec.breakdown.categoryRewards.find((r: any) => r.category === 'bills')?.multiplier || 0.01,
          applyLink: topRec.card.affiliateLink || '#',
          approvalProbability: topRec.scores.approvalProbability,
          confidence: topRec.confidence,
          monthsToGoal: topRec.monthsToGoal,
          explanation: topRec.explanation,
          allRecommendations: enhancedData.data.recommendations,
        })
      }

      posthog?.capture('recommendation_completed', {
        engine: 'enhanced',
        top_card: enhancedData.data?.recommendations?.[0]?.card?.name,
        total_recommendations: enhancedData.data?.recommendations?.length,
        spending_profile: {
          grocery: formData.grocery,
          gas: formData.gas,
          dining: formData.dining,
          bills: formData.bills
        }
      })

      const spendingProfile = {
        grocery: formData.grocery,
        gas: formData.gas,
        dining: formData.dining,
        recurring: formData.bills,
      }

      const goal = {
        id: formData.goalId,
        name: formData.goalName,
        requiredPoints: formData.requiredPoints,
        pointType: formData.pointType,
      }

      let availableCards: CardWithDetails[] = []
      try {
        const response = await fetch(`/api/cards?pointType=${formData.pointType}`)
        const data = await response.json()
        
        if (data.success && data.data) {
          // Sort cards by enhanced engine's recommendation order
          const enhancedOrder = enhancedData?.data?.recommendations?.map((r: any) => r.card.id) || []
          const allCards = data.data as CardWithDetails[]
          
          // Put enhanced-recommended cards first, in order
          const ordered: CardWithDetails[] = []
          for (const id of enhancedOrder) {
            const card = allCards.find((c: CardWithDetails) => c.id === id)
            if (card) ordered.push(card)
          }
          // Add remaining cards that weren't in enhanced results
          for (const card of allCards) {
            if (!enhancedOrder.includes(card.id)) ordered.push(card)
          }
          
          availableCards = ordered
        } else {
          console.warn('API returned no cards:', data)
          availableCards = []
        }
      } catch (dbError) {
        console.warn('API fetch failed:', dbError)
        availableCards = []
      }

      const result = RouteEngine.calculateOptimalRoadmap(
        spendingProfile,
        goal,
        availableCards,
        true // Cards are pre-ranked by enhanced engine
      )

      setRoadmap(result)

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } catch (error) {
      console.error("Error generating roadmap:", error)
      setRoadmap({
        status: 'no_cards_found',
        steps: [],
        totalMonths: 0,
        totalPointsEarned: 0,
        goalAchieved: false,
        efficiency: {
          pointsPerDollar: 0,
          monthsToGoal: 0,
          totalSpend: 0,
        },
        errorMessage: 'An unexpected error occurred while fetching card data',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-12 relative bg-[#0A0B0F]">
      <StructuredDataHomepage />
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[2px] bg-cyan-500/20 rounded-full blur-[8px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[min(400px,80vw)] h-[min(400px,80vw)] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Hero Section — hidden when results are shown */}
      {!roadmap && (
      <div className="relative overflow-hidden">
        {/* Background image */}
        <img src="/images/heroback.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0B0F]/60 via-[#0A0B0F]/40 to-[#0A0B0F] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(6,182,212,0.08),transparent)] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10">
          <div className="text-center mb-8">
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 px-4 py-1.5 text-sm font-semibold hover:bg-cyan-500/20 mb-5 inline-flex">
              ✦ 100% Free for All Canadians
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-4">
              <span className="text-white">Your Personal </span>
              <span className="text-cyan-500">Rewards Engine</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 font-light leading-relaxed max-w-2xl mx-auto">
              Most tools tell you which card is "best." GoRewards goes further — it analyzes your real spending and builds a personalized strategy, so every purchase earns maximum rewards.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <HeroCalculator onSubmit={handleGenerateRoute} isLoading={isLoading} />
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mt-5">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" />38+ Canadian cards</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" />No sign-up to try</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" />Free forever</span>
          </div>
        </div>

        {/* Bottom oval curve */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 32" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-8 block">
            <path d="M0,32 C360,0 1080,0 1440,32 L1440,32 L0,32 Z" fill="#0A0B0F" />
          </svg>
        </div>
      </div>
      )}

      {/* Results mode: New calculation button */}
      {roadmap && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex justify-end">
          <button
            onClick={() => { setRoadmap(null); setRecommendedCard(null) }}
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 border border-white/10 rounded-lg px-3 py-1.5 hover:border-white/20"
          >
            <RefreshCw className="h-3.5 w-3.5" /> New calculation
          </button>
        </div>
      )}

      {!roadmap && (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <FeaturedCards />
      </div>
      )}

      <div className="border-t border-white/5 mt-4" />

      {/* Results Section */}
      {roadmap && (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div id="results-section" className="max-w-4xl mx-auto">

          {roadmap && roadmap.status === 'no_cards_found' ? (
            <div className="space-y-6">
              <Card className="glass-premium border-yellow-500/30 glow-teal">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">Database Update in Progress</CardTitle>
                      <CardDescription className="text-base">
                        We are currently updating our database for{" "}
                        <span className="text-primary font-semibold">
                          {roadmap.missingPointType?.replace(/_/g, " ")}
                        </span>{" "}
                        cards.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="glass p-6 rounded-xl space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 text-primary" />
                      What's Happening?
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Our team is actively scraping and updating credit card data from major Canadian banks. 
                      We're adding new cards, updating welcome bonuses, and refreshing earning rates to ensure 
                      you get the most accurate recommendations.
                    </p>
                  </div>

                  <div className="glass p-6 rounded-xl space-y-4">
                    <h4 className="font-semibold text-lg">What You Can Do:</h4>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary text-sm font-bold">1</span>
                        </div>
                        <span>Try a different reward program (Aeroplan, Scene+, or Membership Rewards)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary text-sm font-bold">2</span>
                        </div>
                        <span>Check back in 24-48 hours when our database update is complete</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary text-sm font-bold">3</span>
                        </div>
                        <span>Browse our comparison pages to see available cards</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      onClick={() => setRoadmap(null)}
                      className="flex-1 h-12 bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Different Goal
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 border-primary/50"
                      asChild
                    >
                      <a href="/compare/amex-cobalt-vs-td-aeroplan">
                        View Card Comparisons
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : roadmap?.status === 'insufficient_spending' ? (
            <div className="space-y-6">
              <Card className="glass-premium border-yellow-500/30">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">Spending Required</CardTitle>
                      <CardDescription className="text-base">
                        Please enter your monthly spending amounts to generate a personalized roadmap.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setRoadmap(null)}
                    className="w-full h-12 bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update Spending
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : roadmap ? (
            <div id="results-section" className="space-y-6">
              {recommendedCard && (
                <Card className="glass-premium border-primary/30 glow-teal">
                  <CardHeader className="sticky top-[80px] z-20 bg-[#0A0B10]/90 backdrop-blur-md rounded-t-xl border-b border-primary/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-3xl font-bold text-gradient mb-2">
                          Your Best Match
                        </CardTitle>
                        <CardDescription className="text-base">
                          Based on your spending profile, this card will maximize your rewards
                        </CardDescription>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center glow-teal">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="w-full sm:w-24 h-14 sm:h-16 flex-shrink-0">
                        <CardImage
                          name={recommendedCard.name}
                          bank={recommendedCard.bank}
                          network={recommendedCard.network}
                          imageUrl={recommendedCard.imageUrl}
                          className="w-full h-full rounded-lg"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl sm:text-2xl font-bold mb-1 leading-tight">{recommendedCard.name}</h3>
                        <p className="text-gray-400 text-sm mb-3">{recommendedCard.bank} • {recommendedCard.network}</p>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="bg-white/\[0.03\] rounded-lg p-2.5 border border-white/\[0.06\]">
                            <p className="text-\[10px\] text-gray-500 uppercase tracking-wider mb-0.5">1st Year Value</p>
                            <p className="text-lg font-bold text-primary">${recommendedCard.netValue.toFixed(0)}</p>
                          </div>
                          <div className="bg-white/\[0.03\] rounded-lg p-2.5 border border-white/\[0.06\]">
                            <p className="text-\[10px\] text-gray-500 uppercase tracking-wider mb-0.5">Annual Fee</p>
                            <p className="text-lg font-bold">${recommendedCard.annualFee}</p>
                          </div>
                          <div className="bg-white/\[0.03\] rounded-lg p-2.5 border border-white/\[0.06\]">
                            <p className="text-\[10px\] text-gray-500 uppercase tracking-wider mb-0.5">Welcome Bonus</p>
                            <p className="text-lg font-bold text-primary">${recommendedCard.welcomeBonusValue}</p>
                          </div>
                          <div className="bg-white/\[0.03\] rounded-lg p-2.5 border border-white/\[0.06\]">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">{recommendedCard.monthsToGoal && recommendedCard.monthsToGoal < 999 ? 'Months to Goal' : 'Category Earnings'}</p>
                            <p className="text-2xl font-bold">{recommendedCard.monthsToGoal && recommendedCard.monthsToGoal < 999 ? `${recommendedCard.monthsToGoal} mo` : `$${recommendedCard.categoryEarnings.toFixed(0)}`}</p>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6">
                          <p className="text-sm font-semibold text-gray-300 mb-3">Earning Rates:</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-xs bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.05]">
                              <span className="text-gray-400">Grocery:</span>
                              <span className="ml-2 font-semibold text-primary">{(recommendedCard.groceryMultiplier * 100).toFixed(0)}x</span>
                            </div>
                            <div className="text-xs bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.05]">
                              <span className="text-gray-400">Gas:</span>
                              <span className="ml-2 font-semibold text-primary">{(recommendedCard.gasMultiplier * 100).toFixed(0)}x</span>
                            </div>
                            <div className="text-xs bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.05]">
                              <span className="text-gray-400">Dining:</span>
                              <span className="ml-2 font-semibold text-primary">{(recommendedCard.diningMultiplier * 100).toFixed(0)}x</span>
                            </div>
                            <div className="text-xs bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.05]">
                              <span className="text-gray-400">Bills:</span>
                              <span className="ml-2 font-semibold text-primary">{(recommendedCard.billsMultiplier * 100).toFixed(0)}x</span>
                            </div>
                          </div>
                        </div>

                        {/* Approval Probability & Explanation (Enhanced) */}
                        {recommendedCard.approvalProbability && (
                          <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05] mb-6 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Approval Probability</span>
                              <span className={`text-lg font-bold ${recommendedCard.approvalProbability > 0.7 ? 'text-green-400' : recommendedCard.approvalProbability > 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {Math.round(recommendedCard.approvalProbability * 100)}%
                              </span>
                            </div>
                            {recommendedCard.explanation?.whyRecommended && (
                              <p className="text-sm text-gray-400 leading-relaxed">
                                {recommendedCard.explanation.whyRecommended}
                              </p>
                            )}
                            {recommendedCard.explanation?.pros?.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {recommendedCard.explanation.pros.slice(0, 3).map((pro: string, i: number) => (
                                  <span key={i} className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-3 py-1">
                                    {pro}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Other Recommendations */}
                        {recommendedCard.allRecommendations?.length > 1 && (
                          <div className="mb-6">
                            <p className="text-sm font-semibold text-gray-300 mb-3">Other Top Picks:</p>
                            <div className="space-y-2">
                              {recommendedCard.allRecommendations.slice(1, 4).map((rec: any, i: number) => (
                                <a
                                  key={i}
                                  href={`/cards/${rec.card.slug}`}
                                  className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.06] hover:border-primary/30 transition-all cursor-pointer group"
                                >
                                  <div className="flex items-center gap-3">
                                    <CardImage
                                      name={rec.card.name}
                                      bank={rec.card.bank}
                                      network={rec.card.network}
                                      imageUrl={rec.card.imageUrl}
                                      className="w-12 h-8 rounded-md flex-shrink-0"
                                    />
                                    <div>
                                      <span className="text-xs font-medium truncate block max-w-[140px] group-hover:text-primary transition-colors">{rec.card.name}</span>
                                      <span className="text-[10px] text-gray-500">{rec.card.bank}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {rec.monthsToGoal && rec.monthsToGoal < 999 ? (
                                      <span className="text-sm font-bold text-primary">{rec.monthsToGoal} mo</span>
                                    ) : (
                                      <span className="text-sm font-bold text-primary">${(rec.scores.expectedYearlyValue / 100).toFixed(0)}</span>
                                    )}
                                    <span className="text-xs text-gray-500 ml-1">{rec.monthsToGoal && rec.monthsToGoal < 999 ? 'to goal' : 'value'}</span>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button 
                          size="lg"
                          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-background shadow-xl shadow-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/40 hover:scale-105"
                          asChild
                        >
                          <a href={`/go/${recommendedCard.slug}`} target="_blank" rel="noopener noreferrer">
                            <Sparkles className="mr-2 h-5 w-5" />
                            Apply Now
                          </a>
                        </Button>
                        
                        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                          This recommendation is based on available card data and your inputs. Not financial advice. 
                          Review terms before applying.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Your Personalized Route</h2>
                  <p className="text-muted-foreground">Follow this strategy to reach your goal</p>
                </div>
                <button
                  onClick={() => setRoadmap(null)}
                  className="text-sm text-primary hover:underline"
                >
                  Start Over
                </button>
              </div>
              
              <RoadmapTimeline roadmap={roadmap!} goalName={goalName} />

              <Card className="glass-premium border-primary/20 glow-teal">
                <CardContent className="py-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Save className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Save This Strategy</h3>
                        <p className="text-sm text-muted-foreground">
                          Track your progress and get reminders in your dashboard
                        </p>
                      </div>
                    </div>

                    {isSignedIn ? (
                      <Button
                        onClick={handleSaveStrategy}
                        disabled={isSaving || saveSuccess}
                        className="h-12 px-6 bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 glow-teal min-w-[180px]"
                      >
                        {saveSuccess ? (
                          <>
                            <Check className="mr-2 h-5 w-5" />
                            Saved!
                          </>
                        ) : isSaving ? (
                          <>
                            <div className="mr-2 h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-5 w-5" />
                            Save to Dashboard
                          </>
                        )}
                      </Button>
                    ) : (
                      <SignInButton mode="modal">
                        <Button className="h-12 px-6 bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 glow-teal min-w-[180px]">
                          <Save className="mr-2 h-5 w-5" />
                          Sign In to Save
                        </Button>
                      </SignInButton>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
      )}

      <div className="border-t border-white/5" />

      {/* How It Works Section */}
      {!roadmap && (
      <div id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="text-white">How It </span>
            <span className="text-cyan-500">Works</span>
          </h2>
          <p className="text-base text-gray-400 max-w-2xl mx-auto">
            Three simple steps to find your optimal card strategy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-xl font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              1
            </div>
            <h3 className="text-lg font-semibold text-white">Tell us how you spend</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              We map your real monthly habits — groceries, gas, dining, travel, and more.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-xl font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              2
            </div>
            <h3 className="text-lg font-semibold text-white">We build your strategy</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Our engine analyzes every category and determines which card performs best — not overall, but per purchase.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-xl font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              3
            </div>
            <h3 className="text-lg font-semibold text-white">Use the right card, every time</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Get a clear, personalized plan showing exactly which card to use — so you maximize every reward.
            </p>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse flex-shrink-0" />
            <p className="text-sm font-medium text-cyan-400">
              Not just the best card. The best decision — every time you spend.
            </p>
          </div>
        </div>
      </div>
      )}

      {/* Final CTA - removed, already have CTA in Community-Supported section */}
      {!roadmap && (
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="text-white">Why </span>
            <span className="text-cyan-500">GoRewards</span>
          </h2>
          <p className="text-base text-gray-400 max-w-2xl mx-auto">
            Most platforms compare credit cards. GoRewards goes further.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-xl p-6 hover:border-cyan-500/30 transition-all h-full">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5 text-cyan-500" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Not just comparison.</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                It builds a personalized reward strategy based on how you actually spend — guiding you to use the right card at the right time.
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-xl p-6 hover:border-cyan-500/30 transition-all h-full">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center mb-4">
                <RefreshCw className="h-5 w-5 text-cyan-500" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Built for Canada.</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Designed specifically for the Canadian market — it understands local cards, reward programs, and category rules that generic tools miss.
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-xl p-6 hover:border-cyan-500/30 transition-all h-full">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center mb-4">
                <Check className="h-5 w-5 text-cyan-500" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Simple decisions.</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Turns complex reward systems into clear, actionable guidance. No guesswork. No missed rewards. Just smarter choices, every time.
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-xl p-6 hover:border-cyan-500/30 transition-all h-full">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center mb-4">
                <AlertCircle className="h-5 w-5 text-cyan-500" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">This is optimization.</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Choosing the "best" card isn't enough. What matters is using the right card for each purchase — and that's exactly what GoRewards does.
              </p>
            </div>
          </div>

        </div>
      </div>
      )}

      {/* Community-Supported Section */}
      <div id="pricing">
        {!roadmap && (
          <div className="container mx-auto px-4 py-16 border-t border-white/5">
            <div className="max-w-2xl mx-auto">

              {/* Header — outside card */}
              <div className="text-center mb-6 space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  Maximize your rewards.<br />
                  <span className="text-cyan-500">Not your effort.</span>
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  GoRewards tells you exactly which card to use for every purchase — so you never miss out on rewards.
                </p>
              </div>

              <Card className="glass-premium border-primary/30 glow-teal">
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'Know exactly which card to use, every time',
                      'Turn your spending into a reward strategy',
                      'Optimize every category automatically',
                      'Track and improve your rewards over time',
                    ].map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm leading-snug">{f}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full h-12 bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-[#090A0F] font-semibold"
                    asChild
                  >
                    <Link href="/sign-up">Get Started — It's Free</Link>
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>
        )}
      </div>

      {/* Security & Privacy Section */}
      {!roadmap && (
        <div id="security" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/5">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Security you don't have to <span className="text-cyan-500">think about</span>
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">
              Your financial data stays protected, private, and under your control — always.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card className="glass-premium border-primary/20">
              <CardContent className="p-5 space-y-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-white">Bank-level encryption</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your financial data is protected using industry-standard AES-256 encryption at all times.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-premium border-primary/20">
              <CardContent className="p-5 space-y-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-white">Secure connections only</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We use trusted integrations like Plaid. Your banking credentials are never stored on our servers.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-premium border-cyan-500/30 bg-cyan-500/[0.03]">
              <CardContent className="p-5 space-y-2">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                  <X className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="text-base font-semibold text-white">We don't sell your data. <span className="text-cyan-400">Period.</span></h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your information is never shared or sold — not to advertisers, not to third parties.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Final CTA - removed, already have CTA in Community-Supported section */}

      {!roadmap && <BlogPostsClient />}
    </div>
  )
}



