import { CompareSelector } from '@/components/compare-selector'
import { ScrollToCompare } from '@/components/scroll-to-compare'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export const metadata = {
  title: 'Compare Credit Cards | GoRewards',
  description: 'Compare 2 Canadian credit cards side-by-side. See annual fees, rewards rates, welcome bonuses, and find the best card for your spending.',
}

export default async function ComparePage() {
  // Fetch all credit cards from the Card table (normalized model)
  const rawCards = await prisma.card.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      bank: true,
      network: true,
      annualFee: true,
      imageUrl: true,
      affiliateLink: true,
      baseRewardRate: true,
      multipliers: {
        where: { isActive: true },
        select: {
          category: true,
          multiplierValue: true
        }
      },
      bonuses: {
        where: { isActive: true },
        take: 1,
        select: {
          pointType: true,
          bonusPoints: true,
          estimatedValue: true
        }
      }
    }
  })

  // Convert Decimal types to numbers for the component
  const cards = rawCards.map(card => ({
    ...card,
    annualFee: parseFloat(card.annualFee.toString()),
    baseRewardRate: parseFloat(card.baseRewardRate.toString()),
    multipliers: card.multipliers.map(m => ({
      ...m,
      multiplierValue: parseFloat(m.multiplierValue.toString())
    }))
  }))

  return (
    <div className="min-h-screen pt-2 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm mb-8 text-muted-foreground">
          <Link 
            href="/" 
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Compare Cards</span>
        </nav>

        {/* Page Header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Compare Canadian Credit Cards
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Make informed decisions with side-by-side comparisons of annual fees, 
            rewards rates, welcome bonuses, and category multipliers.
          </p>
        </div>

        {/* Compare Tool Integration */}
        <ScrollToCompare />
        <div id="compare-tool" className="max-w-6xl mx-auto mb-8">
          <CompareSelector cards={cards} />
        </div>

        {/* Trust Indicators - Right after compare tool */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="glass-premium border border-primary/10 rounded-lg p-2 md:p-4">
              <div className="text-lg md:text-2xl font-bold text-primary mb-0.5">{cards.length}+</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">Canadian Cards</div>
            </div>
            <div className="glass-premium border border-primary/10 rounded-lg p-2 md:p-4">
              <div className="text-lg md:text-2xl font-bold text-primary mb-0.5">Side-by-Side</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">Detailed Analysis</div>
            </div>
            <div className="glass-premium border border-primary/10 rounded-lg p-2 md:p-4">
              <div className="text-lg md:text-2xl font-bold text-primary mb-0.5">Real-Time</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">Updated Data</div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-premium border border-primary/20 rounded-lg p-6">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Fees & First-Year Value</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Compare annual fees, welcome bonuses, and net value calculations for your first year.
            </p>
          </div>

          <div className="glass-premium border border-primary/20 rounded-lg p-6">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Category Rewards</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              See earning rates across dining, travel, groceries, gas, and recurring bills.
            </p>
          </div>

          <div className="glass-premium border border-primary/20 rounded-lg p-6">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Spending-Based Analysis</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Adjust your spending to see which card delivers better value for your lifestyle.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

