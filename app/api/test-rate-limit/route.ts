import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimiter'

// Test rate limit: 3 requests per 30 seconds
const TEST_RATE_LIMIT = {
  maxRequests: 3,
  windowMs: 30 * 1000,
}

/**
 * GET /api/test-rate-limit
 * 
 * Test endpoint to verify rate limiting works
 */
export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request)
  const result = checkRateLimit(`test-${clientIp}`, TEST_RATE_LIMIT)

  if (!result.allowed) {
    const resetIn = Math.ceil((result.resetAt - Date.now()) / 1000)
    return NextResponse.json({
      success: false,
      message: `🚫 Rate limit exceeded! Please wait ${resetIn} seconds.`,
      remaining: 0,
      resetIn,
    }, { 
      status: 429,
      headers: {
        'Retry-After': resetIn.toString(),
      }
    })
  }

  return NextResponse.json({
    success: true,
    message: `✅ Request allowed! ${result.remaining} requests remaining.`,
    remaining: result.remaining,
    resetAt: new Date(result.resetAt).toISOString(),
  })
}
