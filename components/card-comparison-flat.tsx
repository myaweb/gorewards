'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DollarSign,
  Award,
  TrendingUp,
  ShoppingCart,
  Fuel,
  UtensilsCrossed,
  Smartphone,
  Sparkles,
  ExternalLink,
  Calculator
} from 'lucide-react'

interface CreditCardData {
  id: string
  name: string
  bank: string
  network: string
  annualFee: number
  welcomeBonusValue: number
  baseRewardRate: number
  groceryMultiplier: number
  gasMultiplier: number
  diningMultiplier: number
  billsMultiplier: number
  applyLink: string
  image: string
}

interface CardComparisonProps {
  card1: CreditCardData
  card2: CreditCardData
}

export function CardComparison({ card1, card2 }: CardComparisonProps) {
  // User spending state
  const [spending, setSpending] = useState({
    grocery: 1200,
    gas: 300,
    dining: 600,
    bills: 500,
  })

  // Helper to determine if a value is the best (winner highlighting)
  const isBestValue = (value: number, otherValue: number, lowerIsBetter: boolean = false) => {
    if (lowerIsBetter) {
      return value < otherValue
    } else {
      return value > otherValue
    }
  }

  // Calculate net values for both cards
  const calculateNetValue = (card: CreditCardData) => {
    const annualGrocery = spending.grocery * 12
    const annualGas = spending.gas * 12
    const annualDining = spending.dining * 12
    const annualBills = spending.bills * 12

    const groceryEarnings = annualGrocery * card.groceryMultiplier
    const gasEarnings = annualGas * card.gasMultiplier
    const diningEarnings = annualDining * card.diningMultiplier
    const billsEarnings = annualBills * card.billsMultiplier

    const categoryEarnings = groceryEarnings + gasEarnings + diningEarnings + billsEarnings
    const netValue = categoryEarnings + card.welcomeBonusValue - card.annualFee

    return {
      groceryEarnings,
      gasEarnings,
      diningEarnings,
      billsEarnings,
      categoryEarnings,
      netValue
    }
  }

  const card1Calc = calculateNetValue(card1)
  const card2Calc = calculateNetValue(card2)

  const card1IsWinner = card1Calc.netValue > card2Calc.netValue

  return (
    <div className="container mx-auto px-4 space-y-8">
      {/* Visual Versus Header */}
      <div className="max-w-5xl mx-auto">
        <Card className="glass-premium border-primary/20">
          <CardContent className="p-8">
            <div className="grid grid-cols-3 gap-8 items-center">
              {/* Card A Image */}
              <div className="flex justify-center">
                <div className="relative w-full aspect-[1.586/1] max-w-[280px]">
                  <img
                    src={card1.image || '/images/placeholder-card.svg'}
                    alt={card1.name}
                    className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* VS Badge */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-cyan-400 rounded-full blur-xl opacity-50 animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-2xl">
                    <span className="text-3xl font-black text-[#090A0F]">VS</span>
                  </div>
                </div>
              </div>

              {/* Card B Image */}
              <div className="flex justify-center">
                <div className="relative w-full aspect-[1.586/1] max-w-[280px]">
                  <img
                    src={card2.image || '/images/placeholder-card.svg'}
                    alt={card2.name}
                    className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Card Names */}
            <div className="grid grid-cols-3 gap-8 mt-6 text-center">
              <div>
                <h2 className="text-xl font-bold text-gradient mb-1">{card1.name}</h2>
                <p className="text-sm text-muted-foreground">{card1.bank} • {card1.network}</p>
              </div>
              <div />
              <div>
                <h2 className="text-xl font-bold text-gradient mb-1">{card2.name}</h2>
                <p className="text-sm text-muted-foreground">{card2.bank} • {card2.network}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spending Customization */}
      <div className="max-w-5xl mx-auto">
        <Card className="glass-premium border-primary/30 bg-gradient-to-br from-cyan-500/10 via-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Customize Your Spending</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Adjust your monthly spending to see personalized net value calculations
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="grocery" className="text-sm text-muted-foreground">
                  <ShoppingCart className="inline h-3 w-3 mr-1" />
                  Grocery (Monthly)
                </Label>
                <Input
                  id="grocery"
                  type="number"
                  value={spending.grocery}
                  onChange={(e) => setSpending({ ...spending, grocery: Number(e.target.value) })}
                  className="glass-premium border-primary/20 mt-1"
                />
              </div>
              <div>
                <Label htmlFor="gas" className="text-sm text-muted-foreground">
                  <Fuel className="inline h-3 w-3 mr-1" />
                  Gas (Monthly)
                </Label>
                <Input
                  id="gas"
                  type="number"
                  value={spending.gas}
                  onChange={(e) => setSpending({ ...spending, gas: Number(e.target.value) })}
                  className="glass-premium border-primary/20 mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dining" className="text-sm text-muted-foreground">
                  <UtensilsCrossed className="inline h-3 w-3 mr-1" />
                  Dining (Monthly)
                </Label>
                <Input
                  id="dining"
                  type="number"
                  value={spending.dining}
                  onChange={(e) => setSpending({ ...spending, dining: Number(e.target.value) })}
                  className="glass-premium border-primary/20 mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bills" className="text-sm text-muted-foreground">
                  <Smartphone className="inline h-3 w-3 mr-1" />
                  Bills (Monthly)
                </Label>
                <Input
                  id="bills"
                  type="number"
                  value={spending.bills}
                  onChange={(e) => setSpending({ ...spending, bills: Number(e.target.value) })}
                  className="glass-premium border-primary/20 mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Head-to-Head Comparison Table */}
      <div className="max-w-5xl mx-auto">
        <Card className="glass-premium border-primary/20">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 font-semibold text-muted-foreground w-1/3">
                      Feature
                    </th>
                    <th className="text-center p-4 font-semibold">
                      <div className="text-sm">{card1.name}</div>
                    </th>
                    <th className="text-center p-4 font-semibold">
                      <div className="text-sm">{card2.name}</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Annual Fee */}
                  <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Annual Fee</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={isBestValue(card1.annualFee, card2.annualFee, true) ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                        ${card1.annualFee}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={isBestValue(card2.annualFee, card1.annualFee, true) ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                        ${card2.annualFee}
                      </span>
                    </td>
                  </tr>

                  {/* Welcome Bonus */}
                  <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Welcome Bonus Value</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={isBestValue(card1.welcomeBonusValue, card2.welcomeBonusValue) ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                        ${card1.welcomeBonusValue}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={isBestValue(card2.welcomeBonusValue, card1.welcomeBonusValue) ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                        ${card2.welcomeBonusValue}
                      </span>
                    </td>
                  </tr>

                  {/* Base Reward Rate */}
                  <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Base Reward Rate</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={isBestValue(card1.baseRewardRate, card2.baseRewardRate) ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                        {(card1.baseRewardRate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={isBestValue(card2.baseRewardRate, card1.baseRewardRate) ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                        {(card2.baseRewardRate * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>

                  {/* Grocery Multiplier */}
                  <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Grocery Rewards</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={isBestValue(card1.groceryMultiplier, card2.groceryMultiplier) ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                        {(card1.groceryMultiplier * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={isBestValue(card2.groceryMultiplier, card1.groceryMultiplier) ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                        {(card2.groceryMultiplier * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>

                  {/* Gas Multiplier */}
                  <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Gas Rewards</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={isBestValue(card1.gasMultiplier, card2.gasMultiplier) ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                        {(card1.gasMultiplier * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={isBestValue(card2.gasMultiplier, card1.gasMultiplier) ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                        {(card2.gasMultiplier * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>

                  {/* Dining Multiplier */}
                  <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Dining Rewards</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={isBestValue(card1.diningMultiplier, card2.diningMultiplier) ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                        {(card1.diningMultiplier * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={isBestValue(card2.diningMultiplier, card1.diningMultiplier) ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                        {(card2.diningMultiplier * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>

                  {/* Bills Multiplier */}
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Bills Rewards</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={isBestValue(card1.billsMultiplier, card2.billsMultiplier) ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                        {(card1.billsMultiplier * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={isBestValue(card2.billsMultiplier, card1.billsMultiplier) ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                        {(card2.billsMultiplier * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Math-Based Verdict - Year 1 Net Value */}
      <div className="max-w-5xl mx-auto">
        <Card className="glass-premium border-primary/30 bg-gradient-to-br from-primary/10 via-cyan-500/5 to-transparent shadow-[0_0_30px_rgba(6,182,212,0.2)]">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium border border-primary/20 mb-4">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400">First-Year Value Calculation</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">
                <span className="text-gradient">Net Value Comparison</span>
              </h2>
              <p className="text-muted-foreground">
                Based on your monthly spending: ${spending.grocery.toLocaleString()} grocery, ${spending.gas.toLocaleString()} gas, ${spending.dining.toLocaleString()} dining, ${spending.bills.toLocaleString()} bills
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1 Net Value */}
              <Card 
                className={`glass-premium transition-all ${
                  card1IsWinner 
                    ? 'border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] scale-105' 
                    : 'border-primary/20'
                }`}
              >
                <CardContent className="p-6">
                  {card1IsWinner && (
                    <div className="flex items-center justify-center gap-2 mb-4 px-3 py-2 rounded-full bg-cyan-400/20 border border-cyan-400/30">
                      <Award className="h-4 w-4 text-cyan-400" />
                      <span className="text-sm font-bold text-cyan-400">BEST VALUE</span>
                    </div>
                  )}

                  <h3 className="font-bold text-lg mb-4 text-center">{card1.name}</h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Category Earnings:</span>
                      <span className="font-semibold text-green-400">+${card1Calc.categoryEarnings.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Welcome Bonus:</span>
                      <span className="font-semibold text-green-400">+${card1.welcomeBonusValue}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Annual Fee:</span>
                      <span className="font-semibold text-red-400">-${card1.annualFee}</span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Net Value:</span>
                      <span className={`text-2xl font-bold ${card1IsWinner ? 'text-cyan-400' : 'text-primary'}`}>
                        ${card1Calc.netValue.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-2 pt-4 border-t border-white/10">
                    <p className="text-xs text-muted-foreground mb-2">Earnings Breakdown:</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        <ShoppingCart className="inline h-3 w-3 mr-1" />
                        Grocery
                      </span>
                      <span>${card1Calc.groceryEarnings.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        <Fuel className="inline h-3 w-3 mr-1" />
                        Gas
                      </span>
                      <span>${card1Calc.gasEarnings.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        <UtensilsCrossed className="inline h-3 w-3 mr-1" />
                        Dining
                      </span>
                      <span>${card1Calc.diningEarnings.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        <Smartphone className="inline h-3 w-3 mr-1" />
                        Bills
                      </span>
                      <span>${card1Calc.billsEarnings.toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <Button
                    asChild
                    className="w-full mt-6 bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-[#090A0F]"
                  >
                    <a href={card1.applyLink} target="_blank" rel="noopener noreferrer">
                      Apply Now
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Card 2 Net Value */}
              <Card 
                className={`glass-premium transition-all ${
                  !card1IsWinner 
                    ? 'border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] scale-105' 
                    : 'border-primary/20'
                }`}
              >
                <CardContent className="p-6">
                  {!card1IsWinner && (
                    <div className="flex items-center justify-center gap-2 mb-4 px-3 py-2 rounded-full bg-cyan-400/20 border border-cyan-400/30">
                      <Award className="h-4 w-4 text-cyan-400" />
                      <span className="text-sm font-bold text-cyan-400">BEST VALUE</span>
                    </div>
                  )}

                  <h3 className="font-bold text-lg mb-4 text-center">{card2.name}</h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Category Earnings:</span>
                      <span className="font-semibold text-green-400">+${card2Calc.categoryEarnings.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Welcome Bonus:</span>
                      <span className="font-semibold text-green-400">+${card2.welcomeBonusValue}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Annual Fee:</span>
                      <span className="font-semibold text-red-400">-${card2.annualFee}</span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Net Value:</span>
                      <span className={`text-2xl font-bold ${!card1IsWinner ? 'text-cyan-400' : 'text-primary'}`}>
                        ${card2Calc.netValue.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-2 pt-4 border-t border-white/10">
                    <p className="text-xs text-muted-foreground mb-2">Earnings Breakdown:</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        <ShoppingCart className="inline h-3 w-3 mr-1" />
                        Grocery
                      </span>
                      <span>${card2Calc.groceryEarnings.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        <Fuel className="inline h-3 w-3 mr-1" />
                        Gas
                      </span>
                      <span>${card2Calc.gasEarnings.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        <UtensilsCrossed className="inline h-3 w-3 mr-1" />
                        Dining
                      </span>
                      <span>${card2Calc.diningEarnings.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        <Smartphone className="inline h-3 w-3 mr-1" />
                        Bills
                      </span>
                      <span>${card2Calc.billsEarnings.toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <Button
                    asChild
                    className="w-full mt-6 bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-[#090A0F]"
                  >
                    <a href={card2.applyLink} target="_blank" rel="noopener noreferrer">
                      Apply Now
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Formula Explanation */}
            <div className="mt-8 p-6 rounded-lg glass-premium border border-primary/20">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                How Net Value is Calculated
              </h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <span className="text-primary font-mono">Net Value</span> = Category Earnings + Welcome Bonus - Annual Fee
                </p>
                <p>
                  <span className="text-primary font-mono">Category Earnings</span> = (Annual Grocery × Grocery %) + (Annual Gas × Gas %) + (Annual Dining × Dining %) + (Annual Bills × Bills %)
                </p>
                <p className="text-xs pt-2 border-t border-white/10">
                  This calculation shows your estimated total value in the first year, accounting for all rewards earned minus costs. Adjust spending above to personalize.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
