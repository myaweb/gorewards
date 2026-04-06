/**
 * Simple in-memory rate limiter
 * Production'da Redis kullanılmalı
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface DailyLimitEntry {
  count: number
  date: string // YYYY-MM-DD format
}

const rateLimitStore = new Map<string, RateLimitEntry>()
const dailyLimitStore = new Map<string, DailyLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export interface DailyLimitConfig {
  maxRequests: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export interface DailyLimitResult {
  allowed: boolean
  remaining: number
  resetDate: string
}

/**
 * Check if request is allowed based on rate limit
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // No entry or expired - create new
  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowMs
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt,
    })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    }
  }

  // Entry exists and not expired
  if (entry.count < config.maxRequests) {
    entry.count++
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetAt: entry.resetAt,
    }
  }

  // Rate limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetAt: entry.resetAt,
  }
}

/**
 * Check daily limit (global, not per-IP)
 */
export function checkDailyLimit(
  identifier: string,
  config: DailyLimitConfig
): DailyLimitResult {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const entry = dailyLimitStore.get(identifier)

  // No entry or different day - create new
  if (!entry || entry.date !== today) {
    dailyLimitStore.set(identifier, {
      count: 1,
      date: today,
    })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetDate: today,
    }
  }

  // Same day
  if (entry.count < config.maxRequests) {
    entry.count++
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetDate: today,
    }
  }

  // Daily limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetDate: today,
  }
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  // Check common headers for real IP (behind proxies/CDN)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to a default (shouldn't happen in production)
  return 'unknown'
}
