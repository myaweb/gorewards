/**
 * Structured Data for Homepage
 * 
 * Provides Organization, WebSite, and FAQPage schema markup for SEO
 */

export function StructuredDataHomepage() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://GoRewards.net'

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GoRewards",
    "description": "AI-powered credit card rewards optimizer for Canadians",
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "sameAs": [
      // Add social media links when available
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "support@gorewards.ca"
    }
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GoRewards",
    "url": siteUrl,
    "description": "Optimize your credit card rewards and maximize points with AI-powered intelligent financial planning",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/compare?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does GoRewards make money?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We earn a small commission when you apply for a card through our affiliate links. However, our recommendations are 100% objective and based solely on maximizing your rewards. We never prioritize cards that pay us more."
        }
      },
      {
        "@type": "Question",
        "name": "Is my banking information safe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. We use Plaid, a trusted financial technology company used by major apps like Venmo and Robinhood. Your banking credentials are never stored on our servers. All data is encrypted using bank-level AES-256 encryption."
        }
      },
      {
        "@type": "Question",
        "name": "What's the difference between Free and Premium?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Free users get basic route generation and manual portfolio tracking. Premium users get automated bank sync via Plaid, unlimited saved strategies, advanced AI comparisons, real-time spending alerts, and priority support for $9/month CAD."
        }
      },
      {
        "@type": "Question",
        "name": "Can I cancel Premium anytime?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. You can cancel your Premium subscription anytime with one click from your dashboard. No questions asked, no cancellation fees. You'll retain access until the end of your billing period."
        }
      },
      {
        "@type": "Question",
        "name": "Which Canadian credit cards do you cover?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We track 50+ credit cards from major Canadian banks including TD, RBC, CIBC, Scotiabank, BMO, Amex, and more. Our database is updated regularly with the latest welcome bonuses and earning rates."
        }
      },
      {
        "@type": "Question",
        "name": "How accurate are your recommendations?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our AI-powered engine analyzes your actual spending patterns and calculates exact reward earnings based on current card multipliers and bonuses. We update our database regularly to ensure accuracy. However, final approval depends on your credit profile and the issuing bank."
        }
      }
    ]
  }

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "GoRewards",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": [
      {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "CAD",
        "name": "Free Plan"
      },
      {
        "@type": "Offer",
        "price": "9",
        "priceCurrency": "CAD",
        "name": "Premium Plan",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "9",
          "priceCurrency": "CAD",
          "unitText": "MONTH"
        }
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1000",
      "bestRating": "5",
      "worstRating": "1"
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
    </>
  )
}

