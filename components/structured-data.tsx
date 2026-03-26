import type { Card as PrismaCard, CardBonus } from "@prisma/client"

interface StructuredDataProps {
  card1: PrismaCard & { bonuses: CardBonus[] }
  card2: PrismaCard & { bonuses: CardBonus[] }
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

export function StructuredData({ card1, card2 }: StructuredDataProps) {
  // Use environment variable for site URL or fallback to relative path
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ComparisonPage",
    "name": `${card1.name} vs ${card2.name} Comparison`,
    "description": `Compare ${card1.name} and ${card2.name} side-by-side including annual fees, rewards rates, and welcome bonuses.`,
    "mainEntity": [
      {
        "@type": "FinancialProduct",
        "@id": `#${card1.id}`,
        "name": card1.name,
        "provider": {
          "@type": "Organization",
          "name": card1.bank
        },
        "feesAndCommissionsSpecification": {
          "@type": "UnitPriceSpecification",
          "price": Number(card1.annualFee),
          "priceCurrency": card1.currency,
          "name": "Annual Fee"
        },
        "offers": {
          "@type": "Offer",
          "description": `${card1.bonuses[0]?.bonusPoints} ${card1.bonuses[0]?.pointType.replace(/_/g, " ")} points welcome bonus`,
          "url": card1.affiliateLink || `${siteUrl}/api/go/${createSlug(card1.name)}`
        }
      },
      {
        "@type": "FinancialProduct",
        "@id": `#${card2.id}`,
        "name": card2.name,
        "provider": {
          "@type": "Organization",
          "name": card2.bank
        },
        "feesAndCommissionsSpecification": {
          "@type": "UnitPriceSpecification",
          "price": Number(card2.annualFee),
          "priceCurrency": card2.currency,
          "name": "Annual Fee"
        },
        "offers": {
          "@type": "Offer",
          "description": `${card2.bonuses[0]?.bonusPoints} ${card2.bonuses[0]?.pointType.replace(/_/g, " ")} points welcome bonus`,
          "url": card2.affiliateLink || `${siteUrl}/api/go/${createSlug(card2.name)}`
        }
      }
    ],
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString()
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
