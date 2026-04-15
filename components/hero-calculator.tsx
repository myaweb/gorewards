"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ShoppingCart, Fuel, UtensilsCrossed, Smartphone, Target, Sparkles } from "lucide-react"
import type { SpendingFormData } from "@/components/spending-form"

const GOALS = [
  { id: "domestic-flight",  name: "Domestic Flight",   points: 25000,  type: "AEROPLAN" },
  { id: "europe-flight",    name: "Europe Flight",     points: 60000,  type: "AEROPLAN" },
  { id: "tokyo-flight",     name: "Tokyo Flight",      points: 75000,  type: "AEROPLAN" },
  { id: "hotel-stay",       name: "Luxury Hotel Stay", points: 50000,  type: "MARRIOTT_BONVOY" },
  { id: "cashback-goal",    name: "$1,000 Cashback",   points: 100000, type: "CASHBACK" },
]

const CATEGORIES = [
  { key: "grocery", label: "Grocery", icon: ShoppingCart,    max: 3000, step: 50 },
  { key: "gas",     label: "Gas",     icon: Fuel,            max: 1000, step: 25 },
  { key: "dining",  label: "Dining",  icon: UtensilsCrossed, max: 2000, step: 50 },
  { key: "bills",   label: "Bills",   icon: Smartphone,      max: 2000, step: 50 },
] as const

interface Props {
  onSubmit: (data: SpendingFormData) => void
  isLoading: boolean
}

export function HeroCalculator({ onSubmit, isLoading }: Props) {
  const [values, setValues] = useState({ grocery: 1200, gas: 300, dining: 600, bills: 500 })
  const [editing, setEditing] = useState<string | null>(null)
  const [selectedGoal, setSelectedGoal] = useState(GOALS[0].id)

  const total = Object.values(values).reduce((a, b) => a + b, 0)
  const set = (key: string, val: number) => setValues(v => ({ ...v, [key]: val }))

  const handleSubmit = () => {
    const goal = GOALS.find(g => g.id === selectedGoal) || GOALS[0]
    onSubmit({ ...values, goalId: goal.id, goalName: goal.name, requiredPoints: goal.points, pointType: goal.type })
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 shadow-[0_0_40px_rgba(6,182,212,0.08)]">
      <div className="space-y-3 mb-4">
        {CATEGORIES.map(({ key, label, icon: Icon, max, step }) => {
          const val = values[key as keyof typeof values]
          const isEditing = editing === key
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Icon className="h-3.5 w-3.5 text-cyan-500" />
                  {label}
                </span>
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-cyan-400">$</span>
                      <input
                        type="number"
                        autoFocus
                        value={val}
                        min={0}
                        max={max}
                        onChange={e => set(key, Math.max(0, Math.min(max, Number(e.target.value) || 0)))}
                        onBlur={() => setEditing(null)}
                        onKeyDown={e => e.key === 'Enter' && setEditing(null)}
                        className="w-16 bg-transparent outline-none text-right text-sm font-semibold text-cyan-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditing(key)}
                      className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                      title="Click to edit"
                    >
                      ${val.toLocaleString()}
                    </button>
                  )}
                  <div className="flex flex-col gap-px ml-1">
                    {[1, -1].map(dir => (
                      <button
                        key={dir}
                        type="button"
                        disabled={isLoading}
                        onClick={() => set(key, Math.max(0, Math.min(max, val + dir * step)))}
                        className="w-5 h-3.5 flex items-center justify-center rounded-sm bg-white/5 hover:bg-cyan-500/20 transition-colors disabled:opacity-40"
                      >
                        <svg className="w-2.5 h-2.5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={dir === 1 ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Slider
                value={[Math.min(val, max)]}
                onValueChange={([v]) => set(key, v)}
                max={max} step={step}
                disabled={isLoading}
                className="w-full"
              />
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 bg-cyan-500/5 border border-cyan-500/15 rounded-xl px-3 py-2">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Monthly Total</p>
          <p className="text-lg font-bold text-cyan-400">${total.toLocaleString()}</p>
        </div>
        <div className="flex-1">
          <Select value={selectedGoal} onValueChange={setSelectedGoal} disabled={isLoading}>
            <SelectTrigger className="h-[52px] text-sm border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-cyan-500 flex-shrink-0" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {GOALS.map(g => (
                <SelectItem key={g.id} value={g.id}>
                  <span className="font-medium">{g.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-[#090A0F] font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing Cards...</>
        ) : (
          <><Sparkles className="h-4 w-4" /> Find My Best Card</>
        )}
      </button>
    </div>
  )
}

