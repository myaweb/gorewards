/**
 * Performance Monitor Service
 * 
 * Provides comprehensive performance monitoring with
 * response time tracking, database monitoring, and alerting.
 */

import { 
  PerformanceMonitor, 
  PerformanceMetric,
  PerformanceAlert,
  TimeRange,
  PerformanceMetrics,
  SystemHealth,
  MemoryUsage
} from '@/lib/types/security'
import { securityLogger } from './securityLogger'
import { generateCorrelationId, generateSessionId } from '../utils/crypto'

export class PerformanceMonitorService implements PerformanceMonitor {
  private readonly metrics: Map<string, PerformanceMetric[]> = new Map()
  private readonly maxMetricsPerEndpoint = 1000
  private readonly startTime = Date.now()

  // Performance thresholds
  private readonly thresholds = {
    responseTime: 2000, // 2 seconds
    databaseQueryTime: 500, // 500ms
    errorRate: 0.05, // 5%
    memoryUsage: 85 // 85%
  }

  /**
   * Record API response time
   */
  recordResponseTime(endpoint: string, duration: number, correlationId?: string): void {
    const metric: PerformanceMetric = {
      metricType: 'RESPONSE_TIME',
      endpoint,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      timeWindow: 60,
      requestId: correlationId
    }

    this.storeMetric(endpoint, metric)

    // Log slow responses
    if (duration > this.thresholds.responseTime) {
      securityLogger.logWarn('Slow API response detected', {
        endpoint,
        duration,
        threshold: this.thresholds.responseTime,
        correlationId
      })
    }
  }

  /**
   * Record database query performance
   */
  recordDatabaseQuery(query: string, duration: number, correlationId?: string): void {
    const metric: PerformanceMetric = {
      metricType: 'DATABASE_QUERY_TIME',
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      timeWindow: 60,
      requestId: correlationId,
      metadata: {
        query: query.substring(0, 100) // Truncate long queries
      }
    }

    this.storeMetric('database', metric)

    // Log slow queries
    if (duration > this.thresholds.databaseQueryTime) {
      securityLogger.logSlowQuery(query, duration, correlationId || generateCorrelationId())
    }
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(usage: MemoryUsage, correlationId?: string): void {
    const metric: PerformanceMetric = {
      metricType: 'MEMORY_USAGE',
      value: usage.percentage,
      unit: 'percent',
      timestamp: new Date(),
      timeWindow: 60,
      requestId: correlationId,
      metadata: {
        used: usage.used,
        total: usage.total
      }
    }

    this.storeMetric('system', metric)

    // Log high memory usage
    if (usage.percentage > this.thresholds.memoryUsage) {
      securityLogger.logWarn('High memory usage detected', {
        percentage: usage.percentage,
        used: usage.used,
        total: usage.total,
        correlationId
      })
    }
  }

  /**
   * Check performance thresholds and return alerts
   */
  async checkPerformanceThresholds(): Promise<PerformanceAlert[]> {
    const alerts: PerformanceAlert[] = []
    const now = new Date()

    // Check response times
    for (const [endpoint, metrics] of this.metrics.entries()) {
      if (endpoint === 'database' || endpoint === 'system') continue

      const recentMetrics = metrics.filter(m => 
        m.metricType === 'RESPONSE_TIME' &&
        now.getTime() - m.timestamp!.getTime() < 300000 // Last 5 minutes
      )

      if (recentMetrics.length > 0) {
        const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length

        if (avgResponseTime > this.thresholds.responseTime) {
          alerts.push({
            type: 'RESPONSE_TIME',
            severity: avgResponseTime > this.thresholds.responseTime * 2 ? 'CRITICAL' : 'HIGH',
            message: `High average response time for ${endpoint}`,
            threshold: this.thresholds.responseTime,
            currentValue: avgResponseTime,
            endpoint,
            timestamp: now
          })
        }
      }
    }

    // Check database performance
    const dbMetrics = this.metrics.get('database') || []
    const recentDbMetrics = dbMetrics.filter(m =>
      now.getTime() - m.timestamp!.getTime() < 300000
    )

    if (recentDbMetrics.length > 0) {
      const avgQueryTime = recentDbMetrics.reduce((sum, m) => sum + m.value, 0) / recentDbMetrics.length

      if (avgQueryTime > this.thresholds.databaseQueryTime) {
        alerts.push({
          type: 'DATABASE_SLOW',
          severity: avgQueryTime > this.thresholds.databaseQueryTime * 2 ? 'CRITICAL' : 'MEDIUM',
          message: 'Slow database queries detected',
          threshold: this.thresholds.databaseQueryTime,
          currentValue: avgQueryTime,
          timestamp: now
        })
      }
    }

    // Check memory usage
    const systemMetrics = this.metrics.get('system') || []
    const recentMemoryMetrics = systemMetrics.filter(m =>
      m.metricType === 'MEMORY_USAGE' &&
      now.getTime() - m.timestamp!.getTime() < 60000 // Last minute
    )

    if (recentMemoryMetrics.length > 0) {
      const latestMemory = recentMemoryMetrics[recentMemoryMetrics.length - 1]

      if (latestMemory.value > this.thresholds.memoryUsage) {
        alerts.push({
          type: 'MEMORY_USAGE',
          severity: latestMemory.value > 95 ? 'CRITICAL' : 'HIGH',
          message: 'High memory usage detected',
          threshold: this.thresholds.memoryUsage,
          currentValue: latestMemory.value,
          timestamp: now
        })
      }
    }

    return alerts
  }

  /**
   * Trigger an alert
   */
  async triggerAlert(alert: PerformanceAlert): Promise<void> {
    await securityLogger.logSecurityViolation({
      type: 'SUSPICIOUS_ACTIVITY',
      severity: alert.severity as any,
      description: alert.message,
      ipAddress: 'system',
      endpoint: alert.endpoint,
      correlationId: generateCorrelationId(),
      metadata: {
        alertType: alert.type,
        threshold: alert.threshold,
        currentValue: alert.currentValue
      }
    })
  }

  /**
   * Get performance metrics for a time range
   */
  async getPerformanceMetrics(timeRange: TimeRange): Promise<PerformanceMetrics> {
    const allMetrics: PerformanceMetric[] = []
    
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics.filter(m =>
        m.timestamp! >= timeRange.start && m.timestamp! <= timeRange.end
      ))
    }

