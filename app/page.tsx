"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { SpendingForm, type SpendingFormData } from "@/components/spending-form"
import { RoadmapTimeline } from "@/components/roadmap-timeline-premium"
import { RouteEngine } from "@/lib/services/routeEngine"
import type { OptimalRoadmap, CardWithDetails } from "@/lib/types/spending"
import { Sparkles, AlertCircle, RefreshCw, Save, Check, CreditCard, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SignInButton, useUser } from '@clerk/nextjs'
import { saveUserStrategy } from '@/app/actions/strategy.actions'
import { usePostHog } from 'posthog-js/react'
import { Badge } from '@/components/ui/badge'
import { StructuredDataHomepage } from '@/components/structured-data-homepage'

export default function Home() {
  const [roadmap, setRoadmap] = useState<OptimalRoadmap | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [goalName, setGoalName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [recommendedCard, setRecommendedCard] = useState<any>(null)
  const { isSignedIn } = useUser()
  const posthog = usePostHog()

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
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          <div className="flex flex-col lg:space-y-6">
            <div className="flex justify-center lg:justify-start mb-4">
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 px-4 py-1.5 text-sm font-semibold hover:bg-cyan-500/20">
                ✦ 100% Free for All Canadians
              </Badge>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-center lg:text-left mb-4 lg:mb-0">
              <span className="text-white">Make Smarter</span>
              <br />
              <span className="text-cyan-500">Credit Card Decisions</span>
            </h1>
            
            <div className="relative w-full max-w-lg mx-auto lg:max-w-none mt-4 mb-4 flex justify-center lg:hidden">
              <Image 
                src="/images/hero.png" 
                alt="CreditRich Platform" 
                width={700} 
                height={500} 
                className="w-full h-auto object-contain drop-shadow-2xl mix-blend-screen" 
                priority 
              />
            </div>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 font-light leading-relaxed max-w-xl mx-auto lg:mx-0 text-center lg:text-left mb-4 lg:mb-0">
              Compare 38+ Canadian credit cards, find the best match for your spending, and build a personalized rewards strategy. All free, no sign-up required to try.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start mb-4 lg:mb-0">
              <Button 
                size="lg"
                className="h-14 px-8 text-base bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all font-semibold"
                asChild
              >
                <Link href="/sign-up">
                  Get Started — It's Free
                </Link>
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-white"
                asChild
              >
                <Link href="#calculator">
                  Try Calculator
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-400 justify-center lg:justify-start">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="font-medium">Free • No credit card required</span>
            </div>
          </div>

          <div className="hidden lg:flex relative w-full max-w-lg mx-auto lg:max-w-none justify-center">
            <Image 
              src="/images/hero.png" 
              alt="CreditRich Platform" 
              width={700} 
              height={500} 
              className="w-full h-auto object-contain drop-shadow-2xl mix-blend-screen" 
              priority 
            />
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 mt-8">
          <p className="text-center text-xs text-gray-500 mb-4 uppercase tracking-wider">Supported Networks & Issuers</p>
          <div className="flex flex-wrap justify-center items-center gap-8 px-4">
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-400">VISA</span>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center">
                <span className="text-xs font-bold text-red-400">MC</span>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400/20 to-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-300">AMEX</span>
              </div>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
              <span className="text-sm font-semibold text-gray-400">TD</span>
              <span className="text-sm font-semibold text-gray-400">RBC</span>
              <span className="text-sm font-semibold text-gray-400">CIBC</span>
              <span className="text-sm font-semibold text-gray-400">Scotiabank</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5" />

      {/* Calculator Section */}
      <div className="container mx-auto px-4 py-16 sm:py-20">
        <div id="calculator" className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              <span className="text-white">Try the </span>
              <span className="text-cyan-500">Calculator</span>
            </h2>
            <p className="text-lg text-gray-400">
              Enter your monthly spending to see personalized card recommendations
            </p>
          </div>

          {!roadmap ? (
            <div className="space-y-6">
              <SpendingForm onSubmit={handleGenerateRoute} isLoading={isLoading} />
              
              {isLoading && (
                <div className="glass-premium p-12 text-center space-y-6 glow-teal">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 relative">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    <Sparkles className="h-10 w-10 text-primary animate-pulse relative z-10" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gradient-teal">Analyzing Your Profile...</h3>
                  <p className="text-gray-400 font-light">
                    Comparing 38+ cards to find your best match
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
          ) : roadmap.status === 'no_cards_found' ? (
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
          ) : roadmap.status === 'insufficient_spending' ? (
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
          ) : (
            <div id="results-section" className="space-y-6">
              {recommendedCard && (
                <Card className="glass-premium border-primary/30 glow-teal">
                  <CardHeader>
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
                    <div className="flex items-start gap-6">
                      <div className="w-32 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/30 flex items-center justify-center flex-shrink-0 glow-teal">
                        <CreditCard className="h-10 w-10 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2">{recommendedCard.name}</h3>
                        <p className="text-gray-400 mb-4">{recommendedCard.bank} • {recommendedCard.network}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">First Year Value</p>
                            <p className="text-2xl font-bold text-primary">${recommendedCard.netValue.toFixed(0)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Annual Fee</p>
                            <p className="text-2xl font-bold">${recommendedCard.annualFee}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Welcome Bonus</p>
                            <p className="text-2xl font-bold text-primary">${recommendedCard.welcomeBonusValue}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">{recommendedCard.monthsToGoal && recommendedCard.monthsToGoal < 999 ? 'Months to Goal' : 'Category Earnings'}</p>
                            <p className="text-2xl font-bold">{recommendedCard.monthsToGoal && recommendedCard.monthsToGoal < 999 ? `${recommendedCard.monthsToGoal} mo` : `$${recommendedCard.categoryEarnings.toFixed(0)}`}</p>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6">
                          <p className="text-sm font-semibold text-gray-300 mb-3">Earning Rates:</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-xs bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.05]">
                              <span className="text-gray-400">Grocery:</span>
                              <span className="ml-2 font-semibold text-primary">{(recommendedCard.groceryMultiplier * 100).toFixed(0)}%</span>
                            </div>
                            <div className="text-xs bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.05]">
                              <span className="text-gray-400">Gas:</span>
                              <span className="ml-2 font-semibold text-primary">{(recommendedCard.gasMultiplier * 100).toFixed(0)}%</span>
                            </div>
                            <div className="text-xs bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.05]">
                              <span className="text-gray-400">Dining:</span>
                              <span className="ml-2 font-semibold text-primary">{(recommendedCard.diningMultiplier * 100).toFixed(0)}%</span>
                            </div>
                            <div className="text-xs bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.05]">
                              <span className="text-gray-400">Bills:</span>
                              <span className="ml-2 font-semibold text-primary">{(recommendedCard.billsMultiplier * 100).toFixed(0)}%</span>
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
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                                  <div>
                                    <span className="text-sm font-medium">{rec.card.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">{rec.card.bank}</span>
                                  </div>
                                  <div className="text-right">
                                    {rec.monthsToGoal && rec.monthsToGoal < 999 ? (
                                      <span className="text-sm font-bold text-primary">{rec.monthsToGoal} mo</span>
                                    ) : (
                                      <span className="text-sm font-bold text-primary">${(rec.scores.expectedYearlyValue / 100).toFixed(0)}</span>
                                    )}
                                    <span className="text-xs text-gray-500 ml-1">{rec.monthsToGoal && rec.monthsToGoal < 999 ? 'to goal' : 'value'}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button 
                          size="lg"
                          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-background shadow-xl shadow-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/40 hover:scale-105"
                          asChild
                        >
                          <a href={recommendedCard.applyLink} target="_blank" rel="noopener noreferrer">
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
              
              <RoadmapTimeline roadmap={roadmap} goalName={goalName} />

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
          )}
        </div>
      </div>

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
            <h3 className="text-lg font-semibold text-white">Enter Spending</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Share your monthly spending across key categories
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-xl font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              2
            </div>
            <h3 className="text-lg font-semibold text-white">Get Matched</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Our engine compares cards based on your profile
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-xl font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              3
            </div>
            <h3 className="text-lg font-semibold text-white">Review Strategy</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              See your personalized roadmap and estimated value
            </p>
          </div>
        </div>
      </div>
      )}

      {/* Features Section */}
      {!roadmap && (
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="text-white">Why </span>
            <span className="text-cyan-500">CreditRich</span>
          </h2>
          <p className="text-base text-gray-400 max-w-2xl mx-auto">
            Built for Canadian rewards optimizers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-xl p-6 hover:border-cyan-500/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center mb-3">
                <RefreshCw className="h-5 w-5 text-cyan-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Regularly Updated</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                We track sign-up bonuses and earning rates across major Canadian issuers
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-xl p-6 hover:border-cyan-500/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center mb-3">
                <Check className="h-5 w-5 text-cyan-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Affiliate Bias</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Recommendations prioritize your value, not bank commissions
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-xl p-6 hover:border-cyan-500/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center mb-3">
                <AlertCircle className="h-5 w-5 text-cyan-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Privacy First</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your data is encrypted and never sold to third parties
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-xl p-6 hover:border-cyan-500/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center mb-3">
                <Sparkles className="h-5 w-5 text-cyan-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Progress Tracking</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Save strategies and get reminders when it's time to apply
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
            <div className="text-center mb-8">
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 px-4 py-1.5 text-sm font-semibold mb-6 hover:bg-cyan-500/20">
                100% Free
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-gradient">Free for Every Canadian</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                All features, no paywalls. CreditRich is community-supported through optional donations.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <Card className="glass-premium border-primary/30 glow-teal">
                <CardContent className="p-8 text-center space-y-4">
                  <Sparkles className="h-10 w-10 text-primary mx-auto" />
                  <h3 className="text-xl font-bold">Everything included, always</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm text-left max-w-md mx-auto">
                    {['Card recommendations', 'Unlimited strategies', 'Card comparisons', 'Portfolio tracking', 'Spending optimization', 'Bank connection (beta)'].map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-gray-400">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full h-12 bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-[#090A0F] font-semibold"
                    asChild
                  >
                    <Link href="/sign-up">
                      Get Started — It's Free
                    </Link>
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
              <span className="text-white">Security & </span>
              <span className="text-cyan-500">Privacy</span>
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">
              Industry-standard encryption and privacy practices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card className="glass-premium border-primary/20">
              <CardContent className="p-5 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold">Encrypted Data</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  AES-256 encryption for financial information
                </p>
              </CardContent>
            </Card>

            <Card className="glass-premium border-primary/20">
              <CardContent className="p-5 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold">Secure Connections</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Plaid integration, credentials never stored
                </p>
              </CardContent>
            </Card>

            <Card className="glass-premium border-primary/20">
              <CardContent className="p-5 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <X className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold">No Data Selling</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your information stays private
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Final CTA - removed, already have CTA in Community-Supported section */}
    </div>
  )
}
