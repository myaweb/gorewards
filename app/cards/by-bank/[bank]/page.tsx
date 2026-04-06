import { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CardCategoryPage } from "@/components/card-category-page"
import { getCachedSeoContent } from "@/lib/services/seoContentService"

const BANK_CONFIG: Record<string, { label: string; keywords: string[] }> = {
  "td":         { label: "TD",              keywords: ["TD credit cards canada", "best TD bank card", "TD rewards card"] },
  "rbc":        { label: "RBC",             keywords: ["RBC credit cards canada", "best RBC card", "RBC Avion card"] },
  "amex":       { label: "American Express",keywords: ["Amex credit cards canada", "American Express canada", "best Amex card canada"] },
  "cibc":       { label: "CIBC",            keywords: ["CIBC credit cards canada", "best CIBC card", "CIBC Aventura"] },
  "scotiabank": { label: "Scotiabank",      keywords: ["Scotiabank credit cards canada", "best Scotiabank card", "Scene+ card"] },
  "bmo":        { label: "BMO",             keywords: ["BMO credit cards canada", "best BMO card", "BMO rewards"] },
  "national-bank": { label: "National Bank",keywords: ["National Bank credit cards canada", "best National Bank card"] },
  "hsbc":       { label: "HSBC",            keywords: ["HSBC credit cards canada", "best HSBC card canada"] },
  "desjardins": { label: "Desjardins",      keywords: ["Desjardins credit cards canada", "best Desjardins card"] },
  "rogers":     { label: "Rogers",          keywords: ["Rogers credit card canada", "Rogers World Elite Mastercard"] },
  "tangerine":  { label: "Tangerine",       keywords: ["Tangerine credit card canada", "Tangerine cashback card"] },
  "simplii":    { label: "Simplii Financial",keywords: ["Simplii credit card canada", "Simplii Financial card"] },
}

// Map URL slug → DB bank name patterns
const BANK_DB_PATTERNS: Record<string, string[]> = {
  "td":         ["TD", "TD Bank", "Toronto-Dominion"],
  "rbc":        ["RBC", "Royal Bank"],
  "amex":       ["American Express", "Amex"],
  "cibc":       ["CIBC"],
  "scotiabank": ["Scotiabank", "Scotia"],
  "bmo":        ["BMO", "Bank of Montreal"],
  "national-bank": ["National Bank"],
  "hsbc":       ["HSBC"],
  "desjardins": ["Desjardins"],
  "rogers":     ["Rogers"],
  "tangerine":  ["Tangerine"],
  "simplii":    ["Simplii", "Simplii Financial"],
}

interface Props {
  params: { bank: string }
}

export async function generateStaticParams() {
  // Get distinct banks from DB and map to slugs
  const banks = await prisma.card.findMany({
    where: { isActive: true },
    select: { bank: true },
    distinct: ["bank"],
  })

  const slugs = new Set<string>()
  for (const { bank } of banks) {
    const lower = bank.toLowerCase()
    for (const [slug, patterns] of Object.entries(BANK_DB_PATTERNS)) {
      if (patterns.some((p) => lower.includes(p.toLowerCase()))) {
        slugs.add(slug)
        break
      }
    }
  }

  return Array.from(slugs).map((bank) => ({ bank }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const config = BANK_CONFIG[params.bank]
  if (!config) return { title: "Not Found" }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gorewards.ca"
  const title = `Best ${config.label} Credit Cards in Canada (2026)`
  const description = `Compare all ${config.label} credit cards in Canada. Find the best rewards, welcome bonuses, and annual fees from ${config.label}.`

  return {
    title: `${title} | GoRewards`,
    description,
    keywords: config.keywords,
    alternates: { canonical: `${siteUrl}/cards/by-bank/${params.bank}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/cards/by-bank/${params.bank}`,
      type: "website",
      images: [{ url: `/api/og?title=${encodeURIComponent(title)}&subtitle=GoRewards Canada`, width: 1200, height: 630 }],
    },
  }
}

export default async function ByBankPage({ params }: Props) {
  const config = BANK_CONFIG[params.bank]
  const patterns = BANK_DB_PATTERNS[params.bank]
  if (!config || !patterns) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gorewards.ca"

  const cards = await prisma.card.findMany({
    where: {
      isActive: true,
      OR: patterns.map((p) => ({ bank: { contains: p, mode: "insensitive" as const } })),
    },
    include: {
      bonuses: { where: { isActive: true }, orderBy: { estimatedValue: "desc" }, take: 1 },
      multipliers: { where: { isActive: true } },
    },
    orderBy: { name: "asc" },
  })

  if (!cards.length) notFound()

  const title = `Best ${config.label} Credit Cards in Canada (2026)`
  const description = `Compare all ${config.label} credit cards in Canada. Find the best rewards, welcome bonuses, and annual fees from ${config.label}.`

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "Cards", url: `${siteUrl}/cards` },
    { name: `${config.label} Cards`, url: `${siteUrl}/cards/by-bank/${params.bank}` },
  ]

  const cardSummaries = cards.slice(0, 5).map(c => ({
    name: c.name,
    bank: c.bank,
    annualFee: Number(c.annualFee),
    bonusValue: Number(c.bonuses[0]?.estimatedValue || 0),
  }))

  const seoContent = await getCachedSeoContent(`by-bank-${params.bank}`, 'bank', config.label, cardSummaries)

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((b, i) => ({
      "@type": "ListItem", position: i + 1, name: b.name, item: b.url,
    })),
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the best ${config.label} credit card in Canada?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: cards[0]
            ? `The ${cards[0].name} is one of the top ${config.label} credit cards, offering competitive rewards and benefits.`
            : `Compare all ${config.label} credit cards above to find the best fit for your spending.`,
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <CardCategoryPage
        title={title}
        description={description}
        cards={cards.map((c) => ({ ...c, categoryMultiplier: 0 }))}
        breadcrumbs={breadcrumbs}
        filterLabel={config.label}
        seoContent={seoContent}
      />
    </>
  )
}
