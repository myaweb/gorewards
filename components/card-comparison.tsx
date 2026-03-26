"use client"

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Gift, 
  Check, 
  X, 
  ExternalLink,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Calculator
} from "lucide-react"
import { usePostHog } from 'posthog-js/react'
import { useParams } from 'next/navigation'

// Define types based on Prisma schema
type PrismaCard = {
  id: string
  name: string
  bank: string
  network: string
  annualFee: number
  affiliateLink: string | null
  [key: string]: any
}

type CardBonus = {
  id: string
  bonusPoints: number
  pointType: string
  minimumSpendAmount: number
  spendPeriodMonths: number
  [key: string]: any
}

type CardMultiplier = {
  id: string
  category: string
  multiplierValue: number
  [key: string]: any
}

interface CardComparisonProps {
  card1: PrismaCard & { bonuses: CardBonus[]; multipliers: CardMultiplier[] }
  card2: PrismaCard & { bonuses: CardBonus[]; multipliers: CardMultiplier[] }
  aiVerdict?: string | null
}

export function CardComparison({ card1, card2, aiVerdict }: CardComparisonProps) {
  const posthog = usePostHog()
  const params = useParams()
  const currentSlug = params?.slug as string || ''
  
  // Track affiliate link clicks via event delegation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('.affiliate-link') as HTMLAnchorElement
      
      if (link) {
        const cardId = link.dataset.cardId
        const cardName = link.dataset.cardName
        const position = link.dataset.position
        
        posthog?.capture('affiliate_link_clicked', {
          cardName,
          cardId,
          position,
          pageSlug: currentSlug,
          timestamp: new Date().toISOString(),
        })
      }
    }
    
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [posthog, currentSlug])
  
  // Calculate value scores for comparison
  const card1BonusValue = card1.bonuses[0]?.bonusPoints || 0
  const card2BonusValue = card2.bonuses[0]?.bonusPoints || 0
  
  const card1AvgMultiplier = card1.multipliers.length > 0 
    ? card1.multipliers.reduce((sum: number, m: CardMultiplier) => sum + Number(m.multiplierValue), 0) / card1.multipliers.length 
    : 1
  const card2AvgMultiplier = card2.multipliers.length > 0
    ? card2.multipliers.reduce((sum: number, m: CardMultiplier) => sum + Number(m.multiplierValue), 0) / card2.multipliers.length
    : 1
  
  // Calculate exact math for verdict
  const annualFeeDiff = Math.abs(Number(card1.annualFee) - Number(card2.annualFee))
  const bonusDiff = Math.abs(card1BonusValue - card2BonusValue)
  
  // Helper to create slug from card name
  const createSlug = (cardName: string): string => {
    return cardName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
  
  // Affiliate URLs - use our Money Router for tracking
  const card1AffiliateUrl = card1.affiliateLink 
    ? `/api/go/${createSlug(card1.name)}` 
    : `/compare`
  const card2AffiliateUrl = card2.affiliateLink 
    ? `/api/go/${createSlug(card2.name)}` 
    : `/compare`
  
  // Track affiliate link clicks
  const handleAffiliateClick = (card: PrismaCard, position: string) => {
    posthog?.capture('affiliate_link_clicked', {
      cardName: card.name,
      cardId: card.id,
      targetBank: card.bank,
      network: card.network,
      annualFee: Number(card.annualFee),
      pageSlug: currentSlug,
      position: position, // 'side_by_side', 'verdict_primary', 'verdict_secondary'
      timestamp: new Date().toISOString(),
    })
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-primary/30">
            <CreditCard className="h-3 w-3 mr-1" />
            Card Comparison
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-gradient">{card1.name}</span>
            <span className="text-muted-foreground mx-4">vs</span>
            <span className="text-gradient">{card2.name}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Compare rewards structure, fees, bonuses, and category fit to find the right card for your spending
          </p>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Annual Fee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{card1.name.split(" ")[0]}</span>
                  <span className="text-2xl font-bold">${Number(card1.annualFee).toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{card2.name.split(" ")[0]}</span>
                  <span className="text-2xl font-bold">${Number(card2.annualFee).toFixed(0)}</span>
                </div>
              </div>
              {Number(card1.annualFee) !== Number(card2.annualFee) && (
                <div className="text-xs text-muted-foreground text-center mt-4 pt-3 border-t border-white/5">
                  {Number(card1.annualFee) < Number(card2.annualFee) 
                    ? `${card1.name.split(" ")[0]} is $${annualFeeDiff.toFixed(0)} less per year`
                    : `${card2.name.split(" ")[0]} is $${annualFeeDiff.toFixed(0)} less per year`
                  }
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Welcome Bonus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{card1.name.split(" ")[0]}</span>
                  <span className="text-2xl font-bold">{(card1BonusValue / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{card2.name.split(" ")[0]}</span>
                  <span className="text-2xl font-bold">{(card2BonusValue / 1000).toFixed(0)}K</span>
                </div>
              </div>
              {card1BonusValue !== card2BonusValue && (
                <div className="text-xs text-muted-foreground text-center mt-4 pt-3 border-t border-white/5">
                  {card1BonusValue > card2BonusValue
                    ? `${card1.name.split(" ")[0]} offers ${((bonusDiff) / 1000).toFixed(0)}K more points`
                    : `${card2.name.split(" ")[0]} offers ${((bonusDiff) / 1000).toFixed(0)}K more points`
                  }
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Avg. Earning Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{card1.name.split(" ")[0]}</span>
                  <span className="text-2xl font-bold">{card1AvgMultiplier.toFixed(1)}x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{card2.name.split(" ")[0]}</span>
                  <span className="text-2xl font-bold">{card2AvgMultiplier.toFixed(1)}x</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-center mt-4 pt-3 border-t border-white/5">
                Across bonus categories
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 max-w-7xl mx-auto">
          {/* Card 1 */}
          <ComparisonCard 
            card={card1} 
            affiliateUrl={card1AffiliateUrl}
            onAffiliateClick={() => handleAffiliateClick(card1, 'side_by_side')}
          />
          
          {/* Card 2 */}
          <ComparisonCard 
            card={card2} 
            affiliateUrl={card2AffiliateUrl}
            onAffiliateClick={() => handleAffiliateClick(card2, 'side_by_side')}
          />
        </div>

        {/* Detailed Comparison Table */}
        <Card className="glass-card mb-12 max-w-7xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Category Multipliers Breakdown</CardTitle>
            <CardDescription>Exact earning rates by spending category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="text-center py-4 px-4 text-sm font-medium">{card1.name.split(" ")[0]}</th>
                    <th className="text-center py-4 px-4 text-sm font-medium">{card2.name.split(" ")[0]}</th>
                    <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground">Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Multipliers comparison */}
                  {["GROCERY", "DINING", "GAS", "TRAVEL", "ENTERTAINMENT"].map((category: string) => {
                    const card1Mult = card1.multipliers.find((m: CardMultiplier) => m.category === category)
                    const card2Mult = card2.multipliers.find((m: CardMultiplier) => m.category === category)
                    const card1Rate = card1Mult ? Number(card1Mult.multiplierValue) : 1
                    const card2Rate = card2Mult ? Number(card2Mult.multiplierValue) : 1
                    
                    return (
                      <tr key={category} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4 text-sm capitalize">{category.toLowerCase()}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={card1Rate > card2Rate ? "text-primary font-bold text-lg" : "text-base"}>
                            {card1Rate}x
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={card2Rate > card1Rate ? "text-primary font-bold text-lg" : "text-base"}>
                            {card2Rate}x
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {card1Rate > card2Rate && (
                            <Badge variant="outline" className="border-primary/50 text-primary">
                              {card1.name.split(" ")[0]}
                            </Badge>
                          )}
                          {card2Rate > card1Rate && (
                            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                              {card2.name.split(" ")[0]}
                            </Badge>
                          )}
                          {card1Rate === card2Rate && (
                            <span className="text-xs text-muted-foreground">Tie</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  
                  {/* Bonus requirement */}
                  <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 text-sm">Bonus Requirement</td>
                    <td className="py-4 px-4 text-center text-sm">
                      ${Number(card1.bonuses[0]?.minimumSpendAmount || 0).toLocaleString()} in {card1.bonuses[0]?.spendPeriodMonths || 0} months
                    </td>
                    <td className="py-4 px-4 text-center text-sm">
                      ${Number(card2.bonuses[0]?.minimumSpendAmount || 0).toLocaleString()} in {card2.bonuses[0]?.spendPeriodMonths || 0} months
                    </td>
                    <td className="py-4 px-4 text-center">
                      {Number(card1.bonuses[0]?.minimumSpendAmount || 0) < Number(card2.bonuses[0]?.minimumSpendAmount || 0) && (
                        <Badge variant="outline" className="border-primary/50 text-primary text-xs">
                          Easier
                        </Badge>
                      )}
                      {Number(card2.bonuses[0]?.minimumSpendAmount || 0) < Number(card1.bonuses[0]?.minimumSpendAmount || 0) && (
                        <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">
                          Easier
                        </Badge>
                      )}
                    </td>
                  </tr>
                  
                  {/* Network */}
                  <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 text-sm">Network</td>
                    <td className="py-4 px-4 text-center text-sm">{card1.network}</td>
                    <td className="py-4 px-4 text-center text-sm">{card2.network}</td>
                    <td className="py-4 px-4 text-center">
                      {(card1.network === "VISA" || card1.network === "MASTERCARD") && card2.network === "AMEX" && (
                        <Badge variant="outline" className="border-primary/50 text-primary text-xs">
                          More Accepted
                        </Badge>
                      )}
                      {(card2.network === "VISA" || card2.network === "MASTERCARD") && card1.network === "AMEX" && (
                        <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">
                          More Accepted
                        </Badge>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* AI-Powered Expert Verdict */}
        {aiVerdict && (
          <Card className="glass-premium border-primary/20 mb-8 max-w-5xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-primary/30 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl">AI-Powered Expert Analysis</CardTitle>
                  <CardDescription>Personalized recommendation based on your spending profile</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-invert prose-cyan max-w-none prose-headings:text-primary prose-headings:font-bold prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-white prose-ul:text-muted-foreground prose-li:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: aiVerdict }}
              />
            </CardContent>
          </Card>
        )}

        {/* AI Generated Verdict with Exact Math */}
        <Card className="glass-premium border-primary/20 mb-8 max-w-5xl mx-auto glow-teal">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center glow-teal">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl">The Math-Based Verdict</CardTitle>
                <CardDescription>Data-driven analysis of which card wins</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Exact Math Breakdown */}
            <div className="glass p-6 rounded-xl space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Year 1 Value Comparison
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1 Math */}
                <div className="space-y-3">
                  <div className="font-semibold text-primary">{card1.name}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Welcome Bonus:</span>
                      <span className="font-mono">+{card1BonusValue.toLocaleString()} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annual Fee:</span>
                      <span className="font-mono text-destructive">-${Number(card1.annualFee).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Multiplier:</span>
                      <span className="font-mono">{card1AvgMultiplier.toFixed(2)}x</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                      <span>Net Value (Year 1):</span>
                      <span className="text-primary">
                        {card1BonusValue.toLocaleString()} pts - ${Number(card1.annualFee).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2 Math */}
                <div className="space-y-3">
                  <div className="font-semibold text-cyan-400">{card2.name}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Welcome Bonus:</span>
                      <span className="font-mono">+{card2BonusValue.toLocaleString()} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annual Fee:</span>
                      <span className="font-mono text-destructive">-${Number(card2.annualFee).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Multiplier:</span>
                      <span className="font-mono">{card2AvgMultiplier.toFixed(2)}x</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                      <span>Net Value (Year 1):</span>
                      <span className="text-cyan-400">
                        {card2BonusValue.toLocaleString()} pts - ${Number(card2.annualFee).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Winners */}
            <div className="prose prose-invert max-w-none">
              <h4 className="font-semibold text-lg mb-4">Category-by-Category Winners:</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["GROCERY", "DINING", "GAS", "TRAVEL"].map((category: string) => {
                  const card1Mult = card1.multipliers.find((m: CardMultiplier) => m.category === category)
                  const card2Mult = card2.multipliers.find((m: CardMultiplier) => m.category === category)
                  const card1Rate = card1Mult ? Number(card1Mult.multiplierValue) : 1
                  const card2Rate = card2Mult ? Number(card2Mult.multiplierValue) : 1
                  const winner = card1Rate > card2Rate ? card1.name : card2Rate > card1Rate ? card2.name : "Tie"
                  
                  return (
                    <div key={category} className="glass p-3 rounded-lg flex items-center justify-between">
                      <span className="text-sm capitalize">{category.toLowerCase()}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{card1Rate}x vs {card2Rate}x</span>
                        {winner !== "Tie" && (
                          <Badge variant="outline" className="text-xs">
                            {winner.split(" ")[0]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 p-4 glass-premium rounded-xl">
                <p className="text-base leading-relaxed mb-4">
                  <strong className="text-primary">Bottom Line:</strong> {card1BonusValue > card2BonusValue ? card1.name : card2.name} wins 
                  on welcome bonus with {bonusDiff.toLocaleString()} more points. However, {card1AvgMultiplier > card2AvgMultiplier ? card1.name : card2.name} has 
                  the higher average earning rate at {Math.max(card1AvgMultiplier, card2AvgMultiplier).toFixed(2)}x vs {Math.min(card1AvgMultiplier, card2AvgMultiplier).toFixed(2)}x.
                </p>
                <p className="text-sm text-muted-foreground">
                  For most people, the {card1BonusValue > card2BonusValue ? card1.name : card2.name} offers better first-year value, 
                  but long-term value depends on your spending patterns in specific categories.
                </p>
              </div>
            </div>

            {/* Prominent Affiliate CTAs */}
            <div className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={card1AffiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-card-id={card1.id}
                  data-card-name={card1.name}
                  data-position="verdict_primary"
                  className="affiliate-link flex-1 h-16 text-lg font-bold bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-[#090A0F] rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)]"
                >
                  <Gift className="h-5 w-5" />
                  Apply for {card1.name.split(" ")[0]} Now
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href={card2AffiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-card-id={card2.id}
                  data-card-name={card2.name}
                  data-position="verdict_secondary"
                  className="affiliate-link flex-1 h-16 text-lg font-bold border-2 border-primary/50 hover:bg-primary/10 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
                >
                  <Gift className="h-5 w-5" />
                  Apply for {card2.name.split(" ")[0]} Now
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              
              {/* FTC Compliance Disclaimer */}
              <div className="flex items-start gap-2 p-3 glass rounded-lg border border-white/5">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Affiliate Disclosure:</strong> We may earn a commission if you apply for a credit card through our links. 
                  This comes at no cost to you and helps us keep this comparison tool free. Our recommendations are based on data analysis 
                  and are not influenced by commission rates. Please review terms and conditions before applying.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Summary */}
        {aiVerdict && (
          <Card className="glass-card border-primary/20 mb-8 max-w-5xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl md:text-2xl">Expert Context</CardTitle>
                  <CardDescription>Additional insights to help you decide</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-invert prose-cyan max-w-none prose-headings:text-foreground prose-headings:font-semibold prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-ul:text-muted-foreground prose-li:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: aiVerdict }}
              />
            </CardContent>
          </Card>
        )}

        {/* Key Differences Summary */}
        <Card className="glass-card border-primary/20 mb-12 max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Key Differences</CardTitle>
            <CardDescription>What matters most when choosing between these cards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bonus Comparison */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                Welcome Bonus
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">{card1.name.split(" ")[0]}</div>
                  <div className="text-2xl font-bold mb-2">{card1BonusValue.toLocaleString()} points</div>
                  <div className="text-xs text-muted-foreground">
                    Spend ${Number(card1.bonuses[0]?.minimumSpendAmount || 0).toLocaleString()} in {card1.bonuses[0]?.spendPeriodMonths || 0} months
                  </div>
                </div>
                <div className="glass p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">{card2.name.split(" ")[0]}</div>
                  <div className="text-2xl font-bold mb-2">{card2BonusValue.toLocaleString()} points</div>
                  <div className="text-xs text-muted-foreground">
                    Spend ${Number(card2.bonuses[0]?.minimumSpendAmount || 0).toLocaleString()} in {card2.bonuses[0]?.spendPeriodMonths || 0} months
                  </div>
                </div>
              </div>
              {card1BonusValue !== card2BonusValue && (
                <p className="text-sm text-muted-foreground">
                  {card1BonusValue > card2BonusValue ? card1.name : card2.name} offers a larger welcome bonus 
                  ({bonusDiff.toLocaleString()} more points), which can provide significant first-year value.
                </p>
              )}
            </div>

            {/* Fee Comparison */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Annual Fee
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">{card1.name.split(" ")[0]}</div>
                  <div className="text-2xl font-bold">${Number(card1.annualFee).toFixed(0)}</div>
                </div>
                <div className="glass p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">{card2.name.split(" ")[0]}</div>
                  <div className="text-2xl font-bold">${Number(card2.annualFee).toFixed(0)}</div>
                </div>
              </div>
              {Number(card1.annualFee) !== Number(card2.annualFee) && (
                <p className="text-sm text-muted-foreground">
                  {Number(card1.annualFee) < Number(card2.annualFee) ? card1.name : card2.name} has a lower annual fee, 
                  saving ${annualFeeDiff.toFixed(0)} per year.
                </p>
              )}
            </div>

            {/* Category Strengths */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Category Strengths
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["GROCERY", "DINING", "GAS", "TRAVEL"].map((category: string) => {
                  const card1Mult = card1.multipliers.find((m: CardMultiplier) => m.category === category)
                  const card2Mult = card2.multipliers.find((m: CardMultiplier) => m.category === category)
                  const card1Rate = card1Mult ? Number(card1Mult.multiplierValue) : 1
                  const card2Rate = card2Mult ? Number(card2Mult.multiplierValue) : 1
                  
                  return (
                    <div key={category} className="glass p-3 rounded-lg flex items-center justify-between">
                      <span className="text-sm capitalize">{category.toLowerCase()}</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm ${card1Rate > card2Rate ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                          {card1Rate}x
                        </span>
                        <span className="text-xs text-muted-foreground">vs</span>
                        <span className={`text-sm ${card2Rate > card1Rate ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                          {card2Rate}x
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-sm text-muted-foreground">
                {card1AvgMultiplier > card2AvgMultiplier ? card1.name : card2.name} has stronger average earning rates 
                ({Math.max(card1AvgMultiplier, card2AvgMultiplier).toFixed(1)}x vs {Math.min(card1AvgMultiplier, card2AvgMultiplier).toFixed(1)}x) 
                across bonus categories, which matters more for long-term value.
              </p>
            </div>

            {/* Bottom Line */}
            <div className="p-4 glass-premium rounded-xl border border-primary/20">
              <h4 className="font-semibold mb-3">Which card is right for you?</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Consider {card1BonusValue > card2BonusValue ? card1.name : card2.name}</strong> if you want 
                  the larger welcome bonus and can meet the spending requirement.
                </p>
                <p>
                  <strong className="text-foreground">Consider {card1AvgMultiplier > card2AvgMultiplier ? card1.name : card2.name}</strong> if you 
                  prioritize ongoing earning rates in your top spending categories.
                </p>
                <p>
                  <strong className="text-foreground">Consider {Number(card1.annualFee) < Number(card2.annualFee) ? card1.name : card2.name}</strong> if 
                  minimizing annual fees is important to you.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application CTAs */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card border-primary/20">
              <CardContent className="py-6">
                <h3 className="text-lg font-semibold mb-2">{card1.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {card1BonusValue.toLocaleString()} point bonus • ${Number(card1.annualFee).toFixed(0)} annual fee
                </p>
                <a
                  href={card1AffiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-card-id={card1.id}
                  data-card-name={card1.name}
                  data-position="bottom_cta"
                  className="affiliate-link block w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center justify-center gap-2 transition-all font-medium"
                >
                  View Application
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardContent className="py-6">
                <h3 className="text-lg font-semibold mb-2">{card2.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {card2BonusValue.toLocaleString()} point bonus • ${Number(card2.annualFee).toFixed(0)} annual fee
                </p>
                <a
                  href={card2AffiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-card-id={card2.id}
                  data-card-name={card2.name}
                  data-position="bottom_cta"
                  className="affiliate-link block w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center justify-center gap-2 transition-all font-medium"
                >
                  View Application
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Affiliate Disclosure */}
          <div className="mt-6 flex items-start gap-2 p-4 glass rounded-lg border border-white/5">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Disclosure:</strong> We may earn a commission if you apply through our links at no cost to you. 
              This helps us maintain this free comparison tool. Our analysis is based on publicly available card data 
              and is not influenced by affiliate relationships. Please review current terms on the issuer's website before applying.
            </p>
          </div>
        </div>

        {/* Explore More */}
        <div className="text-center max-w-3xl mx-auto">
          <Card className="glass-card border-primary/20">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-4">Still Not Sure?</h3>
              <p className="text-muted-foreground mb-6">
                Compare more cards or explore our full card database to find the perfect match for your spending
              </p>
              <Button size="lg" className="h-12 px-8" asChild>
                <a href="/compare">
                  Compare More Cards
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Legal Footer */}
        <div className="text-center max-w-4xl mx-auto mt-8 pt-6 border-t border-white/5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Card terms and conditions apply. Information is accurate as of publication date. 
            Please verify current offers and details on the issuer's website before applying.
          </p>
        </div>
      </div>
    </div>
  )
}

// Individual card component for side-by-side display
function ComparisonCard({ 
  card, 
  affiliateUrl,
  onAffiliateClick
}: { 
  card: PrismaCard & { bonuses: CardBonus[]; multipliers: CardMultiplier[] }
  affiliateUrl: string
  onAffiliateClick: () => void
}) {
  const bonus = card.bonuses[0]
  const topMultipliers = card.multipliers
    .sort((a: CardMultiplier, b: CardMultiplier) => Number(b.multiplierValue) - Number(a.multiplierValue))
    .slice(0, 4)

  return (
    <Card className="glass-card relative">
      
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{card.name}</CardTitle>
            <CardDescription className="text-base">{card.bank}</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">{card.network}</Badge>
        </div>
        
        {/* Annual Fee */}
        <div className="flex items-center justify-between py-4 border-y border-white/10">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Annual Fee</span>
          </div>
          <span className="text-3xl font-bold">${Number(card.annualFee).toFixed(0)}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Welcome Bonus */}
        {bonus && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Gift className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-base">Welcome Bonus</h4>
            </div>
            <div className="glass-premium p-5 rounded-xl">
              <div className="text-4xl font-bold text-gradient-teal mb-2">
                {bonus.bonusPoints.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                {bonus.pointType.replace(/_/g, " ")} points
              </div>
              <div className="text-xs text-muted-foreground bg-white/5 p-2 rounded">
                Spend ${Number(bonus.minimumSpendAmount).toLocaleString()} in {bonus.spendPeriodMonths} months
              </div>
            </div>
          </div>
        )}

        {/* Earning Rates */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-base">Top Earning Rates</h4>
          </div>
          <div className="space-y-3">
            {topMultipliers.map((mult: CardMultiplier, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm glass p-3 rounded-lg">
                <span className="text-muted-foreground capitalize">{mult.category.toLowerCase()}</span>
                <span className="font-bold text-primary text-base">{Number(mult.multiplierValue)}x points</span>
              </div>
            ))}
          </div>
        </div>

        {/* View Details Link */}
        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-card-id={card.id}
          data-card-name={card.name}
          data-position="side_by_side"
          className="affiliate-link block w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center justify-center gap-2 transition-all font-medium"
        >
          View Card Details
          <ExternalLink className="h-4 w-4" />
        </a>
      </CardContent>
    </Card>
  )
}
