/**
 * Security Health Check Endpoint
 * 
 * Provides comprehensive security status and health information
 * Protected by admin authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminRoute } from '@/lib/middleware/adminAuth'
import { getSecurityHealth } from '@/lib/security'
import { performanceMonitor } from '@/lib/services/performanceMonitor'
import { errorMonitor } from '@/lib/services/errorMonitor'
import { rateLimiter } from '@/lib/services/rateLimiter'
import { securityLogger } from '@/lib/services/securityLogger'
import { prisma } from '@/lib/prisma'

async function handleGET(req: NextRequest, context: { userId: string }) {
  try {
    // Get comprehensive security health
    const health = await getSecurityHealth()

    // Get recent security events
    const recentEvents = await prisma.securityEvent.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 3600000) // Last hour
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    })

    // Get recent audit logs
    const recentAudits = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 3600000)
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    })

    // Get error statistics
    const errorStats = await errorMonitor.getErrorsByType()

    // Get performance metrics
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 3600000)
    const perfMetrics = await performanceMonitor.getPerformanceMetrics({
      start: oneHourAgo,
      end: now
    })

    // Get rate limiter status
    const rateLimiterStatus = {
      storeSize: rateLimiter.getStoreSize(),
      endpointLimits: rateLimiter.getEndpointLimits()
    }

    return NextResponse.json({
      health,
      recentEvents: recentEvents.length,
      recentAudits: recentAudits.length,
      errorStatistics: errorStats,
      performance: perfMetrics,
      rateLimiter: rateLimiterStatus,
      timestamp: new Date()
    })

  } catch (error) {
    securityLogger.logError('Security health check failed', error as Error)
    
    return NextResponse.json(
      { error: 'Failed to retrieve security health' },
      { status: 500 }
    )
  }
}

// Protected by admin authentication
export const GET = createAdminRoute(handleGET)
