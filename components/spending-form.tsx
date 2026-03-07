"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

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
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-2xl">Your Monthly Spending</CardTitle>
        <CardDescription>
          Adjust your spending categories to optimize your rewards strategy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Spending Sliders */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="grocery" className="text-base">🛒 Grocery</Label>
              <span className="text-lg font-semibold text-primary">
                ${grocery.toLocaleString()}
              </span>
            </div>
            <Slider
              id="grocery"
              value={[grocery]}
              onValueChange={(value) => setGrocery(value[0])}
              max={3000}
              step={50}
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="gas" className="text-base">⛽ Gas</Label>
              <span className="text-lg font-semibold text-primary">
                ${gas.toLocaleString()}
              </span>
            </div>
            <Slider
              id="gas"
              value={[gas]}
              onValueChange={(value) => setGas(value[0])}
              max={1000}
              step={25}
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="dining" className="text-base">🍽️ Dining</Label>
              <span className="text-lg font-semibold text-primary">
                ${dining.toLocaleString()}
              </span>
            </div>
            <Slider
              id="dining"
              value={[dining]}
              onValueChange={(value) => setDining(value[0])}
              max={2000}
              step={50}
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="bills" className="text-base">📱 Recurring Bills</Label>
              <span className="text-lg font-semibold text-primary">
                ${bills.toLocaleString()}
              </span>
            </div>
            <Slider
              id="bills"
              value={[bills]}
              onValueChange={(value) => setBills(value[0])}
              max={2000}
              step={50}
              className="w-full"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Total Spending */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Monthly Spending</span>
            <span className="text-2xl font-bold text-primary">
              ${totalSpending.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Goal Selection */}
        <div className="space-y-3">
          <Label htmlFor="goal" className="text-base">🎯 Your Goal</Label>
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
          className="w-full h-12 text-base font-semibold"
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
