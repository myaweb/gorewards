/**
 * Security Logger Service
 * 
 * Provides centralized security logging with structured JSON output,
 * audit trails, security event tracking, and correlation ID support.
 */

import { prisma } from '@/lib/prisma'
import { 
  SecurityLogger, 
  AuditEvent, 
  SecurityViolation, 
  PerformanceMetric 
} from '@/lib/types/security'
import { 
  AuditSeverity, 
  AuditCategory, 
  SecurityEventStatus 
} from '@prisma/client'

export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'

export class SecurityLoggerService implements SecurityLogger {
  private readonly logLevel: LogLevel
  private readonly enableConsoleOutput: boolean
  private readonly enableDatabaseLogging: boolean

  constructor(config?: {
    logLevel?: LogLevel
    enableConsoleOutput?: boolean
    enableDatabaseLogging?: boolean
  }) {
    this.logLevel = config?.logLevel || (process.env.LOG_LEVEL as LogLevel) || 'INFO'
    this.enableConsoleOutput = config?.enableConsoleOutput ?? true
    this.enableDatabaseLogging = config?.enableDatabaseLogging ?? true
  }

  // =============================================================================
  // AUDIT LOGGING
  // =============================================================================

  async logAuditEvent(event: AuditEvent): Promise<void> {
    try {
      // Store in database
      if (this.enableDatabaseLogging) {
        await prisma.auditLog.create({
          data: {
            userId: event.userId,
            action: event.action,
            resource: event.resource,
            resourceId: event.resourceId,
            ipAddress: event.ipAddress,
            userAgent: event.userAgent,
            endpoint: event.endpoint,
            method: event.method,
            oldData: event.oldData,
            newData: event.newData,
            correlationId: event.correlationId,
            sessionId: event.sessionId,
            severity: event.severity,
            category: event.category
          }
        })
      }

      // Structured console output
      if (this.enableConsoleOutput) {
        this.logStructured('INFO', 'AUDIT_EVENT', {
          ...event,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Failed to log audit event:', error)
    }
  }

  async logAdminAccess(
    userId: string, 
    action: string, 
    resource: string, 
    ipAddress: string, 
    correlationId: string
  ): Promise<void> {
    await this.logAuditEvent({
      userId,
      action,
      resource,
      ipAddress,
      endpoint: '/api/admin',
      method: 'POST',
      correlationId,
      severity: AuditSeverity.CRITICAL,
      category: AuditCategory.AUTHORIZATION
    })
  }

  async logTokenRefresh(
    userId: string, 
    success: boolean, 
    correlationId: string
  ): Promise<void> {
    await this.logAuditEvent({
      userId,
      action: success ? 'TOKEN_REFRESH_SUCCESS' : 'TOKEN_REFRESH_FAILURE',
      resource: 'plaid_token',
      ipAddress: 'system',
      endpoint: '/internal/token-refresh',
      method: 'POST',
      correlationId,
      severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
      category: AuditCategory.TOKEN_MANAGEMENT
    })
  }

  // =============================================================================
  // SECURITY EVENTS
  // =============================================================================

  async logSecurityViolation(violation: SecurityViolation): Promise<void> {
    try {
      // Store in database
      if (this.enableDatabaseLogging) {
        await prisma.securityEvent.create({
          data: {
            type: violation.type,
            severity: violation.severity,
            description: violation.description,
            ipAddress: violation.ipAddress,
            userAgent: violation.userAgent,
            endpoint: violation.endpoint,
            userId: violation.userId,
            detectionRule: violation.detectionRule,
            riskScore: violation.riskScore,
            metadata: violation.metadata,
            correlationId: violation.correlationId,
            status: SecurityEventStatus.OPEN
          }
        })
      }

      // Structured console output
      if (this.enableConsoleOutput) {
        this.logStructured('WARN', 'SECURITY_VIOLATION', {
          ...violation,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Failed to log security violation:', error)
    }
  }

  async logRateLimitExceeded(
    userId: string, 
    endpoint: string, 
    ipAddress: string, 
    correlationId: string
  ): Promise<void> {
    await this.logSecurityViolation({
      type: 'RATE_LIMIT_EXCEEDED',
      severity: 'MEDIUM',
      description: `Rate limit exceeded for endpoint: ${endpoint}`,
      ipAddress,
      endpoint,
      userId,
      correlationId
    })
  }

  async logInputValidationFailure(
    input: string, 
    reason: string, 
    endpoint: string, 
    correlationId: string
  ): Promise<void> {
    await this.logSecurityViolation({
      type: 'INPUT_VALIDATION_FAILURE',
      severity: 'MEDIUM',
      description: `Input validation failed: ${reason}`,
      ipAddress: 'unknown',
      endpoint,
      metadata: {
        inputLength: input.length,
        reason
      },
      correlationId
    })
  }

  // =============================================================================
  // PERFORMANCE LOGGING
  // =============================================================================

  async logPerformanceMetric(metric: PerformanceMetric): Promise<void> {
    try {
      // Store in database
      if (this.enableDatabaseLogging) {
        await prisma.performanceMetric.create({
          data: {
            metricType: metric.metricType,
            endpoint: metric.endpoint,
            value: metric.value,
            unit: metric.unit,
            timeWindow: metric.timeWindow || 60, // Default to 60 seconds
            userId: metric.userId,
            requestId: metric.requestId,
            metadata: metric.metadata
          }
        })
      }

      // Structured console output (only for slow operations)
      if (this.enableConsoleOutput && this.shouldLogPerformance(metric)) {
        this.logStructured('INFO', 'PERFORMANCE_METRIC', {
          ...metric,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Failed to log performance metric:', error)
    }
  }

  async logSlowQuery(
    query: string, 
    duration: number, 
    correlationId: string
  ): Promise<void> {
    await this.logPerformanceMetric({
      metricType: 'DATABASE_QUERY_TIME',
      value: duration,
      unit: 'ms',
      timeWindow: 60, // 60 second window
      requestId: correlationId,
      metadata: {
        query: query.substring(0, 200), // Truncate long queries
        isSlow: true
      }
    })
  }

  // =============================================================================
  // STRUCTURED LOGGING
  // =============================================================================

  logInfo(message: string, metadata?: Record<string, any>, correlationId?: string): void {
    if (this.shouldLog('INFO')) {
      this.logStructured('INFO', message, metadata, correlationId)
    }
  }

  logWarn(message: string, metadata?: Record<string, any>, correlationId?: string): void {
    if (this.shouldLog('WARN')) {
      this.logStructured('WARN', message, metadata, correlationId)
    }
  }

  logError(
    message: string, 
    error?: Error, 
    metadata?: Record<string, any>, 
    correlationId?: string
  ): void {
    if (this.shouldLog('ERROR')) {
      this.logStructured('ERROR', message, {
        ...metadata,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : undefined
      }, correlationId)
    }
  }

  logDebug(message: string, metadata?: Record<string, any>, correlationId?: string): void {
    if (this.shouldLog('DEBUG')) {
      this.logStructured('DEBUG', message, metadata, correlationId)
    }
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private logStructured(
    level: LogLevel, 
    message: string, 
    metadata?: Record<string, any>,
    correlationId?: string
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: correlationId || metadata?.correlationId,
      ...metadata
    }

    const logString = JSON.stringify(logEntry)

    switch (level) {
      case 'ERROR':
        console.error(logString)
        break
      case 'WARN':
        console.warn(logString)
        break
      case 'DEBUG':
        console.debug(logString)
        break
      default:
        console.log(logString)
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['ERROR', 'WARN', 'INFO', 'DEBUG']
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const requestedLevelIndex = levels.indexOf(level)
    return requestedLevelIndex <= currentLevelIndex
  }

  private shouldLogPerformance(metric: PerformanceMetric): boolean {
    // Only log slow operations to console
    if (metric.metricType === 'RESPONSE_TIME' && metric.value > 1000) return true
    if (metric.metricType === 'DATABASE_QUERY_TIME' && metric.value > 500) return true
    if (metric.metricType === 'MEMORY_USAGE' && metric.value > 80) return true
    return false
  }

  // =============================================================================
  // CONFIGURATION
  // =============================================================================

  getConfig() {
    return {
      logLevel: this.logLevel,
      enableConsoleOutput: this.enableConsoleOutput,
      enableDatabaseLogging: this.enableDatabaseLogging
    }
  }

  setLogLevel(level: LogLevel): void {
    (this as any).logLevel = level
  }
}

// Singleton instance
export const securityLogger = new SecurityLoggerService()
