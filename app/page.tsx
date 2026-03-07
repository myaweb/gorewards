"use client"

import { useState } from "react"
import { SpendingForm, type SpendingFormData } from "@/components/spending-form"
import { RoadmapTimeline } from "@/components/roadmap-timeline"
import { RouteEngine } from "@/lib/services/routeEngine"
import type { OptimalRoadmap, CardWithDetails } from "@/lib/types/spending"
import { Sparkles } from "lucide-react"

// Mock card data for demonstration
const MOCK_CARDS: CardWithDetails[] = [
  {
    id: "card-1",
    name: "TD Aeroplan Visa Infinite",
    bank: "TD",
    network: "VISA",
    annualFee: 139,
    bonuses: [
      {
        id: "bonus-1",
        bonusPoints: 50000,
        pointType: "AEROPLAN",
        minimumSpendAmount: 3000,
        spendPeriodMonths: 3,
      },
    ],
    multipliers: [
      { id: "m1", category: "GROCERY", multiplierValue: 3 },
      { id: "m2", category: "GAS", multiplierValue: 2 },
      { id: "m3", category: "DINING", multiplierValue: 2 },
      { id: "m4", category: "RECURRING", multiplierValue: 1.5 },
    ],
  },
  {
    id: "card-2",
    name: "CIBC Aeroplan Visa",
    bank: "CIBC",
    network: "VISA",
    annualFee: 0,
    bonuses: [
      {
        id: "bonus-2",
        bonusPoints: 20000,
        pointType: "AEROPLAN",
        minimumSpendAmount: 1500,
        spendPeriodMonths: 3,
      },
    ],
    multipliers: [
      { id: "m5", category: "GROCERY", multiplierValue: 2 },
      { id: "m6", category: "GAS", multiplierValue: 1.5 },
      { id: "m7", category: "DINING", multiplierValue: 1.5 },
      { id: "m8", category: "RECURRING", multiplierValue: 1 },
    ],
  },
  {
    id: "card-3",
    name: "Amex Cobalt",
    bank: "American Express",
    network: "AMEX",
    annualFee: 156,
    bonuses: [
      {
        id: "bonus-3",
        bonusPoints: 30000,
        pointType: "MEMBERSHIP_REWARDS",
        minimumSpendAmount: 3000,
        spendPeriodMonths: 3,
      },
    ],
    multipliers: [
      { id: "m9", category: "GROCERY", multiplierValue: 5 },
      { id: "m10", category: "GAS", multiplierValue: 2 },
      { id: "m11", category: "DINING", multiplierValue: 5 },
      { id: "m12", category: "RECURRING", multiplierValue: 1 },
    ],
  },
  {
    id: "card-4",
    name: "Scotiabank Passport Visa Infinite",
    bank: "Scotiabank",
    network: "VISA",
    annualFee: 139,
    bonuses: [
      {
        id: "bonus-4",
        bonusPoints: 40000,
        pointType: "SCENE_PLUS",
        minimumSpendAmount: 4000,
        spendPeriodMonths: 4,
      },
    ],
    multipliers: [
      { id: "m13", category: "GROCERY", multiplierValue: 2 },
      { id: "m14", category: "GAS", multiplierValue: 2 },
      { id: "m15", category: "DINING", multiplierValue: 3 },
      { id: "m16", category: "RECURRING", multiplierValue: 1 },
    ],
  },
]

export default function Home() {
  const [roadmap, setRoadmap] = useState<OptimalRoadmap | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [goalName, setGoalName] = useState("")

  const handleGenerateRoute = async (formData: SpendingFormData) => {
    setIsLoading(true)
    setGoalName(formData.goalName)

    // Simulate API delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      // Prepare spending profile
      const spendingProfile = {
        grocery: formData.grocery,
        gas: formData.gas,
        dining: formData.dining,
        recurring: formData.bills,
      }

      // Prepare goal
      const goal = {
        id: formData.goalId,
        name: formData.goalName,
        requiredPoints: formData.requiredPoints,
        pointType: formData.pointType,
      }

      // Filter cards by point type
      const eligibleCards = MOCK_CARDS.filter(card =>
        card.bonuses.some(bonus => bonus.pointType === formData.pointType)
      )

      // Calculate optimal roadmap
      const result = RouteEngine.calculateOptimalRoadmap(
        spendingProfile,
        goal,
        eligibleCards
      )

      setRoadmap(result)
    } catch (error) {
      console.error("Error generating roadmap:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-8 pb-12">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Optimization</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="text-gradient">Maximize Your Rewards</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Get a personalized credit card strategy to reach your goals faster
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {!roadmap ? (
            /* Step 1 & 2: Input Form */
            <div className="space-y-6">
              <SpendingForm onSubmit={handleGenerateRoute} isLoading={isLoading} />
              
              {isLoading && (
                <div className="glass-card p-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                    <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold">Analyzing 50+ Cards...</h3>
                  <p className="text-muted-foreground">
                    Our AI is calculating the optimal strategy for your spending profile
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Step 3: Results Timeline */
            <div className="space-y-6">
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

