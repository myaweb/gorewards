'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  X, 
  CreditCard, 
  TrendingUp, 
  Award, 
  DollarSign, 
  ShoppingCart, 
  Fuel, 
  UtensilsCrossed, 
  Smartphone,
  Sparkles,
  Loader2,
  Zap,
  Plus
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

interface CompareToolProps {
  cards: CreditCardData[]
}

type CardSlot = CreditCardData | null

export function CompareTool({ cards }: CompareToolProps) {
  // 3-slot state management
  const [compareSlots, setCompareSlots] = useState<[CardSlot, CardSlot, CardSlot]>([null, null, null])
  
  // User spending state
  const [spending, setSpending] = useState({
    grocery: 1200,
    gas: 300,
    dining: 600,
    bills: 500,
  })
  
  // UI states
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [showSpendingForm, setShowSpendingForm] = useState(false)

  // Handle AI Auto-Fill - The Magic Button
  const handleAIAutoFill = async () => {
    setIsLoadingAI(true)
    
    try {
      // Calculate net value for all cards based on user spending
      const cardsWithValue = cards.map(card => {
        const annualGrocery = spending.grocery * 12
        const annualGas = spending.gas * 12
        const annualDining = spending.dining * 12
        const annualBills = spending.bills * 12

        const categoryEarnings =
          annualGrocery * card.groceryMultiplier +
          annualGas * card.gasMultiplier +
          annualDining * card.diningMultiplier +
          annualBills * card.billsMultiplier

        const netValue = categoryEarnings + card.welcomeBonusValue - card.annualFee

        return { ...card, netValue }
      })

      // Get top 3 cards by net value
      const top3 = cardsWithValue
        .sort((a, b) => b.netValue - a.netValue)
        .slice(0, 3)

      setCompareSlots([top3[0], top3[1], top3[2]])
      setShowSpendingForm(false)
    } catch (error) {
      console.error('Error getting AI recommendations:', error)
      alert('Failed to get AI recommendations. Please try again.')
    } finally {
      setIsLoadingAI(false)
    }
  }

  // Handle manual card selection for a specific slot
  const handleSelectCard = (slotIndex: number, cardId: string) => {
    const card = cards.find(c => c.id === cardId) || null
    const newSlots: [CardSlot, CardSlot, CardSlot] = [...compareSlots] as [CardSlot, CardSlot, CardSlot]
    newSlots[slotIndex] = card
    setCompareSlots(newSlots)
  }

  // Handle card removal from a slot
  const handleRemoveCard = (slotIndex: number) => {
    const newSlots: [CardSlot, CardSlot, CardSlot] = [...compareSlots] as [CardSlot, CardSlot, CardSlot]
    newSlots[slotIndex] = null
    setCompareSlots(newSlots)
  }

  // Get available cards for a slot (exclude already selected cards)
  const getAvailableCards = (currentSlotIndex: number) => {
    const selectedIds = compareSlots
      .map((card, index) => index !== currentSlotIndex && card ? card.id : null)
      .filter(Boolean)
    return cards.filter(card => !selectedIds.includes(card.id))
  }

  // Group cards by bank for better UX
  const groupCardsByBank = (cardList: CreditCardData[]) => {
    return cardList.reduce((acc, card) => {
      if (!acc[card.bank]) {
        acc[card.bank] = []
      }
      acc[card.bank].push(card)
      return acc
    }, {} as Record<string, CreditCardData[]>)
  }

  // Helper to determine if a value is the best (winner highlighting)
  const isBestValue = (value: number, allValues: number[], lowerIsBetter: boolean = false) => {
    if (allValues.length <= 1) return false
    const validValues = allValues.filter(v => v !== undefined && v !== null)
    if (validValues.length <= 1) return false
    
    if (lowerIsBetter) {
      return value === Math.min(...validValues)
    } else {
      return value === Math.max(...validValues)
    }
  }

  const filledSlots = compareSlots.filter(card => card !== null)
  const hasComparison = filledSlots.length >= 2
  const selectedCards = compareSlots.filter(card => card !== null) as CreditCardData[]

  return (
    <div className="space-y-8">
      {/* AI Auto-Fill Section - The Magic */}
      <Card className="glass-premium border-primary/30 bg-gradient-to-br from-cyan-500/10 via-primary/5 to-transparent shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Left: AI Branding */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium border border-primary/20 mb-4">
                <Zap className="h-4 w-4 text-cyan-400 animate-pulse" />
                <span className="text-sm font-medium text-cyan-400">AI-Powered</span>
              </div>
              <h2 className="text-2xl font-bold mb-3">
                <span className="text-gradient">Auto-Fill with AI Best Matches</span>
              </h2>
              <p className="text-muted-foreground mb-4">
                Let our AI analyze your spending and instantly fill all 3 slots with the best cards for you.
              </p>
              
              {/* Spending Inputs */}
              {showSpendingForm && (
                <div className="grid grid-cols-2 gap-4 mt-6">
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
              )}
            </div>

            {/* Right: Action Button */}
            <div className="flex flex-col gap-3">
              {!showSpendingForm ? (
                <>
                  <Button
                    size="lg"
                    onClick={() => setShowSpendingForm(true)}
                    className="bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-[#090A0F] shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all hover:scale-105 min-w-[240px]"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Customize Spending
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleAIAutoFill}
                    disabled={isLoadingAI}
                    variant="outline"
                    className="border-primary/30 hover:bg-primary/10 min-w-[240px]"
                  >
                    {isLoadingAI ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Use Default Spending
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  onClick={handleAIAutoFill}
                  disabled={isLoadingAI}
                  className="bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-[#090A0F] shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all hover:scale-105 min-w-[240px]"
                >
                  {isLoadingAI ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Auto-Fill Best Matches
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3-Slot Hybrid UI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {compareSlots.map((card, index) => (
          <Card 
            key={index} 
            className={`glass-premium transition-all ${
              card ? 'border-primary/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'border-dashed border-white/20'
            }`}
          >
            <CardContent className="p-6">
              {card ? (
                // Filled Slot
                <div className="space-y-4">
                  {/* Card Image */}
                  <div className="relative aspect-[1.586/1] w-full rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-cyan-500/10">
                    <img
                      src={card.image || '/images/placeholder-card.svg'}
                      alt={card.name}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>

                  {/* Card Info */}
                  <div>
                    <h3 className="font-bold text-lg mb-1">{card.name}</h3>
                    <p className="text-sm text-muted-foreground">{card.bank} • {card.network}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      asChild
                      className="flex-1 bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-[#090A0F]"
                    >
                      <a href={card.applyLink} target="_blank" rel="noopener noreferrer">
                        Apply Now
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveCard(index)}
                      className="border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
                    >
                      <X className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>

                  {/* Manual Override */}
                  <Select onValueChange={(value) => handleSelectCard(index, value)}>
                    <SelectTrigger className="glass-premium border-primary/20 text-xs">
                      <SelectValue placeholder="Change card..." />
                    </SelectTrigger>
                    <SelectContent className="glass-premium border-primary/20 max-h-[300px]">
                      {Object.entries(groupCardsByBank(getAvailableCards(index))).map(([bank, bankCards]) => (
                        <div key={bank}>
                          <div className="px-2 py-2 text-xs font-semibold text-primary uppercase tracking-wider">
                            {bank}
                          </div>
                          {bankCards.map((availableCard) => (
                            <SelectItem 
                              key={availableCard.id} 
                              value={availableCard.id}
                              className="hover:bg-primary/10 cursor-pointer text-xs"
                            >
                              {availableCard.name}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                // Empty Slot
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">Add a card to compare</p>
                  
                  <Select onValueChange={(value) => handleSelectCard(index, value)}>
                    <SelectTrigger className="glass-premium border-primary/20 w-full">
                      <SelectValue placeholder="Choose a card..." />
                    </SelectTrigger>
                    <SelectContent className="glass-premium border-primary/20 max-h-[400px]">
                      {Object.entries(groupCardsByBank(getAvailableCards(index))).map(([bank, bankCards]) => (
                        <div key={bank}>
                          <div className="px-2 py-2 text-xs font-semibold text-primary uppercase tracking-wider">
                            {bank}
                          </div>
                          {bankCards.map((availableCard) => (
                            <SelectItem 
                              key={availableCard.id} 
                              value={availableCard.id}
                              className="hover:bg-primary/10 cursor-pointer"
                            >
                              {availableCard.name}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Head-to-Head Comparison Table */}
      {hasComparison && (
        <>
          <Card className="glass-premium border-primary/20">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 font-semibold text-muted-foreground w-1/4">
                        Feature
                      </th>
                      {selectedCards.map((card, index) => (
                        <th key={index} className="text-center p-4 font-semibold">
                          <div className="text-sm">{card.name}</div>
                        </th>
                      ))}
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
                      {selectedCards.map((card, index) => {
                        const allFees = selectedCards.map(c => c.annualFee)
                        const isBest = isBestValue(card.annualFee, allFees, true)
                        return (
                          <td key={index} className="p-4 text-center">
                            <span className={isBest ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                              ${card.annualFee}
                            </span>
                          </td>
                        )
                      })}
                    </tr>

                    {/* Welcome Bonus */}
                    <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Welcome Bonus Value</span>
                        </div>
                      </td>
                      {selectedCards.map((card, index) => {
                        const allBonuses = selectedCards.map(c => c.welcomeBonusValue)
                        const isBest = isBestValue(card.welcomeBonusValue, allBonuses)
                        return (
                          <td key={index} className="p-4 text-center">
                            <span className={isBest ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                              ${card.welcomeBonusValue}
                            </span>
                          </td>
                        )
                      })}
                    </tr>

                    {/* Base Reward Rate */}
                    <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Base Reward Rate</span>
                        </div>
                      </td>
                      {selectedCards.map((card, index) => {
                        const allRates = selectedCards.map(c => c.baseRewardRate)
                        const isBest = isBestValue(card.baseRewardRate, allRates)
                        return (
                          <td key={index} className="p-4 text-center">
                            <span className={isBest ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                              {(card.baseRewardRate * 100).toFixed(1)}%
                            </span>
                          </td>
                        )
                      })}
                    </tr>

                    {/* Grocery Multiplier */}
                    <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Grocery Rewards</span>
                        </div>
                      </td>
                      {selectedCards.map((card, index) => {
                        const allMultipliers = selectedCards.map(c => c.groceryMultiplier)
                        const isBest = isBestValue(card.groceryMultiplier, allMultipliers)
                        return (
                          <td key={index} className="p-4 text-center">
                            <span className={isBest ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                              {(card.groceryMultiplier * 100).toFixed(1)}%
                            </span>
                          </td>
                        )
                      })}
                    </tr>

                    {/* Gas Multiplier */}
                    <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Fuel className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Gas Rewards</span>
                        </div>
                      </td>
                      {selectedCards.map((card, index) => {
                        const allMultipliers = selectedCards.map(c => c.gasMultiplier)
                        const isBest = isBestValue(card.gasMultiplier, allMultipliers)
                        return (
                          <td key={index} className="p-4 text-center">
                            <span className={isBest ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                              {(card.gasMultiplier * 100).toFixed(1)}%
                            </span>
                          </td>
                        )
                      })}
                    </tr>

                    {/* Dining Multiplier */}
                    <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Dining Rewards</span>
                        </div>
                      </td>
                      {selectedCards.map((card, index) => {
                        const allMultipliers = selectedCards.map(c => c.diningMultiplier)
                        const isBest = isBestValue(card.diningMultiplier, allMultipliers)
                        return (
                          <td key={index} className="p-4 text-center">
                            <span className={isBest ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                              {(card.diningMultiplier * 100).toFixed(1)}%
                            </span>
                          </td>
                        )
                      })}
                    </tr>

                    {/* Bills Multiplier */}
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Bills Rewards</span>
                        </div>
                      </td>
                      {selectedCards.map((card, index) => {
                        const allMultipliers = selectedCards.map(c => c.billsMultiplier)
                        const isBest = isBestValue(card.billsMultiplier, allMultipliers)
                        return (
                          <td key={index} className="p-4 text-center">
                            <span className={isBest ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>
                              {(card.billsMultiplier * 100).toFixed(1)}%
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Math-Based Verdict - Year 1 Net Value */}
          <Card className="glass-premium border-primary/30 bg-gradient-to-br from-primary/10 via-cyan-500/5 to-transparent shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium border border-primary/20 mb-4">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-400">Math-Based Verdict</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  <span className="text-gradient">Year 1 Net Value</span>
                </h2>
                <p className="text-muted-foreground">
                  Based on your monthly spending: ${spending.grocery.toLocaleString()} grocery, ${spending.gas.toLocaleString()} gas, ${spending.dining.toLocaleString()} dining, ${spending.bills.toLocaleString()} bills
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {selectedCards.map((card, index) => {
                  // Calculate Year 1 Net Value
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

                  // Determine if this is the winner
                  const allNetValues = selectedCards.map(c => {
                    const ce = (spending.grocery * 12 * c.groceryMultiplier) +
                               (spending.gas * 12 * c.gasMultiplier) +
                               (spending.dining * 12 * c.diningMultiplier) +
                               (spending.bills * 12 * c.billsMultiplier)
                    return ce + c.welcomeBonusValue - c.annualFee
                  })
                  const isWinner = isBestValue(netValue, allNetValues)

                  return (
                    <Card 
                      key={index}
                      className={`glass-premium transition-all ${
                        isWinner 
                          ? 'border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] scale-105' 
                          : 'border-primary/20'
                      }`}
                    >
                      <CardContent className="p-6">
                        {isWinner && (
                          <div className="flex items-center justify-center gap-2 mb-4 px-3 py-2 rounded-full bg-cyan-400/20 border border-cyan-400/30">
                            <Award className="h-4 w-4 text-cyan-400" />
                            <span className="text-sm font-bold text-cyan-400">BEST VALUE</span>
                          </div>
                        )}

                        <h3 className="font-bold text-lg mb-4 text-center">{card.name}</h3>

                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Category Earnings:</span>
                            <span className="font-semibold text-green-400">+${categoryEarnings.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Welcome Bonus:</span>
                            <span className="font-semibold text-green-400">+${card.welcomeBonusValue}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Annual Fee:</span>
                            <span className="font-semibold text-red-400">-${card.annualFee}</span>
                          </div>
                          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                          <div className="flex justify-between items-center">
                            <span className="font-bold">Net Value:</span>
                            <span className={`text-2xl font-bold ${isWinner ? 'text-cyan-400' : 'text-primary'}`}>
                              ${netValue.toFixed(0)}
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
                            <span>${groceryEarnings.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              <Fuel className="inline h-3 w-3 mr-1" />
                              Gas
                            </span>
                            <span>${gasEarnings.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              <UtensilsCrossed className="inline h-3 w-3 mr-1" />
                              Dining
                            </span>
                            <span>${diningEarnings.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              <Smartphone className="inline h-3 w-3 mr-1" />
                              Bills
                            </span>
                            <span>${billsEarnings.toFixed(0)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Formula Explanation */}
              <div className="mt-8 p-6 rounded-lg glass-premium border border-primary/20">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  How We Calculate Net Value
                </h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    <span className="text-primary font-mono">Net Value</span> = Category Earnings + Welcome Bonus - Annual Fee
                  </p>
                  <p>
                    <span className="text-primary font-mono">Category Earnings</span> = (Annual Grocery × Grocery %) + (Annual Gas × Gas %) + (Annual Dining × Dining %) + (Annual Bills × Bills %)
                  </p>
                  <p className="text-xs pt-2 border-t border-white/10">
                    This calculation shows your total value in the first year, accounting for all rewards earned minus costs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Comparison CTA - Only show for exactly 2 cards */}
          {filledSlots.length === 2 && (
            <Card className="glass-premium border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">Want AI-Powered Analysis?</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Get detailed insights, personalized recommendations, and an AI verdict on which card is better for your spending profile.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-[#090A0F] shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all hover:scale-105 min-w-[220px]"
                    onClick={() => {
                      const card1 = filledSlots[0]
                      const card2 = filledSlots[1]
                      if (card1 && card2) {
                        const slug1 = card1.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                        const slug2 = card2.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                        window.location.href = `/compare/${slug1}-vs-${slug2}`
                      }
                    }}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    View Detailed Comparison
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Helper Text - Show when no comparison */}
      {!hasComparison && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Select Cards to Compare</h3>
          <p className="text-muted-foreground">
            Choose at least 2 cards to see a detailed side-by-side comparison, or use the AI Auto-Fill button above.
          </p>
        </div>
      )}
    </div>
  )
}
