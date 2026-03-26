/**
 * Card Update Pipeline
 * 
 * Fetches each card's own page from the issuing bank's website,
 * parses with AI, diffs against DB, creates pending updates.
 * 
 * No dependency on aggregator sites. Each card has its own URL.
 * URLs sharing the same page (e.g. Amex list page) are fetched once
 * and parsed together.
 */

import { getGroupedSources, type CardSourceEntry } from '../config/cardSources'
import { aiCardParser, type ParsedCard } from './aiCardParser'
import { CardDataUpdateService, type CardDiff } from './cardDataUpdateService'

export interface PipelineResult {
  success: boolean
  urlsFetched: number
  urlsSucceeded: number
  urlsFailed: number
  totalCardsParsed: number
  totalDiffsFound: number
  pendingUpdatesCreated: number
  batchId: string | null
  durationMs: number
  errors: string[]
}

export class CardUpdatePipeline {
  async run(): Promise<PipelineResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const grouped = getGroupedSources()
    let urlsFetched = 0
    let urlsSucceeded = 0
    let urlsFailed = 0
    let allParsedCards: ParsedCard[] = []

    // Fetch unique URLs in parallel (max 5 concurrent)
    const urls = Array.from(grouped.entries())
    const batchSize = 5

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize)
      const results = await Promise.allSettled(
        batch.map(([url, cards]) => this.fetchAndParse(url, cards))
      )

      for (const result of results) {
        urlsFetched++
        if (result.status === 'fulfilled' && result.value.length > 0) {
          urlsSucceeded++
          allParsedCards.push(...result.value)
        } else {
          urlsFailed++
          if (result.status === 'rejected') {
            errors.push(result.reason?.message || 'Unknown error')
          }
        }
      }
    }

    if (allParsedCards.length === 0) {
      return {
        success: false, urlsFetched, urlsSucceeded, urlsFailed,
        totalCardsParsed: 0, totalDiffsFound: 0, pendingUpdatesCreated: 0,
        batchId: null, durationMs: Date.now() - startTime,
        errors: [...errors, 'No cards parsed from any source'],
      }
    }

    // Deduplicate
    const deduped = this.deduplicateCards(allParsedCards)

    // Clean up old pending updates before creating new ones
    await CardDataUpdateService.cleanupOldPendingUpdates()

    // Diff with DB
    const diffs = await CardDataUpdateService.diffWithDatabase(deduped, 'bank-direct')

    // Create pending updates
    let batchId: string | null = null
    let pendingCount = 0
    if (diffs.length > 0) {
      const result = await CardDataUpdateService.createPendingUpdatesFromDiffs(diffs, 'bank-direct')
      batchId = result.batchId
      pendingCount = result.count
    }

    console.log(`[Pipeline] Done: ${deduped.length} cards parsed, ${diffs.length} diffs, ${pendingCount} pending updates`)

    return {
      success: true, urlsFetched, urlsSucceeded, urlsFailed,
      totalCardsParsed: deduped.length, totalDiffsFound: diffs.length,
      pendingUpdatesCreated: pendingCount, batchId,
      durationMs: Date.now() - startTime, errors,
    }
  }

  private async fetchAndParse(url: string, cards: CardSourceEntry[]): Promise<ParsedCard[]> {
    const cardNames = cards.map(c => c.dbCardName).join(', ')
    try {
      const controller = new AbortController()
      const timeout = Math.max(...cards.map(c => c.timeout))
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-CA,en;q=0.9',
        },
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        console.warn(`[Pipeline] HTTP ${response.status} for ${cardNames}`)
        return []
      }

      const text = await response.text()
      if (text.length < 200) {
        console.warn(`[Pipeline] Empty response for ${cardNames}`)
        return []
      }

      // Tell AI which specific cards to look for
      const hint = cards.length === 1
        ? `Focus on extracting data for: ${cardNames}`
        : `Extract data for these specific cards: ${cardNames}`

      const parsed = await aiCardParser.parseCardData(text, cards[0].bank, hint)
      console.log(`[Pipeline] ${parsed.length} cards from ${cards[0].bank} (${url.substring(0, 60)}...)`)
      return parsed
    } catch (error) {
      console.error(`[Pipeline] Fetch error for ${cardNames}:`, error instanceof Error ? error.message : error)
      return []
    }
  }

  private deduplicateCards(cards: ParsedCard[]): ParsedCard[] {
    const seen = new Set<string>()
    const unique: ParsedCard[] = []
    for (const card of cards) {
      const key = card.name.toLowerCase().replace(/[®™*©◊]/g, '').replace(/\s+/g, ' ').trim()
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(card)
      }
    }
    return unique
  }
}

export const cardUpdatePipeline = new CardUpdatePipeline()
