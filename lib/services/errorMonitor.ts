/**
 * Error Monitor Service
 * 
 * Provides comprehensive error monitoring with sanitization,
 * Sentry integration, and error analysis.
 */

import { 
  ErrorMonitor, 
  ErrorContext, 
  Exception, 
  ClientError,
  ErrorTrends,
  ErrorStatistics,
  TimeRange
} from '@/lib/types/security'
import { securityLogger } from './securityLogger'
import { generateCorrelationId, generateSessionId } from '../utils/crypto'

export class ErrorMonitorService implements ErrorMonitor {
  private readonly errorStore: Map<string, { error: Error; context: ErrorContext; timestamp: Date }> = new Map()
  private readonly maxStoredErrors = 1000
  private readonly sentryEnabled: boolean

  constructor() {
    this.sentryEnabled = !!process.env.SENTRY_DSN
    
    if (this.sentryEnabled) {
      console.log('✅ Sentry error monitoring enabled')
    } else {
      console.log('⚠️  Sentry not configured - errors will be logged locally only')
    }
  }

  /**
   * Capture an error with context
   */
  async captureError(error: Error, context: ErrorContext): Promise<void> {
    try {
      // Store error locally
      const errorId = generateCorrelationId()
      this.errorStore.set(errorId, {
        error,
        context,
        timestamp: new Date()
      })

      // Cleanup old errors if store is too large
      if (this.errorStore.size > this.maxStoredErrors) {
        const oldestKey = this.errorStore.keys().next().value
        if (oldestKey) {
          this.errorStore.delete(oldestKey)
        }
      }

      // Log error with security logger
      await securityLogger.logError(
        `Error captured: ${error.message}`,
        error,
        {
          endpoint: context.endpoint,
          userId: context.userId,
          ipAddress: context.ipAddress,
          correlationId: context.correlationId,
          requestId: context.requestId
        },
        context.correlationId
      )

      // Send to Sentry if enabled
      if (this.sentryEnabled) {
        await this.sendToSentry(error, context)
      }

    } catch (captureError) {
      console.error('Failed to capture error:', captureError)
    }
  }

  /**
   * Capture an exception
   */
  async captureException(exception: Exception): Promise<void> {
    const error = new Error(exception.message)
    error.name = exception.name
    error.stack = exception.stack

    const context: ErrorContext = {
      endpoint: 'unknown',
      requestId: generateCorrelationId(),
      userAgent: 'unknown',
      ipAddress: 'unknown',
      timestamp: new Date(),
      correlationId: generateCorrelationId()
    }

    await this.captureError(error, context)
  }

  /**
   * Sanitize error for client response
   */
  sanitizeErrorForClient(error: Error): ClientError {
    const requestId = generateCorrelationId()

    // Generic error messages for security
    const sanitizedMessages: Record<string, string> = {
      'ECONNREFUSED': 'Service temporarily unavailable',
      'ETIMEDOUT': 'Request timeout',
      'ENOTFOUND': 'Service unavailable',
      'ValidationError': 'Invalid input provided',
      'UnauthorizedError': 'Authentication required',
      'ForbiddenError': 'Access denied'
    }

    // Determine error code
    let code = 'INTERNAL_ERROR'
    let message = 'An unexpected error occurred'

    // Check for known error types
    if (error.name in sanitizedMessages) {
      code = error.name
      message = sanitizedMessages[error.name]
    } else if (error.message.includes('validation')) {
      code = 'VALIDATION_ERROR'
      message = 'Invalid input provided'
    } else if (error.message.includes('auth')) {
      code = 'AUTH_ERROR'
      message = 'Authentication failed'
    } else if (error.message.includes('not found')) {
      code = 'NOT_FOUND'
      message = 'Resource not found'
    }

    return {
      message,
      code,
      requestId,
      timestamp: new Date()
    }
  }

