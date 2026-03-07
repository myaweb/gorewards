// Card database for comparison pages
// In production, this would come from your Prisma database

export interface CardData {
  id: string
  slug: string
  name: string
  bank: string
  network: "VISA" | "MASTERCARD" | "AMEX" | "DISCOVER"
  annualFee: number
  currency: string
  imageUrl?: string
  affiliateUrl?: string
  bonuses: {
    points: number
    pointType: string
    minimumSpend: number
    months: number
  }[]
  multipliers: {
    category: string
    rate: number
    description?: string
  }[]
  features: string[]
  pros: string[]
  cons: string[]
  bestFor: string[]
}

export const CARDS_DATABASE: Record<string, CardData> = {
  "amex-cobalt": {
    id: "card-1",
    slug: "amex-cobalt",
    name: "American Express Cobalt Card",
    bank: "American Express",
    network: "AMEX",
    annualFee: 156,
    currency: "CAD",
    imageUrl: "/cards/amex-cobalt.png",
    affiliateUrl: "https://example.com/apply/amex-cobalt",
    bonuses: [
      {
        points: 30000,
        pointType: "Membership Rewards",
        minimumSpend: 3000,
        months: 3,
      },
    ],
    multipliers: [
      { category: "Grocery", rate: 5, description: "5x points on groceries" },
      { category: "Dining", rate: 5, description: "5x points on dining" },
      { category: "Gas", rate: 2, description: "2x points on gas" },
      { category: "Travel", rate: 3, description: "3x points on travel" },
      { category: "Other", rate: 1, description: "1x points on everything else" },
    ],
    features: [
      "Monthly fee of $12.99",
      "No foreign transaction fees",
      "Membership Rewards points",
      "Travel insurance included",
      "Purchase protection",
    ],
    pros: [
      "Exceptional 5x earning on groceries and dining",
      "Low monthly fee structure",
      "Flexible points redemption",
      "Strong travel benefits",
    ],
    cons: [
      "Monthly fee adds up to $156/year",
      "AMEX not accepted everywhere",
      "Requires good credit score",
      "Annual spend requirement for bonus",
    ],
    bestFor: [
      "Foodies and frequent diners",
      "Grocery shoppers",
      "Young professionals",
      "Points collectors",
    ],
  },
  "td-aeroplan": {
    id: "card-2",
    slug: "td-aeroplan",
    name: "TD Aeroplan Visa Infinite",
    bank: "TD Bank",
    network: "VISA",
    annualFee: 139,
    currency: "CAD",
    imageUrl: "/cards/td-aeroplan.png",
    affiliateUrl: "https://example.com/apply/td-aeroplan",
    bonuses: [
      {
        points: 50000,
        pointType: "Aeroplan",
        minimumSpend: 3000,
        months: 3,
      },
    ],
    multipliers: [
      { category: "Grocery", rate: 3, description: "3x Aeroplan points on groceries" },
      { category: "Dining", rate: 2, description: "2x Aeroplan points on dining" },
      { category: "Gas", rate: 2, description: "2x Aeroplan points on gas" },
      { category: "Travel", rate: 2, description: "2x Aeroplan points on travel" },
      { category: "Other", rate: 1, description: "1x Aeroplan points on everything else" },
    ],
    features: [
      "Annual fee of $139",
      "First checked bag free on Air Canada",
      "Priority boarding",
      "Aeroplan points never expire",
      "Comprehensive travel insurance",
    ],
    pros: [
      "Massive 50,000 point welcome bonus",
      "Excellent for Air Canada flyers",
      "Strong grocery earning rate",
      "Widely accepted Visa network",
    ],
    cons: [
      "Higher annual fee",
      "Points locked to Aeroplan program",
      "Lower dining multiplier than competitors",
      "Requires minimum income",
    ],
    bestFor: [
      "Frequent Air Canada travelers",
      "Aeroplan collectors",
      "Grocery shoppers",
      "Canadian travel enthusiasts",
    ],
  },
  "cibc-aeroplan": {
    id: "card-3",
    slug: "cibc-aeroplan",
    name: "CIBC Aeroplan Visa",
    bank: "CIBC",
    network: "VISA",
    annualFee: 0,
    currency: "CAD",
    imageUrl: "/cards/cibc-aeroplan.png",
    affiliateUrl: "https://example.com/apply/cibc-aeroplan",
    bonuses: [
      {
        points: 20000,
        pointType: "Aeroplan",
        minimumSpend: 1500,
        months: 3,
      },
    ],
    multipliers: [
      { category: "Grocery", rate: 2, description: "2x Aeroplan points on groceries" },
      { category: "Dining", rate: 1.5, description: "1.5x Aeroplan points on dining" },
      { category: "Gas", rate: 1.5, description: "1.5x Aeroplan points on gas" },
      { category: "Travel", rate: 1.5, description: "1.5x Aeroplan points on travel" },
      { category: "Other", rate: 1, description: "1x Aeroplan points on everything else" },
    ],
    features: [
      "No annual fee",
      "Lower minimum spend requirement",
      "Aeroplan points never expire",
      "Basic travel insurance",
      "Easy approval",
    ],
    pros: [
      "No annual fee - perfect for beginners",
      "Lower welcome bonus requirement",
      "Decent grocery earning",
      "Good starter card",
    ],
    cons: [
      "Lower welcome bonus",
      "Modest earning rates",
      "Limited premium benefits",
      "Basic insurance coverage",
    ],
    bestFor: [
      "First-time credit card users",
      "Budget-conscious travelers",
      "Occasional Aeroplan users",
      "Students and young adults",
    ],
  },
  "scotiabank-passport": {
    id: "card-4",
    slug: "scotiabank-passport",
    name: "Scotiabank Passport Visa Infinite",
    bank: "Scotiabank",
    network: "VISA",
    annualFee: 139,
    currency: "CAD",
    imageUrl: "/cards/scotiabank-passport.png",
    affiliateUrl: "https://example.com/apply/scotiabank-passport",
    bonuses: [
      {
        points: 40000,
        pointType: "Scene+ Points",
        minimumSpend: 4000,
        months: 4,
      },
    ],
    multipliers: [
      { category: "Grocery", rate: 2, description: "2x Scene+ points on groceries" },
      { category: "Dining", rate: 3, description: "3x Scene+ points on dining" },
      { category: "Gas", rate: 2, description: "2x Scene+ points on gas" },
      { category: "Travel", rate: 2, description: "2x Scene+ points on travel" },
      { category: "Other", rate: 1, description: "1x Scene+ points on everything else" },
    ],
    features: [
      "No foreign transaction fees",
      "6 free airport lounge passes",
      "Comprehensive travel insurance",
      "Scene+ rewards program",
      "Concierge service",
    ],
    pros: [
      "No foreign transaction fees",
      "Great for international travelers",
      "Strong dining rewards",
      "Airport lounge access",
    ],
    cons: [
      "Higher minimum spend for bonus",
      "Scene+ less flexible than other programs",
      "Annual fee not waived",
      "Requires high income",
    ],
    bestFor: [
      "International travelers",
      "Restaurant enthusiasts",
      "Scene+ program users",
      "Premium card seekers",
    ],
  },
}

// Helper function to get card by slug
export function getCardBySlug(slug: string): CardData | null {
  return CARDS_DATABASE[slug] || null
}

// Helper function to parse comparison slug
export function parseComparisonSlug(slug: string): { card1Slug: string; card2Slug: string } | null {
  const parts = slug.split("-vs-")
  if (parts.length !== 2) return null
  
  return {
    card1Slug: parts[0],
    card2Slug: parts[1],
  }
}

// Generate all possible comparison slugs for static generation
export function getAllComparisonSlugs(): string[] {
  const slugs = Object.keys(CARDS_DATABASE)
  const comparisons: string[] = []
  
  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      comparisons.push(`${slugs[i]}-vs-${slugs[j]}`)
    }
  }
  
  return comparisons
}
