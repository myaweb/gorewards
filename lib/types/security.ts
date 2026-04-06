/**
 * Security Services Type Definitions
 * 
 * Core types for the GoRewards security infrastructure including
 * audit logging, token encryption, admin authentication, and monitoring.
 */

import { 
  AuditSeverity, 
  AuditCategory, 
  SecurityEventType, 
  SecuritySeverity, 
  SecurityEventStatus,
  PerformanceMetricType,
  TokenType 
} from '@prisma/client'

// =============================================================================
// AUDIT LOGGING TYPES
// =============================================================================

export interface AuditEvent {
  id?: string
  userId?: string
  action: string
  resource: string
  resourceId?: string
  ipAddress: string
  userAgent?: string
  endpoint: string
  method: string
  oldData?: Record<string, any>
  newData?: Record<string, any>
  correlationId: string
  sessionId?: string
  severity: AuditSeverity
  category: AuditCategory
  timestamp?: Date
}

export interface SecurityViolation {
  type: SecurityEventType
  severity: SecuritySeverity
  description: string
  ipAddress: string
  userAgent?: string
  endpoint?: string
  userId?: string
  detectionRule?: string
  riskScore?: number
  metadata?: Record<string, any>
  correlationId: string
}

// =============================================================================
// SECURITY LOGGER INTERFACE
// =============================================================================

export interface SecurityLogger {
  // Audit logging
  logAuditEvent(event: AuditEvent): Promise<void>
  logAdminAccess(userId: string, action: string, resource: string, ipAddress: string, correlationId: string): Promise<void>
  logTokenRefresh(userId: string, success: boolean, correlationId: string): Promise<void>
  
  // Security events
  logSecurityViolation(violation: SecurityViolation): Promise<void>
  logRateLimitExceeded(userId: string, endpoint: string, ipAddress: string, correlationId: string): Promise<void>
  logInputValidationFailure(input: string, reason: string, endpoint: string, correlationId: string): Promise<void>
  
  // Performance logging
  logPerformanceMetric(metric: PerformanceMetric): Promise<void>
  logSlowQuery(query: string, duration: number, correlationId: string): Promise<void>
  
  // Structured logging
  logInfo(message: string, metadata?: Record<string, any>, correlationId?: string): void
  logWarn(message: string, metadata?: Record<string, any>, correlationId?: string): void
  logError(message: string, error?: Error, metadata?: Record<string, any>, correlationId?: string): void
  logDebug(message: string, metadata?: Record<string, any>, correlationId?: string): void
}

// =============================================================================
// TOKEN ENCRYPTION TYPES
// =============================================================================

export interface TokenEncryptor {
  // Plaid token encryption
  encryptPlaidToken(token: string): Promise<string>
  decryptPlaidToken(encryptedToken: string): Promise<string>
  
  // Token refresh
  refreshPlaidToken(userId: string, itemId: string): Promise<RefreshResult>
  
  // Key management
  rotateEncryptionKey(): Promise<void>
  validateEncryptionKey(): boolean
  
  // Generic token operations
  encryptToken(token: string, tokenType: TokenType): Promise<string>
  decryptToken(encryptedToken: string, tokenType: TokenType): Promise<string>
}

export interface RefreshResult {
  success: boolean
  newToken?: string
  error?: string
  requiresReauth: boolean
}

// =============================================================================
// ADMIN AUTHENTICATION TYPES
// =============================================================================

export interface AdminAuthenticator {
  // Admin validation
  validateAdminAccess(clerkUserId: string): Promise<AdminValidationResult>
  checkAdminPermission(userId: string, permission: AdminPermission): Promise<boolean>
  
  // Session management
  createAdminSession(userId: string, ipAddress: string): Promise<AdminSession>
  validateAdminSession(sessionId: string): Promise<boolean>
  revokeAdminSession(sessionId: string): Promise<void>
}

export interface AdminValidationResult {
  isValid: boolean
  isAdmin: boolean
  permissions: AdminPermission[]
  sessionId: string
}

export interface AdminSession {
  id: string
  userId: string
  ipAddress: string
  createdAt: Date
  expiresAt: Date
}

export type AdminPermission = 
  | 'CARD_MANAGEMENT'
  | 'USER_MANAGEMENT'
  | 'SYSTEM_MONITORING'
  | 'AUDIT_ACCESS'
  | 'SECURITY_SETTINGS'

// =============================================================================
// RATE LIMITING TYPES
// =============================================================================

export interface RateLimiter {
  // Rate limit checking
  checkRateLimit(key: string, limit: RateLimit): Promise<RateLimitResult>
  
  // Endpoint-specific limits
  checkEndpointLimit(userId: string, endpoint: string): Promise<boolean>
  
  // IP-based limits
  checkIPLimit(ipAddress: string): Promise<boolean>
  
  // Limit management
  resetUserLimits(userId: string): Promise<void>
}

export interface RateLimit {
  requests: number
  windowMs: number
  skipSuccessfulRequests?: boolean
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: Date
  retryAfter?: number
}

// =============================================================================
// INPUT VALIDATION TYPES
// =============================================================================

