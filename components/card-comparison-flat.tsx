'use client'

import { useState, useEffect } from 'react'
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
  Calculator,
  ChevronDown,
  ChevronUp,
  ArrowLeftRight,
  Brain,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'

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
  initialVerdict?: string | null
}

export function CardComparison({ card1, card2, initialVerdict }: CardComparisonProps) {
  const [spending, setSpending] = useState({
    grocery: 1200,
    gas: 300,
    dining: 600,
    bills: 500,
  })
  // Draft holds raw input strings so typing doesn't trigger mid-value recalcs
  const [draft, setDraft] = useState({
    grocery: '1200',
    gas: '300',
    dining: '600',
    bills: '500',
  })
  const [spendingOpen, setSpendingOpen] = useState(false)
  
  // AI Verdict state - initialize with server-side data
  const [aiVerdict, setAiVerdict] = useState<string | null>(initialVerdict || null)
  const [verdictLoading, setVerdictLoading] = useState(!initialVerdict)
  const [verdictError, setVerdictError] = useState<string | null>(null)

  // Fetch AI verdict on mount (only if not provided by server)
  useEffect(() => {
    // Skip if we already have verdict from server
    if (initialVerdict) {
      return
    }

    const fetchVerdict = async () => {
      try {
        setVerdictLoading(true)
        setVerdictError(null)
        const slug = `${card1.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-vs-${card2.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
        
        const response = await fetch('/api/comparison-verdict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            card1: {
              id: card1.id,
              name: card1.name,
              bank: card1.bank,
              annualFee: card1.annualFee,
              bonuses: [{
                bonusPoints: card1.welcomeBonusValue,
                pointType: 'points',
                minimumSpendAmount: 0,
                spendPeriodMonths: 3
              }],
              multipliers: [
                { category: 'GROCERY', multiplierValue: card1.groceryMultiplier },
                { category: 'GAS', multiplierValue: card1.gasMultiplier },
                { category: 'DINING', multiplierValue: card1.diningMultiplier },
                { category: 'RECURRING', multiplierValue: card1.billsMultiplier },
              ]
            },
            card2: {
              id: card2.id,
              name: card2.name,
              bank: card2.bank,
              annualFee: card2.annualFee,
              bonuses: [{
                bonusPoints: card2.welcomeBonusValue,
                pointType: 'points',
                minimumSpendAmount: 0,
                spendPeriodMonths: 3
              }],
              multipliers: [
                { category: 'GROCERY', multiplierValue: card2.groceryMultiplier },
                { category: 'GAS', multiplierValue: card2.gasMultiplier },
                { category: 'DINING', multiplierValue: card2.diningMultiplier },
                { category: 'RECURRING', multiplierValue: card2.billsMultiplier },
              ]
            },
            slug
          })
        })

        const data = await response.json()
        
        // Handle rate limit
        if (response.status === 429) {
          setVerdictError(data.message || 'Too many requests. Please try again later.')
          return
        }
        
        if (data.success && data.verdict) {
          setAiVerdict(data.verdict)
        } else {
          setVerdictError(data.error || 'Failed to generate verdict')
        }
      } catch (error) {
        console.error('Error fetching verdict:', error)
        setVerdictError('Failed to load AI verdict. Please try again later.')
      } finally {
        setVerdictLoading(false)
      }
    }

    fetchVerdict()
  }, [card1, card2, initialVerdict])

  const commitDraft = (key: keyof typeof spending) => {
    const val = Math.max(0, Number(draft[key]) || 0)
    setDraft(d => ({ ...d, [key]: String(val) }))
    setSpending(s => ({ ...s, [key]: val }))
  }

  const isBest = (a: number, b: number, lowerIsBetter = false) =>
    lowerIsBetter ? a < b : a > b

  const calc = (card: CreditCardData) => {
    const g = spending.grocery * 12 * card.groceryMultiplier
    const f = spending.gas * 12 * card.gasMultiplier
    const d = spending.dining * 12 * card.diningMultiplier
    const b = spending.bills * 12 * card.billsMultiplier
    const cat = g + f + d + b
    return { g, f, d, b, cat, net: cat + card.welcomeBonusValue - card.annualFee }
  }

  const c1 = calc(card1)
  const c2 = calc(card2)
  const c1Wins = c1.net >= c2.net
  const winner = c1Wins ? card1 : card2
  const diff = Math.abs(c1.net - c2.net).toFixed(0)

  const metrics = [
    {
      label: 'Annual Fee',
      icon: <DollarSign className="h-4 w-4" />,
      v1: `$${card1.annualFee}`,
      v2: `$${card2.annualFee}`,
      w1: isBest(card1.annualFee, card2.annualFee, true),
      w2: isBest(card2.annualFee, card1.annualFee, true),
    },
    {
      label: 'Welcome Bonus',
      icon: <Award className="h-4 w-4" />,
      v1: `$${card1.welcomeBonusValue}`,
      v2: `$${card2.welcomeBonusValue}`,
      w1: isBest(card1.welcomeBonusValue, card2.welcomeBonusValue),
      w2: isBest(card2.welcomeBonusValue, card1.welcomeBonusValue),
    },
    {
      label: 'Base Rate',
      icon: <TrendingUp className="h-4 w-4" />,
      v1: `${(card1.baseRewardRate * 100).toFixed(1)}%`,
      v2: `${(card2.baseRewardRate * 100).toFixed(1)}%`,
      w1: isBest(card1.baseRewardRate, card2.baseRewardRate),
      w2: isBest(card2.baseRewardRate, card1.baseRewardRate),
    },
    {
      label: 'Grocery',
      icon: <ShoppingCart className="h-4 w-4" />,
      v1: `${(card1.groceryMultiplier * 100).toFixed(1)}%`,
      v2: `${(card2.groceryMultiplier * 100).toFixed(1)}%`,
      w1: isBest(card1.groceryMultiplier, card2.groceryMultiplier),
      w2: isBest(card2.groceryMultiplier, card1.groceryMultiplier),
    },
    {
      label: 'Gas',
      icon: <Fuel className="h-4 w-4" />,
      v1: `${(card1.gasMultiplier * 100).toFixed(1)}%`,
      v2: `${(card2.gasMultiplier * 100).toFixed(1)}%`,
      w1: isBest(card1.gasMultiplier, card2.gasMultiplier),
      w2: isBest(card2.gasMultiplier, card1.gasMultiplier),
    },
    {
      label: 'Dining',
      icon: <UtensilsCrossed className="h-4 w-4" />,
      v1: `${(card1.diningMultiplier * 100).toFixed(1)}%`,
      v2: `${(card2.diningMultiplier * 100).toFixed(1)}%`,
      w1: isBest(card1.diningMultiplier, card2.diningMultiplier),
      w2: isBest(card2.diningMultiplier, card1.diningMultiplier),
    },
    {
      label: 'Bills',
      icon: <Smartphone className="h-4 w-4" />,
      v1: `${(card1.billsMultiplier * 100).toFixed(1)}%`,
      v2: `${(card2.billsMultiplier * 100).toFixed(1)}%`,
      w1: isBest(card1.billsMultiplier, card2.billsMultiplier),
      w2: isBest(card2.billsMultiplier, card1.billsMultiplier),
    },
  ]

  return (
    <div className="container mx-auto px-4 pb-24 md:pb-12 space-y-6 max-w-5xl">

      {/* ── Hero: card images + verdict ── */}
      <Card className="glass-premium border-primary/20">
        <CardContent className="p-6 md:p-8">
          {/* Images row */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 items-center mb-6">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-full aspect-[1.586/1] max-w-[220px] md:max-w-[280px]">
                <img
                  src={card1.image || '/images/placeholder-card.svg'}
                  alt={card1.name}
                  className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm md:text-base leading-tight">{card1.name}</p>
                <p className="text-xs text-muted-foreground">{card1.bank}</p>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-cyan-400 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-2xl">
                  <span className="text-lg md:text-2xl font-black text-[#090A0F]">VS</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="relative w-full aspect-[1.586/1] max-w-[220px] md:max-w-[280px]">
                <img
                  src={card2.image || '/images/placeholder-card.svg'}
                  alt={card2.name}
                  className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm md:text-base leading-tight">{card2.name}</p>
                <p className="text-xs text-muted-foreground">{card2.bank}</p>
              </div>
            </div>
          </div>

          {/* Verdict banner — visible above the fold */}
          <div className="rounded-xl bg-gradient-to-r from-cyan-500/10 via-primary/10 to-cyan-500/10 border border-cyan-400/30 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Award className="h-5 w-5 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">Best Value</span>
            </div>
            <p className="font-bold text-lg md:text-xl">
              {winner.name} wins by <span className="text-cyan-400">${diff}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on your spending — adjust below to personalise
            </p>
          </div>

          {/* AI Expert Verdict */}
          <div className="mt-4 rounded-xl relative overflow-hidden border border-purple-400/40 p-4 bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-cyan-900/20">
            {/* Animated AI background effects */}
            <div className="absolute inset-0 -z-0">
              <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
              {/* Circuit pattern overlay */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(168, 85, 247, 0.4) 1px, transparent 0)`,
                backgroundSize: '32px 32px'
              }} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/30 rounded-lg blur-md animate-pulse" />
                  <div className="relative p-1.5 rounded-lg bg-gradient-to-br from-purple-500/30 to-cyan-500/30 backdrop-blur-sm">
                    <Brain className="h-4 w-4 text-purple-300" />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 uppercase tracking-wide">
                    AI Expert Analysis
                  </span>
                </div>
              </div>
              
              {verdictLoading && (
                <div className="flex items-center gap-2 text-sm text-purple-300/80 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing cards...</span>
                </div>
              )}

              {verdictError && (
                <div className="space-y-2">
                  <p className="text-xs text-red-400/80">{verdictError}</p>
                  {/* Fallback content */}
                  <div className="mt-3 pt-3 border-t border-purple-400/20">
                    <p className="text-sm text-gray-400">
                      Compare the cards above to see which offers better value for your spending habits. 
                      Consider annual fees, welcome bonuses, and category multipliers that match your lifestyle.
                    </p>
                  </div>
                </div>
              )}

              {aiVerdict && !verdictLoading && (
                <div className="text-sm text-gray-300 leading-relaxed">
                  {aiVerdict.split('\n\n').map((paragraph, idx) => {
                    // Check if this is the "Winner:" line
                    if (paragraph.startsWith('Winner:')) {
                      const winnerName = paragraph.replace('Winner:', '').trim()
                      return (
                        <div key={idx} className="mt-3 pt-3 border-t border-purple-400/30">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-purple-400" />
                            <span className="text-purple-300 text-xs font-semibold">AI Verdict: </span>
                          </div>
                          <p className="font-bold text-base text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-cyan-200 mt-1">
                            {winnerName}
                          </p>
                        </div>
                      )
                    }
                    return <p key={idx} className="text-gray-300">{paragraph}</p>
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Sticky spending panel (desktop) / collapsible (mobile) ── */}
      <div className="md:sticky md:top-16 z-30">
        <Card className="glass-premium border-primary/30 bg-gradient-to-br from-cyan-500/10 via-primary/5 to-transparent backdrop-blur-md">
          <CardContent className="p-4 md:p-5">
            {/* Mobile toggle */}
            <button
              className="flex md:hidden w-full items-center justify-between"
              onClick={() => setSpendingOpen(v => !v)}
            >
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Customize Spending</span>
              </div>
              {spendingOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {/* Desktop label */}
            <div className="hidden md:flex items-center gap-2 mb-4">
              <Calculator className="h-4 w-4 text-primary" />
              <span className="font-semibold">Monthly Spending</span>
              <span className="text-xs text-muted-foreground ml-1">— all calculations update live</span>
            </div>

            <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 md:mt-0 ${!spendingOpen ? 'hidden md:grid' : 'grid'}`}>
              {[
                { key: 'grocery', label: 'Grocery', icon: <ShoppingCart className="h-3 w-3" /> },
                { key: 'gas', label: 'Gas', icon: <Fuel className="h-3 w-3" /> },
                { key: 'dining', label: 'Dining', icon: <UtensilsCrossed className="h-3 w-3" /> },
                { key: 'bills', label: 'Bills', icon: <Smartphone className="h-3 w-3" /> },
              ].map(({ key, label, icon }) => (
                <div key={key}>
                  <Label htmlFor={key} className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    {icon} {label}
                  </Label>
                  <Input
                    id={key}
                    type="number"
                    value={draft[key as keyof typeof draft]}
                    onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                    className="glass-premium border-primary/20 h-8 text-sm"
                  />
                </div>
              ))}
            </div>
            <div className={`mt-3 flex justify-end ${!spendingOpen ? 'hidden md:flex' : 'flex'}`}>
              <Button
                size="sm"
                onClick={() => (['grocery', 'gas', 'dining', 'bills'] as const).forEach(k => commitDraft(k))}
                className="bg-gradient-to-r from-primary to-cyan-400 text-[#090A0F] font-semibold h-8 px-4 text-xs"
              >
                <Calculator className="h-3.5 w-3.5 mr-1.5" />
                Update Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Net value cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { card: card1, c: c1, wins: c1Wins },
          { card: card2, c: c2, wins: !c1Wins },
        ].map(({ card, c, wins }) => (
          <Card
            key={card.id}
            className={`glass-premium transition-all overflow-hidden relative ${wins 
              ? 'border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.5)]' 
              : 'border-white/10 opacity-80'}`}
          >
            {/* Galactic background for winner */}
            {wins && (
              <div className="absolute inset-0 -z-0 overflow-hidden rounded-xl">
                <div className="absolute -top-8 -left-8 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl animate-[galactic-orb1_8s_ease-in-out_infinite]" />
                <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-[galactic-orb2_10s_ease-in-out_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-[galactic-orb3_12s_ease-in-out_infinite]" />
              </div>
            )}
            <CardContent className="p-5 relative z-10">
              {wins && (
                <div className="flex items-center justify-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-cyan-400/20 border border-cyan-400/40">
                  <Award className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">Best Value</span>
                </div>
              )}
              <h3 className={`font-bold text-base text-center mb-4 ${wins ? 'text-white' : 'text-muted-foreground'}`}>{card.name}</h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category Earnings</span>
                  <span className="font-semibold text-green-400">+${c.cat.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Welcome Bonus</span>
                  <span className="font-semibold text-green-400">+${card.welcomeBonusValue}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Annual Fee</span>
                  <span className="font-semibold text-red-400">-${card.annualFee}</span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div className="flex justify-between items-center">
                  <span className="font-bold">Net Value</span>
                  <span className={`text-2xl font-bold ${wins ? 'text-cyan-400' : 'text-primary'}`}>
                    ${c.net.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-1.5 pt-3 border-t border-white/10 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Earnings breakdown</p>
                {[
                  { icon: <ShoppingCart className="h-3 w-3" />, label: 'Grocery', val: c.g },
                  { icon: <Fuel className="h-3 w-3" />, label: 'Gas', val: c.f },
                  { icon: <UtensilsCrossed className="h-3 w-3" />, label: 'Dining', val: c.d },
                  { icon: <Smartphone className="h-3 w-3" />, label: 'Bills', val: c.b },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">{icon} {label}</span>
                    <span>${val.toFixed(0)}</span>
                  </div>
                ))}
              </div>

              <Button
                asChild
                className="w-full bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-[#090A0F] font-semibold"
              >
                <a href={`/go/${card.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`} target="_blank" rel="noopener noreferrer">
                  Apply Now <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Metrics table ── */}
      <Card className="glass-premium border-primary/20">
        <CardContent className="p-0">
          {/* Mobile: card-based rows */}
          <div className="md:hidden divide-y divide-white/5">
            {metrics.map(({ label, icon, v1, v2, w1, w2 }) => (
              <div key={label} className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
                  {icon} <span className="font-medium text-foreground">{label}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`rounded-lg p-3 text-center ${w1 ? 'bg-cyan-400/10 border border-cyan-400/30' : 'bg-white/[0.03] border border-white/5'}`}>
                    <p className="text-xs text-muted-foreground mb-1 truncate">{card1.name.split(' ').slice(0, 2).join(' ')}</p>
                    <p className={`font-bold text-base ${w1 ? 'text-cyan-400' : ''}`}>{v1}</p>
                    {w1 && <p className="text-[10px] text-cyan-400 mt-0.5">✓ Better</p>}
                  </div>
                  <div className={`rounded-lg p-3 text-center ${w2 ? 'bg-cyan-400/10 border border-cyan-400/30' : 'bg-white/[0.03] border border-white/5'}`}>
                    <p className="text-xs text-muted-foreground mb-1 truncate">{card2.name.split(' ').slice(0, 2).join(' ')}</p>
                    <p className={`font-bold text-base ${w2 ? 'text-cyan-400' : ''}`}>{v2}</p>
                    {w2 && <p className="text-[10px] text-cyan-400 mt-0.5">✓ Better</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground w-1/3">Feature</th>
                  <th className="text-center p-4 text-sm font-semibold">{card1.name}</th>
                  <th className="text-center p-4 text-sm font-semibold">{card2.name}</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map(({ label, icon, v1, v2, w1, w2 }) => (
                  <tr key={label} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {icon} <span className="font-medium text-foreground">{label}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={w1 ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>{v1}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={w2 ? 'text-cyan-400 font-bold text-lg' : 'text-lg'}>{v2}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Formula note ── */}
      <div className="p-4 rounded-lg glass-premium border border-primary/20 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">How net value is calculated</span>
        </div>
        <p className="font-mono text-xs text-primary">Net Value = Category Earnings + Welcome Bonus − Annual Fee</p>
        <p className="text-xs mt-1">Category earnings = annual spend per category × reward rate. First-year estimate.</p>
      </div>

      {/* ── Compare different cards link ── */}
      <div className="text-center">
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Compare different cards
        </Link>
      </div>

      {/* ── Mobile sticky CTA footer ── */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 p-3 bg-[#090A0F]/90 backdrop-blur-md border-t border-white/10">
        <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
          <Button asChild size="sm" className="bg-gradient-to-r from-primary to-cyan-400 text-[#090A0F] font-semibold">
            <a href={`/go/${card1.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`} target="_blank" rel="noopener noreferrer">
              Apply: {card1.name.split(' ')[0]}
            </a>
          </Button>
          <Button asChild size="sm" className="bg-gradient-to-r from-primary to-cyan-400 text-[#090A0F] font-semibold">
            <a href={`/go/${card2.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`} target="_blank" rel="noopener noreferrer">
              Apply: {card2.name.split(' ')[0]}
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

