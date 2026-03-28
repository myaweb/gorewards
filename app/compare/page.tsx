import { CompareSelector } from '@/components/compare-selector'
import { ScrollToCompare } from '@/components/scroll-to-compare'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export const metadata = {
  title: 'Compare Credit Cards | CreditRich',
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

        {/* Trust Indicators */}
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

        {/* Compare Tool Integration */}
        <ScrollToCompare />
        <div id="compare-tool" className="max-w-6xl mx-auto">
          <CompareSelector cards={cards} />
        </div>
      </div>
    </div>
  )
}
