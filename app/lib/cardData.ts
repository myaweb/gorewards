/**
 * Master List of Canadian Credit Cards
 * 
 * ⚠️ IMPORTANT: This file is for REFERENCE and INITIAL SETUP only!
 * 
 * DATABASE IS THE SOURCE OF TRUTH:
 * - All runtime operations use the database
 * - Admin dashboard updates go directly to database
 * - Frontend fetches from database via /api/cards
 * 
 * This file is used for:
 * ✅ Initial database seeding (npx prisma db seed)
 * ✅ Bulk import via admin sync button (optional)
 * ✅ Reference for card data structure
 * ✅ Backup/disaster recovery
 * 
 * DO NOT use this file for:
 * ❌ Runtime card data
 * ❌ Regular updates (use admin dashboard instead)
 * ❌ Frontend data fetching
 * 
 * Last Updated: March 8, 2026
 */

export interface CardData {
  name: string
  bank: string
  network: string
  annualFee: number
  welcomeBonusValue: number
  baseRewardRate: number
  groceryMultiplier: number
  gasMultiplier: number
  diningMultiplier: number
  billsMultiplier: number
  applyLink: string
  image?: string // Optional - will use placeholder if not provided
}

// Default placeholder image for cards without custom images
const DEFAULT_CARD_IMAGE = "/images/cards/placeholder-card.svg"

// Helper function to get card image with fallback
export function getCardImage(card: CardData): string {
  return card.image || DEFAULT_CARD_IMAGE
}