    // Calculate average response time
    const responseTimeMetrics = allMetrics.filter(m => m.metricType === 'RESPONSE_TIME')
    const averageResponseTime = responseTimeMetrics.length > 0
      ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length
      : 0

    // Calculate error rate (placeholder - would need error tracking)
    const errorRate = 0

    // Calculate throughput (requests per second)
    const duration = (timeRange.end.getTime() - timeRange.start.getTime()) / 1000
    const throughput = responseTimeMetrics.length / duration

    // Get memory usage
    const memoryMetrics = allMetrics.filter(m => m.metricType === 'MEMORY_USAGE')
    const latestMemory = memoryMetrics[memoryMetrics.length - 1]
    const memoryUsage: MemoryUsage = latestMemory?.metadata
      ? {
          used: latestMemory.metadata.used,
          total: latestMemory.metadata.total,
          percentage: latestMemory.value
        }
      : { used: 0, total: 0, percentage: 0 }

    // Get database performance
    const dbMetrics = allMetrics.filter(m => m.metricType === 'DATABASE_QUERY_TIME')
    const averageQueryTime = dbMetrics.length > 0
      ? dbMetrics.reduce((sum, m) => sum + m.value, 0) / dbMetrics.length
      : 0
    const slowQueries = dbMetrics.filter(m => m.value > this.thresholds.databaseQueryTime).length

    return {
      averageResponseTime,
      errorRate,
      throughput,
      memoryUsage,
      databasePerformance: {
        averageQueryTime,
        slowQueries,
        connectionPoolUsage: 0 // Placeholder
      }
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const now = new Date()
    const alerts = await this.checkPerformanceThresholds()
    
    // Determine overall status
    let status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY'
    
    if (alerts.some(a => a.severity === 'CRITICAL')) {
      status = 'CRITICAL'
    } else if (alerts.length > 0) {
      status = 'DEGRADED'
    }

    // Convert alerts to health issues
    const issues = alerts.map(alert => ({
      type: alert.type,
      severity: alert.severity,
      description: alert.message,
      timestamp: alert.timestamp
    }))

    return {
      status,
      uptime: Date.now() - this.startTime,
      lastCheck: now,
      issues
    }
  }

  /**
   * Store a metric
   */
  private storeMetric(key: string, metric: PerformanceMetric): void {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }

    const metrics = this.metrics.get(key)!
    metrics.push(metric)

    // Cleanup old metrics
    if (metrics.length > this.maxMetricsPerEndpoint) {
      metrics.shift()
    }

    // Also log to security logger for persistence
    securityLogger.logPerformanceMetric(metric)
  }

  /**
   * Get current metrics count
   */
  getMetricsCount(): number {
    let total = 0
    for (const metrics of this.metrics.values()) {
      total += metrics.length
    }
    return total
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear()
  }

  /**
   * Get configuration
   */
  getConfig() {
    return {
      thresholds: this.thresholds,
      maxMetricsPerEndpoint: this.maxMetricsPerEndpoint,
      currentMetricsCount: this.getMetricsCount(),
      uptime: Date.now() - this.startTime
    }
  }

  /**
   * Get current memory usage
   */
  getCurrentMemoryUsage(): MemoryUsage {
    const usage = process.memoryUsage()
    const total = usage.heapTotal
    const used = usage.heapUsed
    
    return {
      used,
      total,
      percentage: (used / total) * 100
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitorService()
