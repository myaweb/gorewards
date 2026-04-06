import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { CardCategoryPage } from "@/components/card-category-page"
import { getCachedSeoContent } from "@/lib/services/seoContentService"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://GoRewards.net"

export const metadata: Metadata = {
  title: "Best No Annual Fee Credit Cards in Canada (2026) | GoRewards",
  description: "Top Canadian credit cards with no annual fee. Earn rewards, cashback, and points without paying a yearly fee. Compare and apply today.",
  keywords: ["no annual fee credit card canada", "free credit card canada", "no fee rewards card canada", "best no fee card canada 2026"],
  alternates: { canonical: `${siteUrl}/cards/no-annual-fee` },
  openGraph: {
    title: "Best No Annual Fee Credit Cards in Canada (2026)",
    description: "Top Canadian credit cards with no annual fee. Earn rewards without paying a yearly fee.",
    url: `${siteUrl}/cards/no-annual-fee`,
    type: "website",
    images: [{ url: `/api/og?title=Best No Annual Fee Credit Cards Canada&subtitle=GoRewards`, width: 1200, height: 630 }],
  },
}

export default async function NoAnnualFeePage() {
  const cards = await prisma.card.findMany({
    where: { isActive: true, annualFee: { equals: 0 } },
    include: {
      bonuses: { where: { isActive: true }, orderBy: { estimatedValue: "desc" }, take: 1 },
      multipliers: { where: { isActive: true } },
    },
    orderBy: { name: "asc" },
  })

  const sorted = cards
    .map((c) => ({ ...c, categoryMultiplier: 0, bonusValue: Number(c.bonuses[0]?.estimatedValue || 0) }))
    .sort((a, b) => b.bonusValue - a.bonusValue)

  const cardSummaries = sorted.slice(0, 5).map(c => ({
    name: c.name,
    bank: c.bank,
    annualFee: 0,
    bonusValue: c.bonusValue,
  }))

  const seoContent = await getCachedSeoContent('no-annual-fee', 'no-fee', 'No Annual Fee', cardSummaries)

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "Cards", url: `${siteUrl}/cards` },
    { name: "No Annual Fee", url: `${siteUrl}/cards/no-annual-fee` },
  ]

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Are no annual fee credit cards worth it in Canada?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — no annual fee cards are great for building credit, earning rewards on everyday spending, and as a secondary card. They're especially valuable if your spending doesn't justify a premium card's annual fee.",
        },
      },
      {
        "@type": "Question",
        name: "Can I earn good rewards with a no fee credit card in Canada?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely. Many no-fee Canadian credit cards offer competitive cashback rates, welcome bonuses, and category multipliers. While premium cards often offer higher earn rates, no-fee cards provide solid value with zero cost.",
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
        title="Best No Annual Fee Credit Cards in Canada (2026)"
        description="Top Canadian credit cards with no annual fee. Earn rewards, cashback, and points without paying a yearly fee."
        cards={sorted}
        breadcrumbs={breadcrumbs}
        filterLabel="No Annual Fee"
        showBonusValue
        seoContent={seoContent}
      />
    </>
  )
}