export const canadianCardsMasterList: CardData[] = [
  // ========================================
  // AMERICAN EXPRESS
  // ========================================
  {
    name: "American Express Cobalt Card",
    bank: "American Express",
    network: "Amex",
    annualFee: 191.88, // $15.99/month ($12.99/month outside Quebec)
    welcomeBonusValue: 150, // 15,000 MR points (1,250 points/month for 12 months when spending $750/month)
    baseRewardRate: 0.01,
    groceryMultiplier: 0.05, // 5x MR points on groceries
    gasMultiplier: 0.02, // 2x MR points on gas
    diningMultiplier: 0.05, // 5x MR points on dining and food delivery
    billsMultiplier: 0.01,
    applyLink: "/api/go/amex-cobalt",
    image: "",
  },
  {
    name: "American Express Platinum Card",
    bank: "American Express",
    network: "Amex",
    annualFee: 799,
    welcomeBonusValue: 1000, // 100,000-110,000 MR points (spend $10,000 in first 3 months)
    baseRewardRate: 0.01,
    groceryMultiplier: 0.02, // 2x MR points
    gasMultiplier: 0.01,
    diningMultiplier: 0.02, // 2x MR points on dining and travel
    billsMultiplier: 0.01,
    applyLink: "/api/go/amex-platinum",
    image: "",
  },
  {
    name: "American Express Gold Rewards Card",
    bank: "American Express",
    network: "Amex",
    annualFee: 250,
    welcomeBonusValue: 600, // 60,000 MR points (5,000 points/month for 12 months when spending $1,000/month)
    baseRewardRate: 0.01,
    groceryMultiplier: 0.02, // 2x MR points
    gasMultiplier: 0.02, // 2x MR points
    diningMultiplier: 0.02, // 2x MR points
    billsMultiplier: 0.01,
    applyLink: "/api/go/amex-gold",
    image: "",
  },
  {
    name: "SimplyCash Card from American Express",
    bank: "American Express",
    network: "Amex",
    annualFee: 0,
    welcomeBonusValue: 100,
    baseRewardRate: 0.0125,
    groceryMultiplier: 0.0125,
    gasMultiplier: 0.0125,
    diningMultiplier: 0.0125,
    billsMultiplier: 0.0125,
    applyLink: "/api/go/amex-simplycash",
    image: "",
  },

  // ========================================
  // TD BANK
  // ========================================
  {
    name: "TD Aeroplan Visa Infinite",
    bank: "TD",
    network: "Visa",
    annualFee: 139, // First year free with current offer
    welcomeBonusValue: 450, // Up to 45,000 Aeroplan points (10k first purchase + 15k after $3k spend + 20k anniversary bonus)
    baseRewardRate: 0.01,
    groceryMultiplier: 0.015, // 1.5x Aeroplan points
    gasMultiplier: 0.015, // 1.5x Aeroplan points
    diningMultiplier: 0.01,
    billsMultiplier: 0.01,
    applyLink: "/api/go/td-aeroplan-infinite",
    image: "/images/cards/td-aeroplan.png",
  },
  {
    name: "TD Aeroplan Visa Infinite Privilege",
    bank: "TD",
    network: "Visa",
    annualFee: 599,
    welcomeBonusValue: 850, // Up to 85,000 Aeroplan points
    baseRewardRate: 0.015, // 1.5x Aeroplan points
    groceryMultiplier: 0.02, // 2x Aeroplan points
    gasMultiplier: 0.02, // 2x Aeroplan points
    diningMultiplier: 0.015,
    billsMultiplier: 0.015,
    applyLink: "/api/go/td-aeroplan-privilege",
    image: "",
  },
  {
    name: "TD Cash Back Visa Infinite",
    bank: "TD",
    network: "Visa",
    annualFee: 139,
    welcomeBonusValue: 350, // Up to $350 cash back
    baseRewardRate: 0.01,
    groceryMultiplier: 0.03, // 3% cash back (up to $450/year, then 1%)
    gasMultiplier: 0.03, // 3% cash back (up to $450/year, then 1%)
    diningMultiplier: 0.01,
    billsMultiplier: 0.03, // 3% cash back on recurring bills
    applyLink: "/api/go/td-cashback-infinite",
    image: "",
  },
  {
    name: "TD First Class Travel Visa Infinite",
    bank: "TD",
    network: "Visa",
    annualFee: 139,
    welcomeBonusValue: 300,
    baseRewardRate: 0.015,
    groceryMultiplier: 0.015,
    gasMultiplier: 0.015,
    diningMultiplier: 0.015,
    billsMultiplier: 0.015,
    applyLink: "/api/go/td-first-class",
    image: "",
  },

  // ========================================
  // RBC
  // ========================================
  {
    name: "RBC Avion Visa Infinite",
    bank: "RBC",
    network: "Visa",
    annualFee: 120,
    welcomeBonusValue: 550, // Up to 55,000 Avion points (35k on approval + 20k after $5k spend in 6 months)
    baseRewardRate: 0.01,
    groceryMultiplier: 0.0125, // 1.25x Avion points
    gasMultiplier: 0.0125, // 1.25x Avion points
    diningMultiplier: 0.0125, // 1.25x Avion points on travel
    billsMultiplier: 0.01,
    applyLink: "/api/go/rbc-avion-infinite",
    image: "",
  },
  {
    name: "RBC Avion Visa Infinite Privilege",
    bank: "RBC",
    network: "Visa",
    annualFee: 399,
    welcomeBonusValue: 700, // Up to 70,000 Avion points (35k on approval + 20k after $5k + 15k after 12 months)
    baseRewardRate: 0.0125,
    groceryMultiplier: 0.015, // 1.5x Avion points
    gasMultiplier: 0.015, // 1.5x Avion points
    diningMultiplier: 0.015, // 1.5x Avion points
    billsMultiplier: 0.0125,
    applyLink: "/api/go/rbc-avion-privilege",
    image: "",
  },
  {
    name: "RBC Cash Back Mastercard",
    bank: "RBC",
    network: "Mastercard",
    annualFee: 0,
    welcomeBonusValue: 100,
    baseRewardRate: 0.01,
    groceryMultiplier: 0.02,
    gasMultiplier: 0.01,
    diningMultiplier: 0.01,
    billsMultiplier: 0.01,
    applyLink: "/api/go/rbc-cashback",
    image: "",
  },
  {
    name: "RBC ION Visa",
    bank: "RBC",
    network: "Visa",
    annualFee: 0,
    welcomeBonusValue: 50,
    baseRewardRate: 0.01,
    groceryMultiplier: 0.01,
    gasMultiplier: 0.01,
    diningMultiplier: 0.01,
    billsMultiplier: 0.01,
    applyLink: "/api/go/rbc-ion",
    image: "",
  },

  // ========================================
  // CIBC
  // ========================================
  {
    name: "CIBC Aeroplan Visa Infinite",
    bank: "CIBC",
    network: "Visa",
    annualFee: 139,
    welcomeBonusValue: 450, // Up to 45,000 Aeroplan points (10k first purchase + 10k after $6k spend + 25k anniversary bonus)
    baseRewardRate: 0.01,
    groceryMultiplier: 0.015, // 1.5x Aeroplan points
    gasMultiplier: 0.015, // 1.5x Aeroplan points and EV charging
    diningMultiplier: 0.01,
    billsMultiplier: 0.01,
    applyLink: "/api/go/cibc-aeroplan-infinite",
    image: "/images/cards/cibc-aeroplan.png",
  },
  {
    name: "CIBC Aeroplan Visa",
    bank: "CIBC",
    network: "Visa",
    annualFee: 0,
    welcomeBonusValue: 100, // Up to 10,000 Aeroplan points
    baseRewardRate: 0.01,
    groceryMultiplier: 0.015, // 1.5x Aeroplan points
    gasMultiplier: 0.01,
    diningMultiplier: 0.01,
    billsMultiplier: 0.01,
    applyLink: "/api/go/cibc-aeroplan",
    image: "",
  },
  {
    name: "CIBC Dividend Visa Infinite",
    bank: "CIBC",
    network: "Visa",
    annualFee: 120, // First year rebated
    welcomeBonusValue: 300, // 10% cash back on first $3,000 in first 4 months
    baseRewardRate: 0.01,
    groceryMultiplier: 0.04, // 4% cash back
    gasMultiplier: 0.04, // 4% cash back and EV charging
    diningMultiplier: 0.02, // 2% cash back on dining and transportation
    billsMultiplier: 0.01,
    applyLink: "/api/go/cibc-dividend",
    image: "",
  },
  {
    name: "CIBC Aventura Visa Infinite",
    bank: "CIBC",
    network: "Visa",
    annualFee: 139,
    welcomeBonusValue: 400, // Up to 40,000 Aventura points
    baseRewardRate: 0.015, // 1.5x Aventura points
    groceryMultiplier: 0.015,
    gasMultiplier: 0.015,
    diningMultiplier: 0.015,
    billsMultiplier: 0.015,
    applyLink: "/api/go/cibc-aventura",
    image: "",
  },

  // ========================================
  // SCOTIABANK
  // ========================================
  {
    name: "Scotiabank Momentum Visa Infinite",
    bank: "Scotiabank",
    network: "Visa",
    annualFee: 120, // First year free with current offer (until April 30, 2026)
    welcomeBonusValue: 200, // 10% cash back on first $2,000 in first 3 months
    baseRewardRate: 0.01,
    groceryMultiplier: 0.04, // 4% cash back (up to $25k/year)
    gasMultiplier: 0.02, // 2% cash back (up to $25k/year)
    diningMultiplier: 0.01,
    billsMultiplier: 0.04, // 4% cash back on recurring bills (up to $25k/year)
    applyLink: "/api/go/scotia-momentum",
    image: "",
  },
  {
    name: "Scotiabank Passport Visa Infinite",
    bank: "Scotiabank",
    network: "Visa",
    annualFee: 139,
    welcomeBonusValue: 400,
    baseRewardRate: 0.01,
    groceryMultiplier: 0.02,
    gasMultiplier: 0.02,
    diningMultiplier: 0.03,
    billsMultiplier: 0.01,
    applyLink: "/api/go/scotia-passport",
    image: "",
  },
  {
    name: "Scotiabank Gold American Express",
    bank: "Scotiabank",
    network: "Amex",
    annualFee: 120, // First year waived (offer until July 1, 2026)
    welcomeBonusValue: 450, // Up to 45,000 Scene+ points (25k after $2k spend + 20k after $7.5k spend in first year)
    baseRewardRate: 0.01,
    groceryMultiplier: 0.06, // 6x Scene+ points at select grocers (5x at others)
    gasMultiplier: 0.03, // 3x Scene+ points
    diningMultiplier: 0.05, // 5x Scene+ points on dining and food delivery
    billsMultiplier: 0.01,
    applyLink: "/api/go/scotia-gold-amex",
    image: "",
  },
  {
    name: "Scotiabank Scene+ Visa",
    bank: "Scotiabank",
    network: "Visa",
    annualFee: 0,
    welcomeBonusValue: 100,
    baseRewardRate: 0.01,
    groceryMultiplier: 0.015,
    gasMultiplier: 0.015,
    diningMultiplier: 0.015,
    billsMultiplier: 0.01,
    applyLink: "/api/go/scotia-scene",
    image: "",
  },

  // ========================================
  // BMO
  // ========================================
  {
    name: "BMO Eclipse Visa Infinite",
    bank: "BMO",
    network: "Visa",
    annualFee: 120, // First year free with current offer
    welcomeBonusValue: 400, // Up to 70,000 BMO Rewards points (30k after $3k spend in 90 days + 30k after additional spend)
    baseRewardRate: 0.01,
    groceryMultiplier: 0.05, // 5x BMO Rewards points
    gasMultiplier: 0.05, // 5x BMO Rewards points
    diningMultiplier: 0.05, // 5x BMO Rewards points
    billsMultiplier: 0.01,
    applyLink: "/api/go/bmo-eclipse",
    image: "",
  },
  {
    name: "BMO Ascend World Elite Mastercard",
    bank: "BMO",
    network: "Mastercard",
    annualFee: 150,
    welcomeBonusValue: 500, // Up to 80,000 BMO Rewards points (after $6,000 spend in 110 days)
    baseRewardRate: 0.015,
    groceryMultiplier: 0.02, // 2x BMO Rewards points
    gasMultiplier: 0.02, // 2x BMO Rewards points
    diningMultiplier: 0.02, // 2x BMO Rewards points
    billsMultiplier: 0.015,
    applyLink: "/api/go/bmo-ascend",
    image: "",
  },
  {
    name: "BMO CashBack World Elite Mastercard",
    bank: "BMO",
    network: "Mastercard",
    annualFee: 120,
    welcomeBonusValue: 200,
    baseRewardRate: 0.01,
    groceryMultiplier: 0.05,
    gasMultiplier: 0.03,
    diningMultiplier: 0.01,
    billsMultiplier: 0.01,
    applyLink: "/api/go/bmo-cashback-we",
    image: "",
  },
  {
    name: "BMO AIR MILES World Elite Mastercard",
    bank: "BMO",
    network: "Mastercard",
    annualFee: 120,
    welcomeBonusValue: 300,
    baseRewardRate: 0.01,
    groceryMultiplier: 0.015,
    gasMultiplier: 0.015,
    diningMultiplier: 0.015,
    billsMultiplier: 0.01,
    applyLink: "/api/go/bmo-airmiles",
    image: "/images/cards/bmo-airmiles.png",
  },

  // ========================================
  // NATIONAL BANK
  // ========================================
  {
    name: "National Bank World Elite Mastercard",
    bank: "National Bank",
    network: "Mastercard",
    annualFee: 150,
    welcomeBonusValue: 350, // Up to 35,000 rewards points (varies by offer)
    baseRewardRate: 0.01, // 1-2x points depending on spend tier
    groceryMultiplier: 0.05, // 5x points (up to $2,500/month, then 2x)
    gasMultiplier: 0.02, // 2x points
    diningMultiplier: 0.05, // 5x points (up to $2,500/month, then 2x)
    billsMultiplier: 0.01,
    applyLink: "/api/go/nbc-world-elite",
    image: "",
  },
  {
    name: "National Bank Syncro Mastercard",
    bank: "National Bank",
    network: "Mastercard",
    annualFee: 0,
    welcomeBonusValue: 50,
    baseRewardRate: 0.01,
    groceryMultiplier: 0.04,
    gasMultiplier: 0.04,
    diningMultiplier: 0.01,
    billsMultiplier: 0.01,
    applyLink: "/api/go/nbc-syncro",
    image: "",
  },

  // ========================================
  // TANGERINE
  // ========================================
  {
    name: "Tangerine Money-Back Credit Card",
    bank: "Tangerine",
    network: "Mastercard",
    annualFee: 0,
    welcomeBonusValue: 100, // Up to $100 cash back (10% on first $1,000, offer until April 30, 2026)
    baseRewardRate: 0.005, // 0.5% cash back
    groceryMultiplier: 0.02, // 2% cash back in 2 categories of choice (3 if deposited to Tangerine account)
    gasMultiplier: 0.02, // 2% cash back (if selected as category)
    diningMultiplier: 0.02, // 2% cash back (if selected as category)
    billsMultiplier: 0.005,
    applyLink: "/api/go/tangerine-cashback",
    image: "",
  },
  {
    name: "Tangerine World Mastercard",
    bank: "Tangerine",
    network: "Mastercard",
    annualFee: 0,
    welcomeBonusValue: 120, // $120 bonus after $1,500 spend in first 3 months (offer until April 30, 2026)
    baseRewardRate: 0.01, // 1% cash back
    groceryMultiplier: 0.02, // 2% cash back in 2 categories of choice (3 if deposited to Tangerine account)
    gasMultiplier: 0.02, // 2% cash back (if selected as category)
    diningMultiplier: 0.02, // 2% cash back (if selected as category)
    billsMultiplier: 0.01,
    applyLink: "/api/go/tangerine-world",
    image: "",
  },

  // ========================================
  // MARRIOTT / HOTEL CARDS
  // ========================================
  {
    name: "Marriott Bonvoy American Express Card",
    bank: "American Express",
    network: "Amex",
    annualFee: 120,
    welcomeBonusValue: 400,
    baseRewardRate: 0.01,
    groceryMultiplier: 0.02,
    gasMultiplier: 0.01,
    diningMultiplier: 0.02,
    billsMultiplier: 0.01,
    applyLink: "/api/go/marriott-bonvoy",
    image: "",
  },

  // ========================================
  // COSTCO
  // ========================================
  {
    name: "COSTCO Anywhere Visa Card by CIBC",
    bank: "CIBC",
    network: "Visa",
    annualFee: 0,
    welcomeBonusValue: 0,
    baseRewardRate: 0.01,
    groceryMultiplier: 0.01,
    gasMultiplier: 0.03,
    diningMultiplier: 0.02,
    billsMultiplier: 0.01,
    applyLink: "/api/go/costco-visa",
    image: "",
  },

  // ========================================
  // DESJARDINS
  // ========================================
  {
    name: "Desjardins Cash Back Visa",
    bank: "Desjardins",
    network: "Visa",
    annualFee: 0,
    welcomeBonusValue: 50,
    baseRewardRate: 0.005,
    groceryMultiplier: 0.015,
    gasMultiplier: 0.015,
    diningMultiplier: 0.005,
    billsMultiplier: 0.005,
    applyLink: "/api/go/desjardins-cashback",
    image: "",
  },

  // ========================================
  // PC FINANCIAL
  // ========================================
  {
    name: "PC Mastercard",
    bank: "PC Financial",
    network: "Mastercard",
    annualFee: 0,
    welcomeBonusValue: 20,
    baseRewardRate: 0.01,
    groceryMultiplier: 0.025,
    gasMultiplier: 0.01,
    diningMultiplier: 0.01,
    billsMultiplier: 0.01,
    applyLink: "/api/go/pc-mastercard",
    image: "",
  },
  {
    name: "PC World Elite Mastercard",
    bank: "PC Financial",
    network: "Mastercard",
    annualFee: 0,
    welcomeBonusValue: 20,
    baseRewardRate: 0.01,
    groceryMultiplier: 0.03,
    gasMultiplier: 0.01,
    diningMultiplier: 0.01,
    billsMultiplier: 0.01,
    applyLink: "/api/go/pc-world-elite",
    image: "",
  },

  // ========================================
  // SIMPLII FINANCIAL
  // ========================================
  {
    name: "Simplii Financial Cash Back Visa",
    bank: "Simplii Financial",
    network: "Visa",
    annualFee: 0,
    welcomeBonusValue: 100,
    baseRewardRate: 0.005,
    groceryMultiplier: 0.015,
    gasMultiplier: 0.015,
    diningMultiplier: 0.04,
    billsMultiplier: 0.015,
    applyLink: "/api/go/simplii-cashback",
    image: "",
  },

  // ========================================
  // ROGERS
  // ========================================
  {
    name: "Rogers World Elite Mastercard",
    bank: "Rogers",
    network: "Mastercard",
    annualFee: 0,
    welcomeBonusValue: 0,
    baseRewardRate: 0.015,
    groceryMultiplier: 0.015,
    gasMultiplier: 0.015,
    diningMultiplier: 0.015,
    billsMultiplier: 0.015,
    applyLink: "/api/go/rogers-world-elite",
    image: "",
  },

  // ========================================
  // MBNA
  // ========================================
  {
    name: "MBNA True Line Mastercard",
    bank: "MBNA",
    network: "Mastercard",
    annualFee: 0,
    welcomeBonusValue: 0,
    baseRewardRate: 0,
    groceryMultiplier: 0,
    gasMultiplier: 0,
    diningMultiplier: 0,
    billsMultiplier: 0,
    applyLink: "/api/go/mbna-true-line",
    image: "",
  },

  // ========================================
  // HOME TRUST
  // ========================================
  {
    name: "Home Trust Preferred Visa",
    bank: "Home Trust",
    network: "Visa",
    annualFee: 0,
    welcomeBonusValue: 0,
    baseRewardRate: 0.01,
    groceryMultiplier: 0.01,
    gasMultiplier: 0.01,
    diningMultiplier: 0.01,
    billsMultiplier: 0.01,
    applyLink: "/api/go/home-trust-preferred",
    image: "",
  },

  // ========================================
  // CANADIAN TIRE
  // ========================================
  {
    name: "Canadian Tire Triangle Mastercard",
    bank: "Canadian Tire",
    network: "Mastercard",
    annualFee: 0,
    welcomeBonusValue: 0,
    baseRewardRate: 0.005,
    groceryMultiplier: 0.015,
    gasMultiplier: 0.015,
    diningMultiplier: 0.005,
    billsMultiplier: 0.005,
    applyLink: "/api/go/triangle-mastercard",
    image: "",
  },
]
