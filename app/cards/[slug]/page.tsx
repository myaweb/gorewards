import { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Gift, 
  ExternalLink,
  Sparkles,
  CheckCircle2,
  ArrowRight
} from "lucide-react"
import { CardImage } from "@/components/card-image"
import Link from "next/link"

// Determine if card earns cashback or points based on bonus point type
function isCashbackCard(bonuses: any[]): boolean {
  return bonuses.some((b) => b.pointType === 'CASHBACK')
}

interface CardPageProps {
  params: {
    slug: string
  }
}

// Helper to convert slug to card name pattern
function slugToNamePattern(slug: string): string[] {
  const bankAliases: Record<string, string[]> = {
    'amex': ['American Express', 'Amex'],
    'american': ['American Express', 'Amex'],
    'express': ['American Express', 'Amex'],
    'td': ['TD', 'TD Bank'],
    'cibc': ['CIBC'],
    'scotiabank': ['Scotiabank', 'Scotia'],
    'rbc': ['RBC', 'Royal Bank'],
    'bmo': ['BMO', 'Bank of Montreal'],
  }
  
  const words = slug.split("-")
  const patterns: string[] = []
  
  for (const word of words) {
    const lowerWord = word.toLowerCase()
    if (bankAliases[lowerWord]) {
      return bankAliases[lowerWord]
    }
  }
  
  patterns.push(
    words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  )
  
  return patterns
}

