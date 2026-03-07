import { Metadata } from "next"
import { notFound } from "next/navigation"
import { CardComparison } from "@/components/card-comparison"
import { StructuredData } from "@/components/structured-data"
import { getCardBySlug, parseComparisonSlug, getAllComparisonSlugs } from "@/lib/data/cards-database"

interface ComparePageProps {
  params: {
    slug: string
  }
}

// Generate static params for all possible comparisons
export async function generateStaticParams() {
  const slugs = getAllComparisonSlugs()
  return slugs.map((slug) => ({ slug }))
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const parsed = parseComparisonSlug(params.slug)
  
  if (!parsed) {
    return {
      title: "Card Comparison Not Found",
      description: "The requested card comparison could not be found.",
    }
  }

  const card1 = getCardBySlug(parsed.card1Slug)
  const card2 = getCardBySlug(parsed.card2Slug)

  if (!card1 || !card2) {
    return {
      title: "Card Comparison Not Found",
      description: "The requested card comparison could not be found.",
    }
  }

  // High-converting SEO title and description
  const title = `${card1.name} vs ${card2.name}: Which Card is Better in 2026?`
  const description = `Compare ${card1.name} and ${card2.name} side-by-side. See annual fees, rewards rates, welcome bonuses, and our AI verdict on which card wins for your spending profile.`

  return {
    title,
    description,
    keywords: [
      card1.name,
      card2.name,
      "credit card comparison",
      "best credit card",
      card1.bank,
      card2.bank,
      "rewards comparison",
      "annual fee comparison",
      "welcome bonus",
    ],
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://yoursite.com/compare/${params.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://yoursite.com/compare/${params.slug}`,
    },
  }
}

export default function ComparePage({ params }: ComparePageProps) {
  const parsed = parseComparisonSlug(params.slug)
  
  if (!parsed) {
    notFound()
  }

  const card1 = getCardBySlug(parsed.card1Slug)
  const card2 = getCardBySlug(parsed.card2Slug)

  if (!card1 || !card2) {
    notFound()
  }

  return (
    <>
      <StructuredData card1={card1} card2={card2} />
      <CardComparison card1={card1} card2={card2} />
    </>
  )
}
