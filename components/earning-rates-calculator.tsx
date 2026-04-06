"use client"

import { useState } from "react"
import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Multiplier {
  id: string
  category: string
  multiplierValue: any
}

export function EarningRatesCalculator({ multipliers }: { multipliers: Multiplier[] }) {
  const [monthly, setMonthly] = useState(500)

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Earning Rates
        </CardTitle>
        <CardDescription>Enter your monthly spend to see your estimated rewards</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Monthly spend input */}
        <div className="flex items-center gap-3 mb-6 p-4 glass rounded-xl border border-primary/20">
          <span className="text-sm text-gray-400 whitespace-nowrap">Monthly spend</span>
          <div className="relative flex-1 max-w-[160px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              min={0}
              max={99999}
              value={monthly}
              onChange={e => setMonthly(Math.max(0, Number(e.target.value)))}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
            />
          </div>
          <span className="text-xs text-gray-500">per category</span>
        </div>

        {/* Rates list */}
        <div className="space-y-3">
          {multipliers.map((mult, index) => {
            const val = Number(mult.multiplierValue)
            const pct = val < 1 ? val * 100 : val
            const earned = (monthly * pct) / 100

            return (
              <div key={mult.id} className="flex items-center justify-between p-4 glass rounded-lg hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-cyan-400/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <span className="font-medium capitalize">{mult.category.toLowerCase().replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <span className="text-sm text-gray-500">{pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1)}%</span>
                  <span className="text-xl font-bold text-primary">
                    ${earned % 1 === 0 ? earned.toFixed(0) : earned.toFixed(2)}
                    <span className="text-xs font-normal text-gray-500 ml-1">/mo</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-xs text-gray-600 mt-4">
          Estimated monthly rewards based on your spend per category. Actual rewards may vary.
        </p>
      </CardContent>
    </Card>
  )
}

