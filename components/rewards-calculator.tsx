'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, TrendingUp } from 'lucide-react'

interface Multiplier {
  id: string
  category: string
  multiplierValue: number
}

interface RewardsCalculatorProps {
  multipliers: Multiplier[]
  annualFee: number
  cashback: boolean
}

export function RewardsCalculator({ multipliers, annualFee, cashback }: RewardsCalculatorProps) {
  const [monthlySpending, setMonthlySpending] = useState<{ [key: string]: string }>({})

  const calculateRewards = () => {
    let totalRewards = 0
    
    multipliers.forEach((mult) => {
      const spending = parseFloat(monthlySpending[mult.id] || '0')
      const rate = Number(mult.multiplierValue)
      const rewardRate = rate < 1 ? rate : rate / 100
      totalRewards += spending * rewardRate * 12
    })

    const netRewards = totalRewards - annualFee
    
    return {
      totalRewards,
      netRewards,
      monthlyNet: netRewards / 12
    }
  }

  const { totalRewards, netRewards, monthlyNet } = calculateRewards()

  const handleInputChange = (multId: string, value: string) => {
    // Sadece sayı ve nokta kabul et
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMonthlySpending(prev => ({ ...prev, [multId]: value }))
    }
  }

  return (
    <div className="max-w-5xl mx-auto mb-12">
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Calculate Your Monthly Earnings
          </CardTitle>
          <CardDescription>
            Enter your monthly spending in each category to see your annual rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {multipliers.map((mult) => {
                const val = Number(mult.multiplierValue)
                const pct = val < 1 ? val * 100 : val
                
                return (
                  <div key={mult.id} className="space-y-2">
                    <Label htmlFor={mult.id} className="text-sm font-medium flex items-center justify-between">
                      <span className="capitalize">
                        {mult.category.toLowerCase().replace(/_/g, ' ')}
                      </span>
                      <span className="text-primary text-xs">
                        {pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1)}% back
                      </span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id={mult.id}
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={monthlySpending[mult.id] || ''}
                        onChange={(e) => handleInputChange(mult.id, e.target.value)}
                        className="pl-7 glass"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Results */}
            <div className="glass-premium p-6 rounded-xl space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Annual Earnings Summary</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass p-4 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Total Rewards</div>
                  <div className="text-2xl font-bold text-primary">
                    ${totalRewards.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">per year</div>
                </div>
                
                <div className="glass p-4 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Annual Fee</div>
                  <div className="text-2xl font-bold text-red-400">
                    -${annualFee.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">after deduction</div>
                </div>
                
                <div className="glass p-4 rounded-lg border border-primary/30">
                  <div className="text-xs text-muted-foreground mb-1">Net Earnings</div>
                  <div className={`text-2xl font-bold ${netRewards >= 0 ? 'text-gradient-teal' : 'text-red-400'}`}>
                    ${netRewards.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ${Math.abs(monthlyNet).toFixed(2)}/month
                  </div>
                </div>
              </div>

              {netRewards < 0 && (
                <div className="text-xs text-yellow-500/80 text-center mt-2">
                  💡 At this spending level, the annual fee exceeds your rewards. Increase spending to make this card worthwhile.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

