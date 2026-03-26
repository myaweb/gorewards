"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, ShoppingCart, Fuel, UtensilsCrossed, Smartphone, Target } from "lucide-react"

export interface SpendingFormData {
  grocery: number
  gas: number
  dining: number
  bills: number
  goalId: string
  goalName: string
  requiredPoints: number
  pointType: string
}

interface SpendingFormProps {
  onSubmit: (data: SpendingFormData) => void
  isLoading: boolean
}

const GOALS = [
  { id: "tokyo-flight", name: "Tokyo Flight", points: 75000, type: "AEROPLAN" },
  { id: "europe-flight", name: "Europe Flight", points: 60000, type: "AEROPLAN" },
  { id: "caribbean-flight", name: "Caribbean Flight", points: 35000, type: "AEROPLAN" },
  { id: "hotel-stay", name: "Luxury Hotel Stay", points: 50000, type: "MARRIOTT_BONVOY" },
  { id: "cashback-goal", name: "$1,000 Cashback", points: 100000, type: "CASHBACK" },
]

export function SpendingForm({ onSubmit, isLoading }: SpendingFormProps) {
  const [grocery, setGrocery] = useState(1200)
  const [gas, setGas] = useState(300)
  const [dining, setDining] = useState(600)
  const [bills, setBills] = useState(500)
  const [selectedGoal, setSelectedGoal] = useState(GOALS[0].id)

  const totalSpending = grocery + gas + dining + bills

  const handleSubmit = () => {
    const goal = GOALS.find(g => g.id === selectedGoal) || GOALS[0]
    
    onSubmit({
      grocery,
      gas,
      dining,
      bills,
      goalId: goal.id,
      goalName: goal.name,
      requiredPoints: goal.points,
      pointType: goal.type,
    })
  }

  return (
    <Card className="glass-premium glow-teal">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Your Monthly Spending</CardTitle>
        <CardDescription className="text-base text-gray-400">
          Adjust your spending categories to optimize your rewards strategy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Spending Sliders */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="grocery" className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                Grocery
              </Label>
              <div className="flex items-center gap-1">
                <div className="flex items-center text-primary font-semibold bg-transparent border-b border-transparent focus-within:border-primary/50 transition-colors px-1">
                  <span className="text-lg">$</span>
                  <input
                    type="number"
                    value={grocery}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0)
                      setGrocery(val)
                    }}
                    className="w-20 text-lg bg-transparent outline-none text-right"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => setGrocery(grocery + 50)}
                    disabled={isLoading}
                    className="h-3 w-5 flex items-center justify-center rounded-sm bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrocery(Math.max(0, grocery - 50))}
                    disabled={isLoading}
                    className="h-3 w-5 flex items-center justify-center rounded-sm bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <Slider
              id="grocery"
              value={[Math.min(grocery, 3000)]}
              onValueChange={(value) => setGrocery(value[0])}
              max={3000}
              step={50}
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="gas" className="text-base flex items-center gap-2">
                <Fuel className="h-4 w-4 text-primary" />
                Gas
              </Label>
              <div className="flex items-center gap-1">
                <div className="flex items-center text-primary font-semibold bg-transparent border-b border-transparent focus-within:border-primary/50 transition-colors px-1">
                  <span className="text-lg">$</span>
                  <input
                    type="number"
                    value={gas}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0)
                      setGas(val)
                    }}
                    className="w-20 text-lg bg-transparent outline-none text-right"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => setGas(gas + 25)}
                    disabled={isLoading}
                    className="h-3 w-5 flex items-center justify-center rounded-sm bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGas(Math.max(0, gas - 25))}
                    disabled={isLoading}
                    className="h-3 w-5 flex items-center justify-center rounded-sm bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <Slider
              id="gas"
              value={[Math.min(gas, 1000)]}
              onValueChange={(value) => setGas(value[0])}
              max={1000}
              step={25}
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="dining" className="text-base flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-primary" />
                Dining
              </Label>
              <div className="flex items-center gap-1">
                <div className="flex items-center text-primary font-semibold bg-transparent border-b border-transparent focus-within:border-primary/50 transition-colors px-1">
                  <span className="text-lg">$</span>
                  <input
                    type="number"
                    value={dining}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0)
                      setDining(val)
                    }}
                    className="w-20 text-lg bg-transparent outline-none text-right"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => setDining(dining + 50)}
                    disabled={isLoading}
                    className="h-3 w-5 flex items-center justify-center rounded-sm bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDining(Math.max(0, dining - 50))}
                    disabled={isLoading}
                    className="h-3 w-5 flex items-center justify-center rounded-sm bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <Slider
              id="dining"
              value={[Math.min(dining, 2000)]}
              onValueChange={(value) => setDining(value[0])}
              max={2000}
              step={50}
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="bills" className="text-base flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" />
                Recurring Bills
              </Label>
              <div className="flex items-center gap-1">
                <div className="flex items-center text-primary font-semibold bg-transparent border-b border-transparent focus-within:border-primary/50 transition-colors px-1">
                  <span className="text-lg">$</span>
                  <input
                    type="number"
                    value={bills}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0)
                      setBills(val)
                    }}
                    className="w-20 text-lg bg-transparent outline-none text-right"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => setBills(bills + 50)}
                    disabled={isLoading}
                    className="h-3 w-5 flex items-center justify-center rounded-sm bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBills(Math.max(0, bills - 50))}
                    disabled={isLoading}
                    className="h-3 w-5 flex items-center justify-center rounded-sm bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <Slider
              id="bills"
              value={[Math.min(bills, 2000)]}
              onValueChange={(value) => setBills(value[0])}
              max={2000}
              step={50}
              className="w-full"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Total Spending */}
        <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 glow-teal">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 font-light">Total Monthly Spending</span>
            <span className="text-3xl font-bold text-gradient-teal">
              ${totalSpending.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Goal Selection */}
        <div className="space-y-3">
          <Label htmlFor="goal" className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Your Goal
          </Label>
          <Select 
            value={selectedGoal} 
            onValueChange={setSelectedGoal}
            disabled={isLoading}
          >
            <SelectTrigger id="goal" className="h-12 text-base">
              <SelectValue placeholder="Select your goal" />
            </SelectTrigger>
            <SelectContent>
              {GOALS.map((goal) => (
                <SelectItem key={goal.id} value={goal.id} className="text-base">
                  <div className="flex flex-col">
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {goal.points.toLocaleString()} {goal.type.replace(/_/g, ' ')} points
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit} 
          className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-background shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Cards...
            </>
          ) : (
            "Generate My Route"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
