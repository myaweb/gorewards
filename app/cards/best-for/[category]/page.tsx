import { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CardCategoryPage } from "@/components/card-category-page"
import { getCachedSeoContent } from "@/lib/services/seoContentService"

const CATEGORY_CONFIG: Record<string, {
  label: string
  dbCategory: string
  title: string
  description: string
  keywords: string[]
  minMultiplier?: number
}> = {
  groceries: {
    label: "Groceries",
    dbCategory: "GROCERY",
    title: "Best Credit Cards for Groceries in Canada (2026)",
    description: "Find the best Canadian credit cards that maximize rewards on grocery spending. Compare earn rates, welcome bonuses, and annual fees.",
    keywords: ["best grocery credit card canada", "credit card groceries canada", "grocery rewards card", "supermarket credit card canada"],
    minMultiplier: 0.02,
  },
  gas: {
    label: "Gas",
    dbCategory: "GAS",
    title: "Best Credit Cards for Gas in Canada (2026)",
    description: "Top Canadian credit cards for gas station rewards. Maximize points or cashback every time you fill up.",
    keywords: ["best gas credit card canada", "credit card gas rewards canada", "fuel rewards card canada"],
    minMultiplier: 0.02,
  },
  dining: {
    label: "Dining & Restaurants",
    dbCategory: "DINING",
    title: "Best Credit Cards for Dining in Canada (2026)",
    description: "Top Canadian credit cards for restaurant and dining rewards. Earn more on every meal out.",
    keywords: ["best dining credit card canada", "restaurant rewards card canada", "credit card dining canada"],
    minMultiplier: 0.02,
  },
  travel: {
    label: "Travel",
    dbCategory: "TRAVEL",
    title: "Best Travel Credit Cards in Canada (2026)",
    description: "Top Canadian travel credit cards with the best earn rates, lounge access, and travel insurance. Compare and find your perfect travel card.",
    keywords: ["best travel credit card canada", "travel rewards card canada", "airline credit card canada", "travel points card"],
    minMultiplier: 0.015,
  },
  bills: {
    label: "Recurring Bills",
    dbCategory: "RECURRING",
    title: "Best Credit Cards for Recurring Bills in Canada (2026)",
    description: "Earn rewards on subscriptions, utilities, and recurring payments. Best Canadian cards for bills and recurring charges.",
    keywords: ["best credit card bills canada", "recurring payments credit card canada", "subscription rewards card"],
    minMultiplier: 0.02,
  },
  entertainment: {
    label: "Entertainment",
    dbCategory: "ENTERTAINMENT",
    title: "Best Credit Cards for Entertainment in Canada (2026)",
    description: "Top Canadian credit cards for entertainment spending — streaming, events, and more.",
    keywords: ["best entertainment credit card canada", "streaming rewards card canada"],
    minMultiplier: 0.015,
  },
  shopping: {
    label: "Shopping",
    dbCategory: "SHOPPING",
    title: "Best Credit Cards for Shopping in Canada (2026)",
    description: "Maximize rewards on retail and online shopping with the best Canadian credit cards.",
    keywords: ["best shopping credit card canada", "retail rewards card canada", "online shopping credit card canada"],
    minMultiplier: 0.015,
  },
  student: {
    label: "Students",
    dbCategory: "STUDENT",
    title: "Best Student Credit Cards in Canada (2026)",
    description: "Top Canadian credit cards for students — no annual fee, easy approval, and great rewards to start building credit.",
    keywords: ["best student credit card canada", "student credit card no annual fee", "credit card for students canada"],
    minMultiplier: 0.005,
  },
  business: {
    label: "Business",
    dbCategory: "BUSINESS",
    title: "Best Business Credit Cards in Canada (2026)",
    description: "Top Canadian credit cards for business owners and professionals. Maximize rewards on business spending.",
    keywords: ["best business credit card canada", "business rewards card canada", "corporate credit card canada"],
    minMultiplier: 0.01,
  },
  "signup-bonus": {
    label: "Sign-Up Bonus",
    dbCategory: "SIGNUP_BONUS",
    title: "Best Credit Card Sign-Up Bonuses in Canada (2026)",
    description: "Highest welcome offers and sign-up bonuses on Canadian credit cards. Maximize your first-year value.",
    keywords: ["best credit card signup bonus canada", "welcome offer credit card canada", "best welcome bonus canada"],
    minMultiplier: 0.5,
  },
}

