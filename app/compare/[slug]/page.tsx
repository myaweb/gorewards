import { Metadata } from "next"
import { notFound } from "next/navigation"
import { CardComparison } from "@/components/card-comparison-flat"
import { prisma } from "@/lib/prisma"
import { getComparisonVerdict } from "@/app/actions/ai.actions"

interface ComparePageProps {
  params: {
    slug: string
  }
}

// Utility function to generate URL-friendly slugs (same as selector)
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Helper to parse slug like "amex-cobalt-vs-td-aeroplan-visa-infinite-privilege"
function parseComparisonSlug(slug: string): { card1Slug: string; card2Slug: string } | null {
  const parts = slug.split("-vs-")
  if (parts.length !== 2) return null
  return { card1Slug: parts[0], card2Slug: parts[1] }
}

// Helper to find card by matching slug against all cards
async function findCardBySlug(targetSlug: string): Promise<any | null> {
  const allCards = await prisma.card.findMany({
    where: { isActive: true },
    include: {
      bonuses: { where: { isActive: true } },
      multipliers: { where: { isActive: true } },
    },
  })
  
  // Find the card whose slugified name matches the target slug
  for (const card of allCards) {
    if (slugify(card.name) === targetSlug) {
      return card
    }
  }
  
  return null
}

// Pages are generated on-demand and cached (ISR)
// No need to pre-build all N*(N-1)/2 combinations at build time
export const dynamic = 'force-static'
export const revalidate = 86400 // revalidate daily

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const parsed = parseComparisonSlug(params.slug)
  
  if (!parsed) {
    return {
      title: "Card Comparison Not Found",
      description: "The requested card comparison could not be found.",
    }
  }

  // Fetch cards from database using slug matching
  const [card1, card2] = await Promise.all([
    findCardBySlug(parsed.card1Slug),
    findCardBySlug(parsed.card2Slug)
  ])

  if (!card1 || !card2) {
    return {
      title: "Card Comparison Not Found",
      description: "The requested card comparison could not be found.",
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gorewards.ca'

  // SEO title and description
  const title = `${card1.name} vs ${card2.name}: Side-by-Side Comparison | GoRewards`
  const description = `Compare ${card1.name} and ${card2.name} side-by-side. See annual fees, rewards rates, welcome bonuses, category multipliers, and first-year value calculations based on your spending. Updated for 2026.`

  const latestUpdate = card1.updatedAt > card2.updatedAt ? card1.updatedAt : card2.updatedAt

  return {
    title,
    description,
    keywords: [
      card1.name,
      card2.name,
      "credit card comparison",
      "best credit card 2026",
      card1.bank,
      card2.bank,
      "rewards comparison",
      "annual fee comparison",
      "welcome bonus",
      "credit card review",
      "which card is better",
      "Canadian credit cards"
    ],
    openGraph: {
      title,
      description,
      type: "article",
      url: `${siteUrl}/compare/${params.slug}`,
      modifiedTime: latestUpdate.toISOString(),
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(card1.name + ' vs ' + card2.name)}&subtitle=Side-by-Side Card Comparison&type=comparison`,
          width: 1200,
          height: 630,
          alt: `${card1.name} vs ${card2.name} Comparison`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?title=${encodeURIComponent(card1.name + ' vs ' + card2.name)}&subtitle=Side-by-Side Card Comparison&type=comparison`],
    },
    alternates: {
      canonical: `${siteUrl}/compare/${params.slug}`,
    },
  }
}

// Helper to transform database card to comparison format
function transformCardForComparison(card: any) {
  // Extract multipliers from CardMultiplier array
  const getMultiplier = (category: string) => {
    const multiplier = card.multipliers?.find(
      (m: any) => m.category === category && m.isActive
    )
    return multiplier ? Number(multiplier.multiplierValue) : 0
  }

  // Extract welcome bonus value
  const welcomeBonus = card.bonuses?.find((b: any) => b.isActive)
  const welcomeBonusValue = welcomeBonus?.estimatedValue 
    ? Number(welcomeBonus.estimatedValue) 
    : 0

  return {
    id: card.id,
    name: card.name,
    bank: card.bank,
    network: card.network,
    annualFee: Number(card.annualFee),
    welcomeBonusValue,
    baseRewardRate: Number(card.baseRewardRate),
    groceryMultiplier: getMultiplier('GROCERY'),
    gasMultiplier: getMultiplier('GAS'),
    diningMultiplier: getMultiplier('DINING'),
    billsMultiplier: getMultiplier('RECURRING'),
    applyLink: card.affiliateLink || '#',
    image: card.imageUrl || '/images/placeholder-card.svg'
  }
}

export default async function ComparePage({ params }: ComparePageProps) {
  const parsed = parseComparisonSlug(params.slug)
  
  if (!parsed) {
    notFound()
  }

  // Fetch cards
  const [card1Raw, card2Raw] = await Promise.all([
    findCardBySlug(parsed.card1Slug),
    findCardBySlug(parsed.card2Slug)
  ])

  if (!card1Raw || !card2Raw) {
    notFound()
  }

  // Transform cards to comparison format
  const card1 = transformCardForComparison(card1Raw)
  const card2 = transformCardForComparison(card2Raw)

  // Fetch AI verdict server-side for SEO
  // Note: Server-side fetch bypasses rate limiting (intentional for SEO)
  // Rate limiting only applies to client-side API calls
  const verdictResult = await getComparisonVerdict(params.slug)
  const initialVerdict = verdictResult.success ? verdictResult.verdict : null

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gorewards.ca'

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "Compare", "item": `${siteUrl}/compare` },
      { "@type": "ListItem", "position": 3, "name": `${card1Raw.name} vs ${card2Raw.name}`, "item": `${siteUrl}/compare/${params.slug}` },
    ],
  }

  return (
    <div className="min-h-screen pt-2 pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CardComparison card1={card1} card2={card2} initialVerdict={initialVerdict} />
    </div>
  )
}
