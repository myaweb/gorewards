/**
 * AI Card Parser Service
 * 
 * Uses OpenAI GPT to extract structured credit card data
 * from raw web page text content.
 */

import OpenAI from 'openai'
import { z } from 'zod'

const ParsedCardSchema = z.object({
  name: z.string().min(3),
  bank: z.string().min(2),
  network: z.enum(['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER']).catch('VISA'),
  annualFee: z.number().min(0),
  welcomeBonusValue: z.number().min(0).default(0),
  baseRewardRate: z.number().min(0).max(1).default(0.01),
  groceryMultiplier: z.number().min(0).max(1).default(0.01),
  gasMultiplier: z.number().min(0).max(1).default(0.01),
  diningMultiplier: z.number().min(0).max(1).default(0.01),
  billsMultiplier: z.number().min(0).max(1).default(0.01),
})

export type ParsedCard = z.infer<typeof ParsedCardSchema>

const ParsedCardsArraySchema = z.array(ParsedCardSchema)

const SYSTEM_PROMPT = `You are a data extraction assistant. You extract Canadian credit card information from web page content and return ONLY a valid JSON array. No markdown, no explanation.

For EACH credit card found, return:
- name: Full card name (e.g. "American Express Cobalt Card")
- bank: Issuing bank (e.g. "American Express", "TD", "RBC", "CIBC", "Scotiabank", "BMO")
- network: "VISA", "MASTERCARD", "AMEX", or "DISCOVER"
- annualFee: Annual fee in CAD as number. For monthly-billed cards, calculate annual total.
- welcomeBonusValue: Estimated dollar value of welcome bonus in CAD
- baseRewardRate: Base earn rate as decimal (1% = 0.01)
- groceryMultiplier: Grocery earn rate as decimal (5x or 5% = 0.05)
- gasMultiplier: Gas/fuel earn rate as decimal
- diningMultiplier: Dining earn rate as decimal
- billsMultiplier: Recurring bills earn rate as decimal (use base rate if not mentioned)

RULES:
- Points multipliers as decimals: 5x = 0.05, 2x = 0.02, 1x = 0.01
- Cashback percentages as decimals: 4% = 0.04, 2% = 0.02
- If category rate not mentioned, use base rate
- Only Canadian credit cards
- Return ONLY valid JSON array`

export class AICardParser {
  private client: OpenAI | null = null

  private getClient(): OpenAI | null {
    if (!process.env.OPENAI_API_KEY) {
      console.error('[AICardParser] OPENAI_API_KEY not configured')
      return null
    }
    if (!this.client) {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    }
    return this.client
  }

  async parseCardData(rawText: string, sourceName: string, hint?: string): Promise<ParsedCard[]> {
    const client = this.getClient()
    if (!client) return []

    const truncatedText = rawText.slice(0, 30000)
    const userMessage = hint
      ? `${hint}\n\nExtract credit card data from this web content:\n\n${truncatedText}`
      : `Extract credit card data from this web content:\n\n${truncatedText}`

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.1,
        max_tokens: 16000,
      })

      const text = response.choices[0]?.message?.content || ''
      const jsonStr = this.extractJSON(text)
      if (!jsonStr) {
        console.error(`[AICardParser] No valid JSON in response for ${sourceName}`)
        return []
      }

      const parsed = JSON.parse(jsonStr)
      const validated = ParsedCardsArraySchema.safeParse(parsed)

      if (!validated.success) {
        console.error(`[AICardParser] Validation failed for ${sourceName}:`, validated.error.issues.slice(0, 5))
        return this.salvageCards(parsed)
      }

      console.log(`[AICardParser] Parsed ${validated.data.length} cards from ${sourceName}`)
      return validated.data
    } catch (error) {
      console.error(`[AICardParser] Error parsing ${sourceName}:`, error instanceof Error ? error.message : error)
      return []
    }
  }

  private extractJSON(text: string): string | null {
    const trimmed = text.trim()
    if (trimmed.startsWith('[')) return trimmed
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
    if (codeBlockMatch?.[1]) return codeBlockMatch[1].trim()
    const arrayMatch = trimmed.match(/\[[\s\S]*\]/)
    if (arrayMatch?.[0]) return arrayMatch[0]
    return null
  }

  private salvageCards(data: unknown): ParsedCard[] {
    if (!Array.isArray(data)) return []
    const cards: ParsedCard[] = []
    for (const item of data) {
      const result = ParsedCardSchema.safeParse(item)
      if (result.success) cards.push(result.data)
    }
    console.log(`[AICardParser] Salvaged ${cards.length}/${data.length} cards`)
    return cards
  }
}

export const aiCardParser = new AICardParser()
