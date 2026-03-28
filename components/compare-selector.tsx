'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, ArrowRight, Zap, Loader2 } from 'lucide-react'
import { CardImage } from '@/components/card-image'

interface CardData {
  id: string
  name: string
  bank: string
  network: string
  annualFee: number
  baseRewardRate: number
  imageUrl: string | null
  affiliateLink: string | null
  multipliers: Array<{
    category: string
    multiplierValue: number
  }>
}

interface CompareSelectorProps {
  cards: CardData[]
}

// Utility function to generate URL-friendly slugs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function CompareSelector({ cards }: CompareSelectorProps) {
  const router = useRouter()
  const [card1, setCard1] = useState<CardData | null>(null)
  const [card2, setCard2] = useState<CardData | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)

  // Helper function to get multiplier value for a category
  const getMultiplierValue = (card: CardData, category: string): number => {
    const multiplier = card.multipliers.find(m => m.category === category)
    return multiplier ? multiplier.multiplierValue : card.baseRewardRate
  }

  // Get best multiplier category for a card
  const getBestCategory = (card: CardData): { category: string; value: number } | null => {
    if (card.multipliers.length === 0) return null
    const best = card.multipliers.reduce((max, curr) => 
      curr.multiplierValue > max.multiplierValue ? curr : max
    )
    return { category: best.category, value: best.multiplierValue }
  }

  // Format category name for display
  const formatCategory = (category: string): string => {
    return category.toLowerCase().replace(/_/g, ' ')
  }

  // Group cards by bank for better UX
  const groupCardsByBank = (cardList: CardData[]) => {
    return cardList.reduce((acc, card) => {
      if (!acc[card.bank]) {
        acc[card.bank] = []
      }
      acc[card.bank].push(card)
      return acc
    }, {} as Record<string, CardData[]>)
  }

  // Get available cards for slot 2 (exclude card1)
  const getAvailableCardsForSlot2 = () => {
    if (!card1) return cards
    return cards.filter(card => card.id !== card1.id)
  }

  // Get available cards for slot 1 (exclude card2)
  const getAvailableCardsForSlot1 = () => {
    if (!card2) return cards
    return cards.filter(card => card.id !== card2.id)
  }

  // Handle card selection
  const handleSelectCard1 = (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    setCard1(card || null)
    // Scroll to Card B slot after a short delay
    setTimeout(() => {
      document.getElementById('card-b-slot')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 150)
  }

  const handleSelectCard2 = (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    setCard2(card || null)
    setTimeout(() => {
      document.getElementById('compare-btn')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 150)
  }

  // Handle compare button click
  const handleCompare = () => {
    if (!card1 || !card2) return
    
    setIsNavigating(true)
    
    const slug1 = slugify(card1.name)
    const slug2 = slugify(card2.name)
    const comparisonUrl = `/compare/${slug1}-vs-${slug2}`
    
    // Use window.location for hard navigation to avoid soft-nav stalling on loading.tsx
    window.location.href = comparisonUrl
  }

  const isCompareEnabled = card1 !== null && card2 !== null

  return (
    <div className="space-y-8">
      {/* 2-Slot Selector */}
      <div className="max-w-5xl mx-auto">
        <Card className="glass-premium border-primary/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
              {/* Card Slot 1 */}
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-primary mb-2">Card A</h3>
                </div>
                
                {card1 ? (
                  <div className="space-y-4">
                    {/* Card Preview */}
                    <div className="relative aspect-[1.586/1] w-full rounded-lg overflow-hidden">
                      <CardImage
                        name={card1.name}
                        bank={card1.bank}
                        network={card1.network}
                        imageUrl={card1.imageUrl}
                        className="w-full h-full rounded-lg"
                      />
                    </div>
                    
                    {/* Card Info */}
                    <div className="space-y-3 p-4 rounded-lg glass-premium border border-primary/10">
                      <div>
                        <h4 className="font-bold text-lg mb-1">{card1.name}</h4>
                        <p className="text-sm text-muted-foreground">{card1.bank} • {card1.network}</p>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Annual Fee</span>
                          <span className="font-semibold">${card1.annualFee}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Base Rewards</span>
                          <span className="font-semibold">{card1.baseRewardRate}%</span>
                        </div>
                        {getBestCategory(card1) && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Best Category</span>
                            <span className="font-semibold text-primary">
                              {getBestCategory(card1)!.value}x {formatCategory(getBestCategory(card1)!.category)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Change Selection */}
                    <Select onValueChange={handleSelectCard1} value={card1.id}>
                      <SelectTrigger className="glass-premium border-primary/20">
                        <SelectValue placeholder="Change card..." />
                      </SelectTrigger>
                      <SelectContent className="glass-premium border-primary/20 max-h-[400px]">
                        {Object.entries(groupCardsByBank(getAvailableCardsForSlot1())).map(([bank, bankCards]) => (
                          <div key={bank}>
                            <div className="px-2 py-2 text-xs font-semibold text-primary uppercase tracking-wider">
                              {bank}
                            </div>
                            {bankCards.map((card) => (
                              <SelectItem 
                                key={card.id} 
                                value={card.id}
                                className="hover:bg-primary/10 cursor-pointer"
                              >
                                {card.name}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Select onValueChange={handleSelectCard1}>
                      <SelectTrigger className="glass-premium border-primary/20 h-12">
                        <SelectValue placeholder="Choose Card A..." />
                      </SelectTrigger>
                      <SelectContent className="glass-premium border-primary/20 max-h-[400px]">
                        {Object.entries(groupCardsByBank(getAvailableCardsForSlot1())).map(([bank, bankCards]) => (
                          <div key={bank}>
                            <div className="px-2 py-2 text-xs font-semibold text-primary uppercase tracking-wider">
                              {bank}
                            </div>
                            {bankCards.map((card) => (
                              <SelectItem 
                                key={card.id} 
                                value={card.id}
                                className="hover:bg-primary/10 cursor-pointer"
                              >
                                {card.name}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* VS Divider */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-cyan-400/20 rounded-full blur-md opacity-30" />
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg border border-primary/30">
                    <span className="text-lg font-bold text-[#090A0F]">VS</span>
                  </div>
                </div>
              </div>

              {/* Card Slot 2 */}
              <div id="card-b-slot" className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-primary mb-2">Card B</h3>
                </div>
                
                {card2 ? (
                  <div className="space-y-4">
                    {/* Card Preview */}
                    <div className="relative aspect-[1.586/1] w-full rounded-lg overflow-hidden">
                      <CardImage
                        name={card2.name}
                        bank={card2.bank}
                        network={card2.network}
                        imageUrl={card2.imageUrl}
                        className="w-full h-full rounded-lg"
                      />
                    </div>
                    
                    {/* Card Info */}
                    <div className="space-y-3 p-4 rounded-lg glass-premium border border-primary/10">
                      <div>
                        <h4 className="font-bold text-lg mb-1">{card2.name}</h4>
                        <p className="text-sm text-muted-foreground">{card2.bank} • {card2.network}</p>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Annual Fee</span>
                          <span className="font-semibold">${card2.annualFee}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Base Rewards</span>
                          <span className="font-semibold">{card2.baseRewardRate}%</span>
                        </div>
                        {getBestCategory(card2) && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Best Category</span>
                            <span className="font-semibold text-primary">
                              {getBestCategory(card2)!.value}x {formatCategory(getBestCategory(card2)!.category)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Change Selection */}
                    <Select onValueChange={handleSelectCard2} value={card2.id}>
                      <SelectTrigger className="glass-premium border-primary/20">
                        <SelectValue placeholder="Change card..." />
                      </SelectTrigger>
                      <SelectContent className="glass-premium border-primary/20 max-h-[400px]">
                        {Object.entries(groupCardsByBank(getAvailableCardsForSlot2())).map(([bank, bankCards]) => (
                          <div key={bank}>
                            <div className="px-2 py-2 text-xs font-semibold text-primary uppercase tracking-wider">
                              {bank}
                            </div>
                            {bankCards.map((card) => (
                              <SelectItem 
                                key={card.id} 
                                value={card.id}
                                className="hover:bg-primary/10 cursor-pointer"
                              >
                                {card.name}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Select onValueChange={handleSelectCard2}>
                      <SelectTrigger className="glass-premium border-primary/20 h-12">
                        <SelectValue placeholder="Choose Card B..." />
                      </SelectTrigger>
                      <SelectContent className="glass-premium border-primary/20 max-h-[400px]">
                        {Object.entries(groupCardsByBank(getAvailableCardsForSlot2())).map(([bank, bankCards]) => (
                          <div key={bank}>
                            <div className="px-2 py-2 text-xs font-semibold text-primary uppercase tracking-wider">
                              {bank}
                            </div>
                            {bankCards.map((card) => (
                              <SelectItem 
                                key={card.id} 
                                value={card.id}
                                className="hover:bg-primary/10 cursor-pointer"
                              >
                                {card.name}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Compare Button */}
            <div id="compare-btn" className="mt-8 flex flex-col items-center gap-3">
              {!isCompareEnabled && (
                <p className="text-sm text-muted-foreground">
                  Select two cards to view detailed comparison
                </p>
              )}
              <Button
                size="lg"
                onClick={handleCompare}
                disabled={!isCompareEnabled || isNavigating}
                className="bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-[#090A0F] shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all hover:scale-105 min-w-[280px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
              >
                {isNavigating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading Comparison...
                  </>
                ) : (
                  <>
                    Compare Cards
                    <ArrowRight className="ml-2 h-5 w-5 animate-[slide-x_1s_ease-in-out_infinite]" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Highlights */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card className="glass-premium border-primary/20">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Fees & First-Year Value</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Compare annual fees, welcome bonuses, and net value calculations for your first year.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-premium border-primary/20">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Category Rewards</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              See earning rates across dining, travel, groceries, gas, and recurring bills.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-premium border-primary/20">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <ArrowRight className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Spending-Based Analysis</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Adjust your spending to see which card delivers better value for your lifestyle.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
