'use server'

import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { logAIUsage } from '@/lib/utils/aiMonitoring'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

interface CardData {
  id: string
  name: string
  bank: string
  annualFee: number
  bonuses: Array<{
    bonusPoints: number
    pointType: string
    minimumSpendAmount: number
    spendPeriodMonths: number
  }>
  multipliers: Array<{
    category: string
    multiplierValue: number
  }>
}

/**
 * Generate AI-powered comparison verdict using OpenAI ChatGPT
 */
export async function generateComparisonVerdict(
  cardA: CardData,
  cardB: CardData,
  slug: string
) {
  try {
    // Check if verdict already exists
    const existing = await prisma.cardComparison.findUnique({
      where: { slug },
    })

    if (existing) {
      logAIUsage({
        slug,
        cached: true,
        success: true,
      })
      return {
        success: true,
        verdict: existing.aiVerdictText,
        cached: true,
      }
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not configured')
      logAIUsage({
        slug,
        cached: false,
        success: false,
        error: 'OPENAI_API_KEY not configured',
      })
      return {
        success: false,
        error: 'OPENAI_API_KEY not configured',
        verdict: null,
      }
    }

    // Prepare card data for AI
    const cardABonus = cardA.bonuses[0]
    const cardBBonus = cardB.bonuses[0]

    const cardAMultipliers = cardA.multipliers
      .sort((a, b) => Number(b.multiplierValue) - Number(a.multiplierValue))
      .slice(0, 4)
      .map(m => `${m.category}: ${m.multiplierValue}x`)
      .join(', ')

    const cardBMultipliers = cardB.multipliers
      .sort((a, b) => Number(b.multiplierValue) - Number(a.multiplierValue))
      .slice(0, 4)
      .map(m => `${m.category}: ${m.multiplierValue}x`)
      .join(', ')

    // Create prompt for ChatGPT
    const prompt = `You are a Canadian financial expert specializing in credit card rewards optimization. 
Write a SHORT, concise comparison summary (40-50 words MAX) comparing these two Canadian credit cards.

**Card A: ${cardA.name}**
- Bank: ${cardA.bank}
- Annual Fee: $${cardA.annualFee}
- Welcome Bonus: ${cardABonus?.bonusPoints.toLocaleString() || 0} ${cardABonus?.pointType || 'points'}
- Top Earning Rates: ${cardAMultipliers}

**Card B: ${cardB.name}**
- Bank: ${cardB.bank}
- Annual Fee: $${cardB.annualFee}
- Welcome Bonus: ${cardBBonus?.bonusPoints.toLocaleString() || 0} ${cardBBonus?.pointType || 'points'}
- Top Earning Rates: ${cardBMultipliers}

CRITICAL REQUIREMENTS:
1. Keep it to 40-50 words maximum
2. Focus on KEY differences with specific numbers (multipliers, fees)
3. Be direct and actionable
4. END with "Winner: [Full Card Name]" on a new line
5. Return ONLY plain text, no HTML tags, no formatting, no bold markers

Format: 
"[Card A short name] excels at X (specific rate/number). [Card B short name] better for Y (specific rate/number). Choose A if [condition], B if [condition].

Winner: [Full winning card name]"

Example good response:
"TD Aeroplan excels for Air Canada travelers (25,000 welcome points). Scotiabank Gold better for groceries (5x points) and dining (3x points). Choose TD if you fly Air Canada frequently, Scotiabank if you prioritize everyday spending.

Winner: Scotiabank Gold American Express"

Return ONLY the plain text summary with "Winner: [card name]" at the end.`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Canadian financial expert. Provide SHORT, concise comparisons with specific numbers. Maximum 50 words.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    })

    let aiVerdictText = completion.choices[0]?.message?.content

    if (!aiVerdictText) {
      throw new Error('No content generated from OpenAI')
    }

    // Clean up any markdown or extra formatting
    aiVerdictText = aiVerdictText
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/\*\*/g, '')
      .trim()

    // Validate: Check if AI mentioned both card names
    const mentionsCardA = aiVerdictText.toLowerCase().includes(cardA.name.split(' ')[0].toLowerCase())
    const mentionsCardB = aiVerdictText.toLowerCase().includes(cardB.name.split(' ')[0].toLowerCase())
    
    if (!mentionsCardA || !mentionsCardB) {
      console.warn('AI verdict missing card names, regenerating...')
      throw new Error('AI verdict validation failed: missing card names')
    }

    // Validate: Check if "Winner:" line exists
    if (!aiVerdictText.includes('Winner:')) {
      console.warn('AI verdict missing winner declaration')
      aiVerdictText += `\n\nWinner: ${cardA.name}` // Fallback to first card
    }

    // Save to database (use upsert to handle race conditions)
    const savedComparison = await prisma.cardComparison.upsert({
      where: { slug },
      update: {
        aiVerdictText,
        updatedAt: new Date(),
      },
      create: {
        id: require('crypto').randomUUID(),
        slug,
        cardAId: cardA.id,
        cardBId: cardB.id,
        aiVerdictText,
        updatedAt: new Date(),
      },
    })

    logAIUsage({
      slug,
      cached: false,
      success: true,
      tokensUsed: completion.usage?.total_tokens,
    })

    return {
      success: true,
      verdict: savedComparison.aiVerdictText,
      cached: false,
    }
  } catch (error) {
    console.error('Error generating AI verdict:', error)
    logAIUsage({
      slug,
      cached: false,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate verdict',
      verdict: null,
    }
  }
}

/**
 * Get existing comparison verdict from database
 */
export async function getComparisonVerdict(slug: string) {
  try {
    const comparison = await prisma.cardComparison.findUnique({
      where: { slug },
    })

    if (!comparison) {
      return {
        success: false,
        verdict: null,
      }
    }

    return {
      success: true,
      verdict: comparison.aiVerdictText,
    }
  } catch (error) {
    console.error('Error fetching comparison verdict:', error)
    return {
      success: false,
      error: 'Failed to fetch verdict',
      verdict: null,
    }
  }
}

/**
 * Regenerate verdict for a specific comparison (admin use)
 */
export async function regenerateVerdict(slug: string, cardA: CardData, cardB: CardData) {
  try {
    // Delete existing verdict
    await prisma.cardComparison.deleteMany({
      where: { slug },
    })

    // Generate new verdict
    return await generateComparisonVerdict(cardA, cardB, slug)
  } catch (error) {
    console.error('Error regenerating verdict:', error)
    return {
      success: false,
      error: 'Failed to regenerate verdict',
      verdict: null,
    }
  }
}
