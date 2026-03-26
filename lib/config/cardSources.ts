/**
 * Card Data Sources Configuration
 * 
 * Each card has its own direct URL on the issuing bank's website.
 * This eliminates dependency on aggregator sites like Ratehub.
 * 
 * Tested: TD, BMO, RBC, CIBC individual card pages return rich data
 * via standard server-side fetch (no JS rendering needed).
 * 
 * Amex and Scotiabank individual pages are JS-rendered — 
 * we use their list/offer pages instead which return partial data.
 */

export interface CardSourceEntry {
  /** Must match the card name in DB exactly */
  dbCardName: string
  url: string
  bank: string
  timeout: number
  enabled: boolean
}

export const CARD_SOURCES: CardSourceEntry[] = [
  // === TD ===
  { dbCardName: 'TD Aeroplan Visa Infinite', url: 'https://www.td.com/ca/en/personal-banking/products/credit-cards/aeroplan/aeroplan-visa-infinite-card', bank: 'TD', timeout: 10000, enabled: true },
  { dbCardName: 'TD Aeroplan Visa Infinite Privilege', url: 'https://www.td.com/ca/en/personal-banking/products/credit-cards/aeroplan/aeroplan-visa-infinite-privilege-card', bank: 'TD', timeout: 10000, enabled: true },
  { dbCardName: 'TD Cash Back Visa Infinite', url: 'https://www.td.com/ca/en/personal-banking/products/credit-cards/cash-back/cash-back-visa-infinite-card', bank: 'TD', timeout: 10000, enabled: true },
  { dbCardName: 'TD First Class Travel Visa Infinite', url: 'https://www.td.com/ca/en/personal-banking/products/credit-cards/travel-rewards/first-class-travel-visa-infinite-card', bank: 'TD', timeout: 10000, enabled: true },

  // === BMO ===
  { dbCardName: 'BMO Eclipse Visa Infinite', url: 'https://www.bmo.com/main/personal/credit-cards/bmo-eclipse-visa-infinite', bank: 'BMO', timeout: 10000, enabled: true },
  { dbCardName: 'BMO Ascend World Elite Mastercard', url: 'https://www.bmo.com/main/personal/credit-cards/bmo-ascend-world-elite-mastercard', bank: 'BMO', timeout: 10000, enabled: true },
  { dbCardName: 'BMO CashBack World Elite Mastercard', url: 'https://www.bmo.com/main/personal/credit-cards/bmo-cashback-world-elite-mastercard', bank: 'BMO', timeout: 10000, enabled: true },
  { dbCardName: 'BMO AIR MILES World Elite Mastercard', url: 'https://www.bmo.com/main/personal/credit-cards/bmo-air-miles-world-elite-mastercard', bank: 'BMO', timeout: 10000, enabled: true },

  // === RBC ===
  { dbCardName: 'RBC Avion Visa Infinite', url: 'https://www.rbcroyalbank.com/credit-cards/travel/rbc-avion-visa-infinite.html', bank: 'RBC', timeout: 10000, enabled: true },
  { dbCardName: 'RBC Avion Visa Infinite Privilege', url: 'https://www.rbcroyalbank.com/credit-cards/travel/rbc-avion-visa-infinite-privilege.html', bank: 'RBC', timeout: 10000, enabled: true },
  { dbCardName: 'RBC Cash Back Mastercard', url: 'https://www.rbcroyalbank.com/credit-cards/cashback/rbc-cashback-mastercard.html', bank: 'RBC', timeout: 10000, enabled: true },
  { dbCardName: 'RBC ION Visa', url: 'https://www.rbcroyalbank.com/credit-cards/rewards/rbc-ion-visa.html', bank: 'RBC', timeout: 10000, enabled: true },

  // === CIBC ===
  { dbCardName: 'CIBC Aeroplan Visa Infinite', url: 'https://www.cibc.com/en/personal-banking/credit-cards/all-credit-cards/aeroplan-visa-infinite-card.html', bank: 'CIBC', timeout: 15000, enabled: true },
  { dbCardName: 'CIBC Aeroplan Visa', url: 'https://www.cibc.com/en/personal-banking/credit-cards/all-credit-cards/aeroplan-visa-card.html', bank: 'CIBC', timeout: 15000, enabled: true },
  { dbCardName: 'CIBC Dividend Visa Infinite', url: 'https://www.cibc.com/en/personal-banking/credit-cards/all-credit-cards/dividend-visa-infinite-card.html', bank: 'CIBC', timeout: 15000, enabled: true },
  { dbCardName: 'CIBC Aventura Visa Infinite', url: 'https://www.cibc.com/en/personal-banking/credit-cards/all-credit-cards/aventura-visa-infinite-card.html', bank: 'CIBC', timeout: 15000, enabled: true },
  { dbCardName: 'COSTCO Anywhere Visa Card by CIBC', url: 'https://www.cibc.com/en/personal-banking/credit-cards/all-credit-cards/costco-mastercard.html', bank: 'CIBC', timeout: 15000, enabled: true },

  // === Scotiabank (list page — individual pages are JS-rendered) ===
  { dbCardName: 'Scotiabank Momentum Visa Infinite', url: 'https://www.scotiabank.com/ca/en/personal/credit-cards.html', bank: 'Scotiabank', timeout: 10000, enabled: true },
  { dbCardName: 'Scotiabank Passport Visa Infinite', url: 'https://www.scotiabank.com/ca/en/personal/credit-cards.html', bank: 'Scotiabank', timeout: 10000, enabled: true },
  { dbCardName: 'Scotiabank Gold American Express', url: 'https://www.scotiabank.com/ca/en/personal/credit-cards.html', bank: 'Scotiabank', timeout: 10000, enabled: true },
  { dbCardName: 'Scotiabank Scene+ Visa', url: 'https://www.scotiabank.com/ca/en/personal/credit-cards.html', bank: 'Scotiabank', timeout: 10000, enabled: true },

  // === Amex (list page — individual pages are JS-rendered) ===
  { dbCardName: 'American Express Cobalt Card', url: 'https://www.americanexpress.com/ca/en/credit-cards', bank: 'American Express', timeout: 15000, enabled: true },
  { dbCardName: 'American Express Platinum Card', url: 'https://www.americanexpress.com/ca/en/credit-cards', bank: 'American Express', timeout: 15000, enabled: true },
  { dbCardName: 'American Express Gold Rewards Card', url: 'https://www.americanexpress.com/ca/en/credit-cards', bank: 'American Express', timeout: 15000, enabled: true },
  { dbCardName: 'SimplyCash Card from American Express', url: 'https://www.americanexpress.com/ca/en/credit-cards', bank: 'American Express', timeout: 15000, enabled: true },
  { dbCardName: 'Marriott Bonvoy American Express Card', url: 'https://www.americanexpress.com/ca/en/credit-cards', bank: 'American Express', timeout: 15000, enabled: true },

  // === Desjardins ===
  { dbCardName: 'Desjardins Cash Back Visa', url: 'https://www.desjardins.com/ca/personal/loans-credit/credit-cards/cash-back-visa/index.jsp', bank: 'Desjardins', timeout: 10000, enabled: true },

  // === PC Financial ===
  { dbCardName: 'PC Mastercard', url: 'https://www.pcfinancial.ca/credit-cards/no-fee/', bank: 'PC Financial', timeout: 10000, enabled: true },
  { dbCardName: 'PC World Elite Mastercard', url: 'https://www.pcfinancial.ca/credit-cards/world-elite/', bank: 'PC Financial', timeout: 10000, enabled: true },

  // === Simplii Financial ===
  { dbCardName: 'Simplii Financial Cash Back Visa', url: 'https://www.simplii.com/en/credit-cards/cash-back-visa-card.html', bank: 'Simplii Financial', timeout: 10000, enabled: true },

  // === Rogers ===
  { dbCardName: 'Rogers World Elite Mastercard', url: 'https://rogersbank.com/en/rogers_red_worldelite_mastercard_details', bank: 'Rogers', timeout: 10000, enabled: true },

  // === MBNA ===
  { dbCardName: 'MBNA True Line Mastercard', url: 'https://www.mbna.ca/en/credit-cards/low-interest/true-line-mastercard', bank: 'MBNA', timeout: 10000, enabled: true },

  // === Home Trust ===
  { dbCardName: 'Home Trust Preferred Visa', url: 'https://www.hometrust.ca/credit-cards/preferred-visa', bank: 'Home Trust', timeout: 10000, enabled: true },

  // === Canadian Tire ===
  { dbCardName: 'Canadian Tire Triangle Mastercard', url: 'https://www.canadiantire.ca/mastercard', bank: 'Canadian Tire', timeout: 10000, enabled: true },
]

/**
 * Get enabled card sources, grouped by unique URL to avoid duplicate fetches
 */
export function getGroupedSources(): Map<string, CardSourceEntry[]> {
  const grouped = new Map<string, CardSourceEntry[]>()
  for (const source of CARD_SOURCES.filter(s => s.enabled)) {
    const existing = grouped.get(source.url) || []
    existing.push(source)
    grouped.set(source.url, existing)
  }
  return grouped
}