  /**
   * Sanitize stack trace
   */
  sanitizeStackTrace(stackTrace: string): string {
    if (!stackTrace) return ''

    // Remove sensitive information from stack traces
    let sanitized = stackTrace

    // Remove file paths
    sanitized = sanitized.replace(/\/[^\s]+\//g, '[PATH]/')
    
    // Remove line numbers (optional - keep for debugging)
    // sanitized = sanitized.replace(/:\d+:\d+/g, ':XX:XX')

    // Remove environment variables
    sanitized = sanitized.replace(/process\.env\.[A-Z_]+/g, 'process.env.[REDACTED]')

    // Remove potential secrets
    sanitized = sanitized.replace(/[a-f0-9]{32,}/gi, '[REDACTED]')

    return sanitized
  }

  /**
   * Send error to Sentry
   */
  async sendToSentry(error: Error, context: ErrorContext): Promise<void> {
    if (!this.sentryEnabled) {
      return
    }

    try {
      // In production, this would use the Sentry SDK
      // For now, we'll log that we would send to Sentry
      securityLogger.logDebug('Would send to Sentry', {
        errorName: error.name,
        errorMessage: error.message,
        endpoint: context.endpoint,
        userId: context.userId,
        correlationId: context.correlationId
      })

      // Example Sentry integration (commented out):
      // const Sentry = require('@sentry/node')
      // Sentry.captureException(error, {
      //   user: { id: context.userId },
      //   tags: {
      //     endpoint: context.endpoint,
      //     correlationId: context.correlationId
      //   },
      //   extra: {
      //     requestId: context.requestId,
      //     ipAddress: context.ipAddress,
      //     userAgent: context.userAgent
      //   }
      // })

    } catch (sentryError) {
      console.error('Failed to send to Sentry:', sentryError)
    }
  }

  /**
   * Get error trends over time
   */
  async getErrorTrends(timeRange: TimeRange): Promise<ErrorTrends> {
    const errors = Array.from(this.errorStore.values())
      .filter(entry => 
        entry.timestamp >= timeRange.start && 
        entry.timestamp <= timeRange.end
      )

    // Count errors by message
    const errorCounts = new Map<string, number>()
    const errorLastSeen = new Map<string, Date>()

    for (const entry of errors) {
      const message = entry.error.message
      errorCounts.set(message, (errorCounts.get(message) || 0) + 1)
      
      const lastSeen = errorLastSeen.get(message)
      if (!lastSeen || entry.timestamp > lastSeen) {
        errorLastSeen.set(message, entry.timestamp)
      }
    }

    // Calculate top errors
    const topErrors = Array.from(errorCounts.entries())
      .map(([message, count]) => ({
        message,
        count,
        percentage: (count / errors.length) * 100,
        lastOccurrence: errorLastSeen.get(message)!
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Calculate time series data (hourly buckets)
    const timeSeriesData = this.calculateTimeSeries(errors, timeRange)

    return {
      totalErrors: errors.length,
      errorRate: errors.length / ((timeRange.end.getTime() - timeRange.start.getTime()) / 1000),
      topErrors,
      timeSeriesData
    }
  }

  /**
   * Get errors grouped by type
   */
  async getErrorsByType(): Promise<ErrorStatistics> {
    const errors = Array.from(this.errorStore.values())

    const byType: Record<string, number> = {}
    const byEndpoint: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}

    for (const entry of errors) {
      // By type
      const type = entry.error.name || 'Unknown'
      byType[type] = (byType[type] || 0) + 1

      // By endpoint
      const endpoint = entry.context.endpoint
      byEndpoint[endpoint] = (byEndpoint[endpoint] || 0) + 1

      // By severity (based on error type)
      const severity = this.determineSeverity(entry.error)
      bySeverity[severity] = (bySeverity[severity] || 0) + 1
    }

    return {
      byType,
      byEndpoint,
      bySeverity,
      totalCount: errors.length
    }
  }

  /**
   * Calculate time series data
   */
  private calculateTimeSeries(
    errors: Array<{ error: Error; context: ErrorContext; timestamp: Date }>,
    timeRange: TimeRange
  ) {
    const hourlyBuckets = new Map<number, number>()
    const duration = timeRange.end.getTime() - timeRange.start.getTime()
    const bucketSize = Math.max(3600000, duration / 24) // At least 1 hour buckets

    for (const entry of errors) {
      const bucketIndex = Math.floor(
        (entry.timestamp.getTime() - timeRange.start.getTime()) / bucketSize
      )
      hourlyBuckets.set(bucketIndex, (hourlyBuckets.get(bucketIndex) || 0) + 1)
    }

    return Array.from(hourlyBuckets.entries())
      .map(([index, count]) => ({
        timestamp: new Date(timeRange.start.getTime() + index * bucketSize),
        errorCount: count,
        errorRate: count / (bucketSize / 1000)
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error): string {
    const criticalPatterns = ['ECONNREFUSED', 'Database', 'Fatal']
    const highPatterns = ['Auth', 'Permission', 'Forbidden']
    const mediumPatterns = ['Validation', 'NotFound', 'Timeout']

    const errorString = `${error.name} ${error.message}`

    if (criticalPatterns.some(pattern => errorString.includes(pattern))) {
      return 'CRITICAL'
    }
    if (highPatterns.some(pattern => errorString.includes(pattern))) {
      return 'HIGH'
    }
    if (mediumPatterns.some(pattern => errorString.includes(pattern))) {
      return 'MEDIUM'
    }
    return 'LOW'
  }

  /**
   * Get error store size
   */
  getErrorCount(): number {
    return this.errorStore.size
  }

  /**
   * Clear error store
   */
  clearErrors(): void {
    this.errorStore.clear()
  }

  /**
   * Get configuration
   */
  getConfig() {
    return {
      sentryEnabled: this.sentryEnabled,
      maxStoredErrors: this.maxStoredErrors,
      currentErrorCount: this.errorStore.size
    }
  }
}

// Singleton instance
export const errorMonitor = new ErrorMonitorService()