interface Props {
  params: { category: string }
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_CONFIG).map((category) => ({ category }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const config = CATEGORY_CONFIG[params.category]
  if (!config) return { title: "Not Found" }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gorewards.ca"

  return {
    title: `${config.title} | GoRewards`,
    description: config.description,
    keywords: config.keywords,
    alternates: { canonical: `${siteUrl}/cards/best-for/${params.category}` },
    openGraph: {
      title: config.title,
      description: config.description,
      url: `${siteUrl}/cards/best-for/${params.category}`,
      type: "website",
      images: [{
        url: `/api/og?title=${encodeURIComponent(config.title)}&subtitle=GoRewards Canada`,
        width: 1200,
        height: 630,
      }],
    },
  }
}

export default async function BestForCategoryPage({ params }: Props) {
  const config = CATEGORY_CONFIG[params.category]
  if (!config) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gorewards.ca"

  let cards
  let sorted

  // Special handling for signup-bonus category
  if (params.category === 'signup-bonus') {
    // Fetch cards with the best welcome bonuses
    cards = await prisma.card.findMany({
      where: {
        isActive: true,
        bonuses: {
          some: { 
            isActive: true,
            estimatedValue: { gt: 0 }
          },
        },
      },
      include: {
        bonuses: { where: { isActive: true }, orderBy: { estimatedValue: "desc" }, take: 1 },
        multipliers: { where: { isActive: true } },
      },
      orderBy: { name: "asc" },
    })

    // Sort by welcome bonus value descending
    sorted = cards
      .map((card) => {
        const bonusValue = card.bonuses[0] ? Number(card.bonuses[0].estimatedValue) : 0
        return { ...card, categoryMultiplier: bonusValue / 100 } // Normalize for display
      })
      .filter(c => c.categoryMultiplier > 0)
      .sort((a, b) => b.categoryMultiplier - a.categoryMultiplier)
  } else {
    // Fetch cards with the best multiplier for this category
    cards = await prisma.card.findMany({
      where: {
        isActive: true,
        multipliers: {
          some: { 
            category: config.dbCategory as any, 
            isActive: true,
            multiplierValue: { gt: config.minMultiplier ?? 0.01 }
          },
        },
      },
      include: {
        bonuses: { where: { isActive: true }, orderBy: { estimatedValue: "desc" }, take: 1 },
        multipliers: { where: { isActive: true } },
      },
      orderBy: { name: "asc" },
    })

    // Sort by the category multiplier value descending
    sorted = cards
      .map((card) => {
        const mult = card.multipliers.find((m) => m.category === config.dbCategory)
        return { ...card, categoryMultiplier: mult ? Number(mult.multiplierValue) : 0 }
      })
      .sort((a, b) => b.categoryMultiplier - a.categoryMultiplier)
  }

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "Cards", url: `${siteUrl}/cards` },
    { name: `Best for ${config.label}`, url: `${siteUrl}/cards/best-for/${params.category}` },
  ]

  const cardSummaries = sorted.slice(0, 5).map(c => ({
    name: c.name,
    bank: c.bank,
    annualFee: Number(c.annualFee),
    bonusValue: Number(c.bonuses[0]?.estimatedValue || 0),
    topCategory: config.label,
    topMultiplier: c.categoryMultiplier,
  }))

  const [seoContent] = await Promise.all([
    getCachedSeoContent(`best-for-${params.category}`, 'category', config.label, cardSummaries),
  ])

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the best credit card for ${config.label.toLowerCase()} in Canada?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: sorted[0]
            ? `The ${sorted[0].name} offers the highest earn rate for ${config.label.toLowerCase()} at ${(sorted[0].categoryMultiplier * 100).toFixed(0)}x points per dollar.`
            : `Compare our top-rated Canadian credit cards for ${config.label.toLowerCase()} spending above.`,
        },
      },
      {
        "@type": "Question",
        name: `How do I maximize ${config.label.toLowerCase()} rewards in Canada?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Choose a card with a high category multiplier for ${config.label.toLowerCase()} spending. Look for cards offering 3x or more points per dollar in this category, and factor in the welcome bonus and annual fee to calculate your true first-year value.`,
        },
      },
    ],
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: b.url,
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
        highlightCategory={config.dbCategory}
        breadcrumbs={breadcrumbs}
        filterLabel={config.label}
        seoContent={seoContent}
        categoryKey={params.category}
      />
    </>
  )
}
