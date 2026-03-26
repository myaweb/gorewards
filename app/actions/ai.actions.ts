'use server'

import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

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
 * Generate AI-powered comparison verdict using Google Gemini (FREE)
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
      return {
        success: true,
        verdict: existing.aiVerdictText,
        cached: true,
      }
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not configured')
      return {
        success: false,
        error: 'GEMINI_API_KEY not configured',
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

    // Create prompt for Gemini
    const prompt = `You are a Canadian financial expert specializing in credit card rewards optimization. 
Write an engaging, professional, and SEO-optimized comparison verdict (300 words) comparing these two Canadian credit cards.

**Card A: ${cardA.name}**
- Bank: ${cardA.bank}
- Annual Fee: $${cardA.annualFee}
- Welcome Bonus: ${cardABonus?.bonusPoints.toLocaleString() || 0} ${cardABonus?.pointType || 'points'} (spend $${cardABonus?.minimumSpendAmount || 0} in ${cardABonus?.spendPeriodMonths || 0} months)
- Top Earning Rates: ${cardAMultipliers}

**Card B: ${cardB.name}**
- Bank: ${cardB.bank}
- Annual Fee: $${cardB.annualFee}
- Welcome Bonus: ${cardBBonus?.bonusPoints.toLocaleString() || 0} ${cardBBonus?.pointType || 'points'} (spend $${cardBBonus?.minimumSpendAmount || 0} in ${cardBBonus?.spendPeriodMonths || 0} months)
- Top Earning Rates: ${cardBMultipliers}

Structure your response with HTML formatting:
1. Opening paragraph with <p> tag highlighting the key difference
2. <h3>Who Should Choose ${cardA.name.split(' ')[0]}</h3> section with specific spending profiles in <p> and <ul><li> tags
3. <h3>Who Should Choose ${cardB.name.split(' ')[0]}</h3> section with specific spending profiles in <p> and <ul><li> tags
4. <h3>Final Recommendation</h3> with clear, actionable advice in <p> tag

Use HTML tags: <h3> for section headers, <p> for paragraphs, <strong> for emphasis, <ul> and <li> for lists.
Make it engaging, conversational yet authoritative, and actionable for Canadian consumers.
Focus on practical advice that helps readers make informed decisions.`

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const aiVerdictText = response.text()

    if (!aiVerdictText) {
      throw new Error('No content generated from Gemini')
    }

    // Save to database
    const savedComparison = await prisma.cardComparison.create({
      data: {
        slug,
        cardAId: cardA.id,
        cardBId: cardB.id,
        aiVerdictText,
      },
    })

    return {
      success: true,
      verdict: savedComparison.aiVerdictText,
      cached: false,
    }
  } catch (error) {
    console.error('Error generating AI verdict:', error)
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
