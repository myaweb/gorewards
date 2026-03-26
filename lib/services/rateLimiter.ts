/**
 * Rate Limiter Service
 * 
 * Provides comprehensive rate limiting for DoS protection
 * with endpoint-specific limits and IP-based restrictions.
 */

import { 
  RateLimiter, 
  RateLimit, 
  RateLimitResult 
} from '@/lib/types/security'
import { securityLogger } from './securityLogger'
import { generateCorrelationId } from '../utils/crypto'

interface RateLimitEntry {
  count: number
  resetTime: Date
  firstRequest: Date
}

export class RateLimiterService implements RateLimiter {
  private readonly store: Map<string, RateLimitEntry> = new Map()
  private readonly cleanupInterval: NodeJS.Timeout

  // Endpoint-specific rate limits (requests per minute)
  private readonly endpointLimits: Record<string, RateLimit> = {
    '/api/recommend': { requests: 20, windowMs: 60000 }, // 20 per minute
    '/api/optimize': { requests: 20, windowMs: 60000 },
    '/api/ai': { requests: 10, windowMs: 60000 }, // 10 per minute (AI is expensive)
    '/api/plaid': { requests: 5, windowMs: 60000 }, // 5 per minute (external API)
    '/api/admin': { requests: 100, windowMs: 3600000 }, // 100 per hour
    '/api/profile': { requests: 30, windowMs: 60000 },
    '/api/webhooks': { requests: 100, windowMs: 60000 }
  }

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Check rate limit for a specific key
   */
  async checkRateLimit(key: string, limit: RateLimit): Promise<RateLimitResult> {
    const now = new Date()
    const entry = this.store.get(key)

    // No previous requests or window expired
    if (!entry || now >= entry.resetTime) {
      const resetTime = new Date(now.getTime() + limit.windowMs)
      
      this.store.set(key, {
        count: 1,
        resetTime,
        firstRequest: now
      })

      return {
        allowed: true,
        remaining: limit.requests - 1,
        resetTime
      }
    }

    // Within rate limit window
    if (entry.count < limit.requests) {
      entry.count++
      this.store.set(key, entry)

      return {
        allowed: true,
        remaining: limit.requests - entry.count,
        resetTime: entry.resetTime
      }
    }

    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime.getTime() - now.getTime()) / 1000)

    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter
    }
  }

  /**
   * Check endpoint-specific rate limit
   */
  async checkEndpointLimit(userId: string, endpoint: string): Promise<boolean> {
    const correlationId = generateCorrelationId()

    // Find matching endpoint limit
    let limit: RateLimit | undefined
    let matchedEndpoint: string | undefined

    for (const [pattern, endpointLimit] of Object.entries(this.endpointLimits)) {
      if (endpoint.startsWith(pattern)) {
        limit = endpointLimit
        matchedEndpoint = pattern
        break
      }
    }

    // No specific limit for this endpoint - use default
    if (!limit) {
      limit = { requests: 60, windowMs: 60000 } // Default: 60 per minute
      matchedEndpoint = 'default'
    }

    const key = `endpoint:${userId}:${matchedEndpoint}`
    const result = await this.checkRateLimit(key, limit)

    if (!result.allowed) {
      await securityLogger.logRateLimitExceeded(
        userId,
        endpoint,
        'unknown',
        correlationId
      )
    }

    return result.allowed
  }

  /**
   * Check IP-based rate limit
   */
  async checkIPLimit(ipAddress: string): Promise<boolean> {
    const correlationId = generateCorrelationId()

    // Aggressive IP-based limit to prevent abuse
    const limit: RateLimit = {
      requests: 100,
      windowMs: 60000 // 100 requests per minute per IP
    }

    const key = `ip:${ipAddress}`
    const result = await this.checkRateLimit(key, limit)

    if (!result.allowed) {
      await securityLogger.logSecurityViolation({
        type: 'RATE_LIMIT_EXCEEDED',
        severity: 'HIGH',
        description: `IP rate limit exceeded: ${ipAddress}`,
        ipAddress,
        correlationId
      })
    }

    return result.allowed
  }

  /**
   * Reset rate limits for a specific user
   */
  async resetUserLimits(userId: string): Promise<void> {
    const keysToDelete: string[] = []

    for (const key of this.store.keys()) {
      if (key.includes(userId)) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      this.store.delete(key)
    }

    securityLogger.logInfo('User rate limits reset', { userId })
  }

  /**
   * Get rate limit status for a key
   */
  async getRateLimitStatus(key: string, limit: RateLimit): Promise<RateLimitResult> {
    const entry = this.store.get(key)
    const now = new Date()

    if (!entry || now >= entry.resetTime) {
      return {
        allowed: true,
        remaining: limit.requests,
        resetTime: new Date(now.getTime() + limit.windowMs)
      }
    }

    return {
      allowed: entry.count < limit.requests,
      remaining: Math.max(0, limit.requests - entry.count),
      resetTime: entry.resetTime,
      retryAfter: entry.count >= limit.requests 
        ? Math.ceil((entry.resetTime.getTime() - now.getTime()) / 1000)
        : undefined
    }
  }

  /**
   * Check combined user and IP rate limit
   */
  async checkCombinedLimit(
    userId: string, 
    ipAddress: string, 
    endpoint: string
  ): Promise<RateLimitResult> {
    // Check IP limit first (more restrictive)
    const ipAllowed = await this.checkIPLimit(ipAddress)
    if (!ipAllowed) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(Date.now() + 60000),
        retryAfter: 60
      }
    }

    // Check endpoint-specific limit
    const endpointAllowed = await this.checkEndpointLimit(userId, endpoint)
    if (!endpointAllowed) {
      // Get the actual limit info
      let limit: RateLimit | undefined
      for (const [pattern, endpointLimit] of Object.entries(this.endpointLimits)) {
        if (endpoint.startsWith(pattern)) {
          limit = endpointLimit
          break
        }
      }
      
      if (!limit) {
        limit = { requests: 60, windowMs: 60000 }
      }

      const key = `endpoint:${userId}:${endpoint}`
      return this.getRateLimitStatus(key, limit)
    }

    // Both checks passed
    return {
      allowed: true,
      remaining: 999, // Placeholder
      resetTime: new Date(Date.now() + 60000)
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = new Date()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      this.store.delete(key)
    }

    if (keysToDelete.length > 0) {
      securityLogger.logDebug('Rate limiter cleanup', {
        entriesRemoved: keysToDelete.length,
        remainingEntries: this.store.size
      })
    }
  }

  /**
   * Get current store size
   */
  getStoreSize(): number {
    return this.store.size
  }

  /**
   * Get endpoint limits configuration
   */
  getEndpointLimits(): Record<string, RateLimit> {
    return { ...this.endpointLimits }
  }

  /**
   * Destroy the rate limiter (cleanup)
   */
  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.store.clear()
  }
}

// Singleton instance
export const rateLimiter = new RateLimiterService()
