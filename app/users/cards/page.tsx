import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserCardPortfolio } from '@/components/user-card-portfolio'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight, CreditCard, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function CardsPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Fetch user's card data for summary
  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: user.id },
    include: {
      userCards: {
        where: { isActive: true },
        include: {
          bonusProgresses: {
            where: { isCompleted: false },
          },
        },
      },
    },
  })

  const totalCards = dbUser?.userCards?.length || 0
  const activeBonuses = dbUser?.userCards?.reduce(
    (sum: number, card: any) => sum + (card.bonusProgresses?.length || 0),
    0
  ) || 0

  return (
    <div className="min-h-screen pt-2 pb-12">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link 
            href="/users" 
            className="hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Card Portfolio</span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-3">
            Card Portfolio
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Manage your credit cards, track signup bonuses, and monitor annual fee dates. 
            Keep your portfolio organized for optimal reward optimization.
          </p>
        </div>

        {/* Main Portfolio Component */}
        <UserCardPortfolio />
      </div>
    </div>
  )
}

