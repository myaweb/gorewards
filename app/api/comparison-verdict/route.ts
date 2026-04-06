import { NextRequest, NextResponse } from 'next/server'
import { generateComparisonVerdict } from '@/app/actions/ai.actions'
import { checkRateLimit, checkDailyLimit, getClientIp } from '@/lib/utils/rateLimiter'

// Rate limit: 5 requests per minute per IP
const RATE_LIMIT_CONFIG = {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
}

// Daily limit: 100 AI generations per day (global)
const DAILY_LIMIT_CONFIG = {
  maxRequests: 100,
}

/**
 * POST /api/comparison-verdict
 * 
 * Generate or retrieve AI-powered comparison verdict
 */
export async function POST(request: NextRequest) {
  try {
    // Check rate limit (per IP)
    const clientIp = getClientIp(request)
    const rateLimitResult = checkRateLimit(clientIp, RATE_LIMIT_CONFIG)

    if (!rateLimitResult.allowed) {
      const resetIn = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${resetIn} seconds.`,
        retryAfter: resetIn,
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
          'Retry-After': resetIn.toString(),
        }
      })
    }

    // Check daily limit (global)
    const dailyLimitResult = checkDailyLimit('ai-verdicts', DAILY_LIMIT_CONFIG)

    if (!dailyLimitResult.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Daily limit exceeded',
        message: 'AI verdict generation limit reached for today. Please try again tomorrow.',
      }, { 
        status: 429,
        headers: {
          'X-Daily-Limit': DAILY_LIMIT_CONFIG.maxRequests.toString(),
          'X-Daily-Remaining': '0',
        }
      })
    }

    const body = await request.json()
    const { card1, card2, slug } = body

    if (!card1 || !card2 || !slug) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: card1, card2, slug'
      }, { status: 400 })
    }

    // Generate or retrieve verdict
    const result = await generateComparisonVerdict(card1, card2, slug)

    return NextResponse.json(result, {
      headers: {
        'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
        'X-Daily-Limit': DAILY_LIMIT_CONFIG.maxRequests.toString(),
        'X-Daily-Remaining': dailyLimitResult.remaining.toString(),
      }
    })
  } catch (error) {
    console.error('Comparison verdict API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate comparison verdict',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
