import type { CardData } from "@/lib/data/cards-database"

interface StructuredDataProps {
  card1: CardData
  card2: CardData
}

export function StructuredData({ card1, card2 }: StructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ComparisonPage",
    "name": `${card1.name} vs ${card2.name} Comparison`,
    "description": `Compare ${card1.name} and ${card2.name} side-by-side including annual fees, rewards rates, and welcome bonuses.`,
    "mainEntity": [
      {
        "@type": "FinancialProduct",
        "@id": `#${card1.slug}`,
        "name": card1.name,
        "provider": {
          "@type": "Organization",
          "name": card1.bank
        },
        "feesAndCommissionsSpecification": {
          "@type": "UnitPriceSpecification",
          "price": card1.annualFee,
          "priceCurrency": card1.currency,
          "name": "Annual Fee"
        },
        "offers": {
          "@type": "Offer",
          "description": `${card1.bonuses[0]?.points} ${card1.bonuses[0]?.pointType} points welcome bonus`,
          "url": card1.affiliateUrl
        }
      },
      {
        "@type": "FinancialProduct",
        "@id": `#${card2.slug}`,
        "name": card2.name,
        "provider": {
          "@type": "Organization",
          "name": card2.bank
        },
        "feesAndCommissionsSpecification": {
          "@type": "UnitPriceSpecification",
          "price": card2.annualFee,
          "priceCurrency": card2.currency,
          "name": "Annual Fee"
        },
        "offers": {
          "@type": "Offer",
          "description": `${card2.bonuses[0]?.points} ${card2.bonuses[0]?.pointType} points welcome bonus`,
          "url": card2.affiliateUrl
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
