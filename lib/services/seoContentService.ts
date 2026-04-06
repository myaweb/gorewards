import OpenAI from 'openai'
import { unstable_cache } from 'next/cache'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export interface SeoPageContent {
  intro: string        // 2-3 sentence intro paragraph
  howWeRanked: string  // methodology paragraph
  expertTip: string    // 1 actionable tip
}

interface CardSummary {
  name: string
  bank: string
  annualFee: number
  bonusValue: number
  topCategory?: string
  topMultiplier?: number
}

async function generateCategoryContent(
  pageType: 'category' | 'bank' | 'program' | 'no-fee',
  filterLabel: string,
  cards: CardSummary[]
): Promise<SeoPageContent> {
  const topCards = cards.slice(0, 3).map(c =>
    `${c.name} (${c.bank}, $${c.annualFee}/yr fee, $${c.bonusValue} welcome bonus${c.topCategory ? `, ${(c.topMultiplier! * 100).toFixed(0)}x on ${c.topCategory}` : ''})`
  ).join('; ')

  const prompts: Record<typeof pageType, string> = {
    category: `You are a Canadian personal finance expert. Write concise SEO content for a page listing the best credit cards for ${filterLabel} spending in Canada.

Top cards on this page: ${topCards}

Write exactly 3 sections in JSON format:
{
  "intro": "2-3 sentence intro explaining why ${filterLabel} is an important spending category and what makes a great card for it. Mention Canada. Natural, not salesy.",
  "howWeRanked": "1-2 sentences explaining we ranked by ${filterLabel} category multiplier rate, then welcome bonus value, then annual fee.",
  "expertTip": "1 actionable sentence tip for maximizing ${filterLabel} rewards in Canada."
}

Return only valid JSON, no markdown.`,

    bank: `You are a Canadian personal finance expert. Write concise SEO content for a page listing all ${filterLabel} credit cards in Canada.

Cards on this page: ${topCards}

Write exactly 3 sections in JSON format:
{
  "intro": "2-3 sentences about ${filterLabel}'s credit card lineup in Canada — what makes them stand out, who they're best for.",
  "howWeRanked": "1-2 sentences: ranked by welcome bonus value, then rewards earn rate, then annual fee.",
  "expertTip": "1 actionable tip for choosing the right ${filterLabel} card."
}

Return only valid JSON, no markdown.`,

    program: `You are a Canadian personal finance expert. Write concise SEO content for a page listing the best ${filterLabel} credit cards in Canada.

Top cards: ${topCards}

Write exactly 3 sections in JSON format:
{
  "intro": "2-3 sentences explaining what ${filterLabel} points are, who earns them, and why they're valuable in Canada.",
  "howWeRanked": "1-2 sentences: ranked by welcome bonus value in CAD, then earn rate, then annual fee.",
  "expertTip": "1 actionable tip for maximizing ${filterLabel} points value."
}

Return only valid JSON, no markdown.`,

    'no-fee': `You are a Canadian personal finance expert. Write concise SEO content for a page listing the best no annual fee credit cards in Canada.

Top cards: ${topCards}

Write exactly 3 sections in JSON format:
{
  "intro": "2-3 sentences about no annual fee credit cards in Canada — who they're best for and what to look for.",
  "howWeRanked": "1-2 sentences: ranked by welcome bonus value, then best category earn rate.",
  "expertTip": "1 actionable tip for getting the most value from a no-fee card."
}

Return only valid JSON, no markdown.`,
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompts[pageType] }],
    temperature: 0.7,
    max_tokens: 400,
  })

  const raw = response.choices[0]?.message?.content?.trim() || ''

  try {
    return JSON.parse(raw) as SeoPageContent
  } catch {
    // Fallback if JSON parse fails
    return {
      intro: `Find the best ${filterLabel} credit cards in Canada. Compare welcome bonuses, earn rates, and annual fees to find the right card for your spending.`,
      howWeRanked: `Cards are ranked by ${filterLabel} earn rate, welcome bonus value, and annual fee.`,
      expertTip: `Always calculate your first-year value (welcome bonus minus annual fee) before applying.`,
    }
  }
}

// Cache per page key, revalidate every 7 days
export function getCachedSeoContent(
  cacheKey: string,
  pageType: 'category' | 'bank' | 'program' | 'no-fee',
  filterLabel: string,
  cards: CardSummary[]
) {
  return unstable_cache(
    () => generateCategoryContent(pageType, filterLabel, cards),
    [`seo-content-${cacheKey}`],
    { revalidate: 60 * 60 * 24 * 7 } // 7 days
  )()
}
