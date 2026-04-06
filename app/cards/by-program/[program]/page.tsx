import { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CardCategoryPage } from "@/components/card-category-page"
import { getCachedSeoContent } from "@/lib/services/seoContentService"

const PROGRAM_CONFIG: Record<string, {
  label: string
  dbPointType: string
  title: string
  description: string
  keywords: string[]
}> = {
  "aeroplan": {
    label: "Aeroplan",
    dbPointType: "AEROPLAN",
    title: "Best Aeroplan Credit Cards in Canada (2026)",
    description: "Compare the best Aeroplan credit cards in Canada. Maximize Air Canada miles, welcome bonuses, and earn rates to reach your travel goals faster.",
    keywords: ["best aeroplan credit card canada", "aeroplan card canada", "air canada credit card", "aeroplan points card", "aeroplan welcome bonus"],
  },
  "scene-plus": {
    label: "Scene+",
    dbPointType: "SCENE_PLUS",
    title: "Best Scene+ Credit Cards in Canada (2026)",
    description: "Top Scene+ credit cards from Scotiabank. Earn Scene+ points on every purchase and redeem for travel, movies, and more.",
    keywords: ["best scene+ credit card canada", "scene plus card canada", "scotiabank scene card", "scene+ points card"],
  },
  "membership-rewards": {
    label: "Membership Rewards",
    dbPointType: "MEMBERSHIP_REWARDS",
    title: "Best American Express Membership Rewards Cards in Canada (2026)",
    description: "Compare the best Amex Membership Rewards credit cards in Canada. Flexible points redeemable for travel, transfers, and more.",
    keywords: ["best membership rewards card canada", "amex membership rewards canada", "american express points canada", "flexible points card canada"],
  },
  "cashback": {
    label: "Cash Back",
    dbPointType: "CASHBACK",
    title: "Best Cash Back Credit Cards in Canada (2026)",
    description: "Top cashback credit cards in Canada. Earn real money back on every purchase with no points to manage.",
    keywords: ["best cashback credit card canada", "cash back card canada", "no fee cashback card canada", "highest cashback canada"],
  },
  "avion": {
    label: "RBC Avion",
    dbPointType: "AVION",
    title: "Best RBC Avion Credit Cards in Canada (2026)",
    description: "Compare RBC Avion credit cards. Earn flexible Avion points redeemable for travel, merchandise, and more.",
    keywords: ["best RBC avion card canada", "avion points card", "rbc travel card canada"],
  },
  "air-miles": {
    label: "AIR MILES",
    dbPointType: "AIR_MILES",
    title: "Best AIR MILES Credit Cards in Canada (2026)",
    description: "Top AIR MILES credit cards in Canada. Earn miles on everyday purchases and redeem for flights, merchandise, and more.",
    keywords: ["best air miles credit card canada", "air miles card canada", "bmo air miles card"],
  },
  "aventura": {
    label: "CIBC Aventura",
    dbPointType: "AVENTURA",
    title: "Best CIBC Aventura Credit Cards in Canada (2026)",
    description: "Compare CIBC Aventura credit cards. Flexible travel points with no blackout dates.",
    keywords: ["best cibc aventura card canada", "aventura points card", "cibc travel card canada"],
  },
  "marriott-bonvoy": {
    label: "Marriott Bonvoy",
    dbPointType: "MARRIOTT_BONVOY",
    title: "Best Marriott Bonvoy Credit Cards in Canada (2026)",
    description: "Top Marriott Bonvoy credit cards in Canada. Earn hotel points and enjoy elite status benefits.",
    keywords: ["best marriott bonvoy card canada", "marriott credit card canada", "hotel rewards card canada"],
  },
}

interface Props {
  params: { program: string }
}

export async function generateStaticParams() {
  return Object.keys(PROGRAM_CONFIG).map((program) => ({ program }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const config = PROGRAM_CONFIG[params.program]
  if (!config) return { title: "Not Found" }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gorewards.ca"

  return {
    title: `${config.title} | GoRewards`,
    description: config.description,
    keywords: config.keywords,
    alternates: { canonical: `${siteUrl}/cards/by-program/${params.program}` },
    openGraph: {
      title: config.title,
      description: config.description,
      url: `${siteUrl}/cards/by-program/${params.program}`,
      type: "website",
      images: [{ url: `/api/og?title=${encodeURIComponent(config.title)}&subtitle=GoRewards Canada`, width: 1200, height: 630 }],
    },
  }
}

export default async function ByProgramPage({ params }: Props) {
  const config = PROGRAM_CONFIG[params.program]
  if (!config) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gorewards.ca"

  const cards = await prisma.card.findMany({
    where: {
      isActive: true,
      bonuses: { some: { pointType: config.dbPointType as any, isActive: true } },
    },
    include: {
      bonuses: { where: { isActive: true, pointType: config.dbPointType as any }, orderBy: { estimatedValue: "desc" }, take: 1 },
      multipliers: { where: { isActive: true } },
    },
    orderBy: { name: "asc" },
  })

  if (!cards.length) notFound()

  // Sort by welcome bonus estimated value
  const sorted = cards
    .map((c) => ({ ...c, categoryMultiplier: 0, bonusValue: Number(c.bonuses[0]?.estimatedValue || 0) }))
    .sort((a, b) => b.bonusValue - a.bonusValue)

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "Cards", url: `${siteUrl}/cards` },
    { name: `${config.label} Cards`, url: `${siteUrl}/cards/by-program/${params.program}` },
  ]

  const cardSummaries = sorted.slice(0, 5).map(c => ({
    name: c.name,
    bank: c.bank,
    annualFee: Number(c.annualFee),
    bonusValue: c.bonusValue,
  }))

  const seoContent = await getCachedSeoContent(`by-program-${params.program}`, 'program', config.label, cardSummaries)

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the best ${config.label} credit card in Canada?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: sorted[0]
            ? `The ${sorted[0].name} offers the highest ${config.label} welcome bonus value at $${sorted[0].bonusValue.toLocaleString()} CAD.`
            : `Compare all ${config.label} credit cards above to find the best fit.`,
        },
      },
      {
        "@type": "Question",
        name: `How do ${config.label} points work in Canada?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${config.label} points are earned on everyday purchases with eligible credit cards. You can redeem them for travel, merchandise, and more. The value per point varies by redemption method.`,
        },
      },
    ],
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((b, i) => ({
      "@type": "ListItem", position: i + 1, name: b.name, item: b.url,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <CardCategoryPage
        title={config.title}
        description={config.description}
        cards={sorted}
        breadcrumbs={breadcrumbs}
        filterLabel={config.label}
        showBonusValue
        seoContent={seoContent}
      />
    </>
  )
}
