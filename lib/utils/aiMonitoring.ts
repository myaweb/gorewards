/**
 * Simple AI usage monitoring
 * Production'da proper monitoring service kullanılmalı (Sentry, DataDog, etc.)
 */

interface AIUsageLog {
  timestamp: Date
  slug: string
  cached: boolean
  success: boolean
  error?: string
  tokensUsed?: number
}

// In-memory log (production'da database veya external service)
const usageLogs: AIUsageLog[] = []
const MAX_LOGS = 1000 // Keep last 1000 logs

/**
 * Log AI verdict generation
 */
export function logAIUsage(log: Omit<AIUsageLog, 'timestamp'>) {
  usageLogs.push({
    ...log,
    timestamp: new Date(),
  })

  // Keep only last MAX_LOGS entries
  if (usageLogs.length > MAX_LOGS) {
    usageLogs.shift()
  }

  // Console log for development
  if (process.env.NODE_ENV === 'development') {
    console.log('[AI Usage]', {
      slug: log.slug,
      cached: log.cached,
      success: log.success,
      error: log.error,
    })
  }
}

/**
 * Get usage statistics
 */
export function getAIUsageStats() {
  const now = Date.now()
  const last24h = usageLogs.filter(log => 
    now - log.timestamp.getTime() < 24 * 60 * 60 * 1000
  )

  const totalRequests = last24h.length
  const cachedRequests = last24h.filter(log => log.cached).length
  const failedRequests = last24h.filter(log => !log.success).length
  const successRate = totalRequests > 0 
    ? ((totalRequests - failedRequests) / totalRequests * 100).toFixed(1)
    : '0'

  return {
    last24Hours: {
      totalRequests,
      cachedRequests,
      newGenerations: totalRequests - cachedRequests,
      failedRequests,
      successRate: `${successRate}%`,
    },
    allTime: {
      totalLogs: usageLogs.length,
    }
  }
}

/**
 * Get recent errors
 */
export function getRecentErrors(limit = 10) {
  return usageLogs
    .filter(log => !log.success && log.error)
    .slice(-limit)
    .reverse()
    .map(log => ({
      timestamp: log.timestamp,
      slug: log.slug,
      error: log.error,
    }))
}