export interface InputValidator {
  // General validation
  validateAndSanitize(input: any, schema: ValidationSchema): ValidationResult
  
  // Specific validations
  validateSpendingAmount(amount: number): boolean
  validateWebhookPayload(payload: any, source: WebhookSource): boolean
  sanitizeTextInput(text: string): string
  
  // XSS protection
  preventXSS(input: string): string
  validateHTML(html: string): boolean
}

export interface ValidationResult {
  isValid: boolean
  sanitizedData: any
  errors: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationSchema {
  type: 'object' | 'string' | 'number' | 'boolean' | 'array'
  required?: boolean
  properties?: Record<string, ValidationSchema>
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
}

export type WebhookSource = 'STRIPE' | 'CLERK' | 'PLAID'

// =============================================================================
// PERFORMANCE MONITORING TYPES
// =============================================================================

export interface PerformanceMonitor {
  // Metric collection
  recordResponseTime(endpoint: string, duration: number, correlationId?: string): void
  recordDatabaseQuery(query: string, duration: number, correlationId?: string): void
  recordMemoryUsage(usage: MemoryUsage, correlationId?: string): void
  
  // Alert management
  checkPerformanceThresholds(): Promise<PerformanceAlert[]>
  triggerAlert(alert: PerformanceAlert): Promise<void>
  
  // Metric querying
  getPerformanceMetrics(timeRange: TimeRange): Promise<PerformanceMetrics>
  getSystemHealth(): Promise<SystemHealth>
}

export interface PerformanceMetric {
  metricType: PerformanceMetricType
  endpoint?: string
  value: number
  unit: string
  timestamp?: Date
  timeWindow?: number
  userId?: string
  requestId?: string
  metadata?: Record<string, any>
}

export interface MemoryUsage {
  used: number
  total: number
  percentage: number
}

export interface PerformanceAlert {
  type: 'RESPONSE_TIME' | 'ERROR_RATE' | 'MEMORY_USAGE' | 'DATABASE_SLOW'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  threshold: number
  currentValue: number
  endpoint?: string
  timestamp: Date
}

export interface TimeRange {
  start: Date
  end: Date
}

export interface PerformanceMetrics {
  averageResponseTime: number
  errorRate: number
  throughput: number
  memoryUsage: MemoryUsage
  databasePerformance: DatabaseMetrics
}

export interface DatabaseMetrics {
  averageQueryTime: number
  slowQueries: number
  connectionPoolUsage: number
}

export interface SystemHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL'
  uptime: number
  lastCheck: Date
  issues: HealthIssue[]
}

export interface HealthIssue {
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  timestamp: Date
}

// =============================================================================
// ERROR MONITORING TYPES
// =============================================================================

export interface ErrorMonitor {
  // Error capture
  captureError(error: Error, context: ErrorContext): Promise<void>
  captureException(exception: Exception): Promise<void>
  
  // Error sanitization
  sanitizeErrorForClient(error: Error): ClientError
  sanitizeStackTrace(stackTrace: string): string
  
  // Sentry integration
  sendToSentry(error: Error, context: ErrorContext): Promise<void>
  
  // Error analysis
  getErrorTrends(timeRange: TimeRange): Promise<ErrorTrends>
  getErrorsByType(): Promise<ErrorStatistics>
}

export interface ErrorContext {
  userId?: string
  endpoint: string
  requestId: string
  userAgent: string
  ipAddress: string
  timestamp: Date
  correlationId: string
}

export interface Exception {
  name: string
  message: string
  stack?: string
  code?: string
  statusCode?: number
}

export interface ClientError {
  message: string
  code: string
  requestId: string
  timestamp: Date
}

export interface ErrorTrends {
  totalErrors: number
  errorRate: number
  topErrors: ErrorSummary[]
  timeSeriesData: ErrorTimePoint[]
}

export interface ErrorSummary {
  message: string
  count: number
  percentage: number
  lastOccurrence: Date
}

export interface ErrorTimePoint {
  timestamp: Date
  errorCount: number
  errorRate: number
}

export interface ErrorStatistics {
  byType: Record<string, number>
  byEndpoint: Record<string, number>
  bySeverity: Record<string, number>
  totalCount: number
}

// =============================================================================
// CORRELATION AND REQUEST TRACKING
// =============================================================================

export interface RequestContext {
  id: string
  correlationId: string
  userId?: string
  ipAddress: string
  userAgent: string
  endpoint: string
  method: string
  startTime: Date
  metadata?: Record<string, any>
}

export interface CorrelationIdGenerator {
  generate(): string
  extractFromHeaders(headers: Record<string, string>): string | null
  addToHeaders(headers: Record<string, string>, correlationId: string): void
}

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

export interface SecurityConfig {
  encryption: {
    algorithm: string
    keyLength: number
    keyRotationDays: number
  }
  rateLimit: {
    ai: RateLimit
    plaid: RateLimit
    recommendations: RateLimit
    admin: RateLimit
  }
  monitoring: {
    responseTimeThreshold: number
    errorRateThreshold: number
    memoryUsageThreshold: number
  }
  audit: {
    retentionDays: number
    compressionEnabled: boolean
  }
}