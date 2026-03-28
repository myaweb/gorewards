import { prisma } from "@/lib/prisma"
import { CardsList } from "@/components/cards-list"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Canadian Credit Cards | CreditRich",
  description: "Browse 38+ Canadian credit cards. Filter by network, annual fee, and rewards program to find the best card for you.",
}

export default async function CardsPage() {
  const rawCards = await prisma.card.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      bank: true,
      network: true,
      annualFee: true,
      slug: true,
      imageUrl: true,
      bonuses: {
        where: { isActive: true },
        select: { pointType: true, bonusPoints: true, estimatedValue: true },
        orderBy: { estimatedValue: "desc" },
        take: 1,
      },
      multipliers: {
        where: { isActive: true },
        select: { category: true, multiplierValue: true },
      },
    },
  })

  const cards = rawCards.map((c) => ({
    ...c,
    annualFee: parseFloat(c.annualFee.toString()),
    bonuses: c.bonuses.map((b) => ({
      ...b,
      estimatedValue: b.estimatedValue ? parseFloat(b.estimatedValue.toString()) : null,
    })),
    multipliers: c.multipliers.map((m) => ({
      ...m,
      multiplierValue: parseFloat(m.multiplierValue.toString()),
    })),
  }))

  return (
    <div className="min-h-screen pt-2 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8 text-muted-foreground">
          <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white font-medium">Cards</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="text-white">Canadian </span>
            <span className="text-cyan-500">Credit Cards</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Browse {cards.length}+ cards from TD, RBC, CIBC, Scotiabank, BMO, Amex and more. Filter by network, fee, or rewards program.
          </p>
        </div>

        <CardsList cards={cards} />
      </div>
    </div>
  )
}