// Helper to create slug from card name
function createSlug(cardName: string): string {
  return cardName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Generate static params for all cards
export async function generateStaticParams() {
  const cards = await prisma.card.findMany({
    where: { isActive: true },
    select: { name: true }
  })
  
  return cards.map((card: { name: string }) => ({
    slug: createSlug(card.name)
  }))
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: CardPageProps): Promise<Metadata> {
  const namePatterns = slugToNamePattern(params.slug)

  const card = await prisma.card.findFirst({
    where: { 
      OR: namePatterns.map(pattern => ({
        name: { contains: pattern, mode: 'insensitive' }
      })),
      isActive: true 
    },
    include: {
      bonuses: { where: { isActive: true }, take: 1 },
      multipliers: { where: { isActive: true } }
    }
  })

  if (!card) {
    return {
      title: "Card Not Found",
      description: "The requested credit card could not be found.",
    }
  }

  const bonus = card.bonuses[0]
  const bonusText = bonus 
    ? `${bonus.bonusPoints.toLocaleString()} ${bonus.pointType.replace(/_/g, ' ')} points` 
    : 'rewards'

  // SEO-optimized title and description
  const title = `${card.name} Review 2026: Maximize Rewards with ${bonusText} | CreditRich`
  const description = `Complete ${card.name} review: ${bonusText} welcome bonus, $${Number(card.annualFee)} annual fee, and top earning rates. See if this ${card.bank} card is right for you. Updated for 2026.`

  // Get site URL from environment or use relative path
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
  const ogImageUrl = `${siteUrl}/api/og?title=${encodeURIComponent(card.name)}&subtitle=${encodeURIComponent(`${bonusText} Welcome Bonus`)}&type=card`

  return {
    title,
    description,
    keywords: [
      card.name,
      card.bank,
      "credit card review",
      "credit card rewards",
      "welcome bonus",
      "annual fee",
      card.network,
      "best credit card 2026",
      bonus?.pointType.replace(/_/g, ' '),
      "credit card comparison",
      "maximize rewards"
    ],
    openGraph: {
      title,
      description,
      type: "article",
      url: `${siteUrl}/cards/${params.slug}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${card.name} Review`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `${siteUrl}/cards/${params.slug}`,
    },
  }
}

export default async function CardPage({ params }: CardPageProps) {
  const namePatterns = slugToNamePattern(params.slug)

  const card = await prisma.card.findFirst({
    where: { 
      OR: namePatterns.map(pattern => ({
        name: { contains: pattern, mode: 'insensitive' }
      })),
      isActive: true 
    },
    include: {
      bonuses: { where: { isActive: true } },
      multipliers: { where: { isActive: true } }
    }
  })

  if (!card) {
    notFound()
  }

  const bonus = card.bonuses[0]
  const cashback = isCashbackCard(card.bonuses)
  const topMultipliers = card.multipliers
    .sort((a: any, b: any) => Number(b.multiplierValue) - Number(a.multiplierValue))
    .slice(0, 5)

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="glass-premium border-primary/20 rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Card Image */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-[400px] flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-cyan-400/20 rounded-2xl blur-3xl" />
                  <CardImage
                    name={card.name}
                    bank={card.bank}
                    network={card.network}
                    imageUrl={card.imageUrl}
                    className="relative w-full max-w-[320px] h-48 hover:scale-105 transition-transform duration-300 drop-shadow-2xl"
                  />
                </div>
              </div>

              {/* Card Info */}
              <div>
                <Badge className="mb-4">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {card.network} Card
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
                  {card.name}
                </h1>
                <p className="text-xl text-muted-foreground mb-6">
                  {card.bank}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="glass p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Annual Fee</span>
                    </div>
                    <div className="text-2xl font-bold">${Number(card.annualFee)}</div>
                  </div>
                  {bonus && (
                    <div className="glass p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">Welcome Bonus</span>
                      </div>
                      <div className="text-2xl font-bold">${Number(bonus.estimatedValue || 0).toLocaleString()}</div>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <a
                  href={`/go/${createSlug(card.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-[#090A0F] rounded-lg transition-all hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)]"
                >
                  <Gift className="h-5 w-5" />
                  Apply Now
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Bonus Section */}
        {bonus && (
          <div className="max-w-5xl mx-auto mb-12">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Gift className="h-6 w-6 text-primary" />
                  Welcome Bonus
                </CardTitle>
                <CardDescription>Earn rewards when you meet the spending requirement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="glass-premium p-6 rounded-xl">
                  <div className="text-5xl font-bold text-gradient-teal mb-1">
                    ${Number(bonus.estimatedValue || 0).toLocaleString()}
                  </div>
                  <div className="text-lg text-muted-foreground mb-4">
                    Welcome bonus value
                  </div>
                  <div className="flex items-start gap-3 p-4 glass rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold mb-1">Spending Requirement</div>
                      <div className="text-sm text-muted-foreground">
                        Spend ${Number(bonus.minimumSpendAmount).toLocaleString()} within {bonus.spendPeriodMonths} months of account opening
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Earning Rates Section */}
        <div className="max-w-5xl mx-auto mb-12">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Earning Rates
              </CardTitle>
              <CardDescription>Maximize your rewards in these categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topMultipliers.map((mult: any, index: number) => (
                  <div key={mult.id} className="flex items-center justify-between p-4 glass rounded-lg hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-cyan-400/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{index + 1}</span>
                      </div>
                      <span className="font-medium capitalize">{mult.category.toLowerCase().replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {cashback ? (
                        <>
                          <span className="text-2xl font-bold text-primary">{(Number(mult.multiplierValue) * 100).toFixed(0)}%</span>
                          <span className="text-sm text-muted-foreground">back</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-primary">{(Number(mult.multiplierValue) * 100).toFixed(0)}x</span>
                          <span className="text-sm text-muted-foreground">pts</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card Details Section */}
        <div className="max-w-5xl mx-auto mb-12">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-primary" />
                Card Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Issuing Bank</div>
                    <div className="text-lg font-semibold">{card.bank}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Card Network</div>
                    <div className="text-lg font-semibold">{card.network}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Annual Fee</div>
                    <div className="text-lg font-semibold">${Number(card.annualFee)}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Currency</div>
                    <div className="text-lg font-semibold">{card.currency}</div>
                  </div>
                  {bonus && (
                    <>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Rewards Program</div>
                        <div className="text-lg font-semibold capitalize">{bonus.pointType.replace(/_/g, ' ')}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Bonus Period</div>
                        <div className="text-lg font-semibold">{bonus.spendPeriodMonths} months</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="max-w-5xl mx-auto">
          <Card className="glass-premium border-primary/20">
            <CardContent className="py-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Apply?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Start earning rewards with the {card.name}. Apply now and get {bonus ? `${bonus.bonusPoints.toLocaleString()} ${bonus.pointType.replace(/_/g, ' ')} points` : 'great rewards'} when you meet the spending requirement.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href={`/go/${createSlug(card.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-14 px-8 text-lg font-bold bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90 text-[#090A0F] rounded-lg transition-all hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)]"
                  >
                    <Gift className="h-5 w-5" />
                    Apply Now
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <Button size="lg" variant="outline" className="h-14 px-8" asChild>
                    <Link href="/compare">
                      Compare Cards
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-white/5">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Terms and conditions apply. We may earn a commission if you apply through our secure links. 
            All information is accurate as of the date of publication. Please verify current offers on the issuer's website.
          </p>
        </div>
      </div>
    </div>
  )
}
