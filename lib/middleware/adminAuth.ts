/**
 * Admin Authentication Middleware
 * 
 * Middleware to protect admin routes with multi-layer authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { adminAuthenticator } from '@/lib/services/adminAuthenticator'
import { securityLogger } from '@/lib/services/securityLogger'
import { generateCorrelationId } from '@/lib/utils/crypto'

/**
 * Admin authentication middleware for API routes
 */
export async function withAdminAuth(
  request: NextRequest,
  handler: (req: NextRequest, context: { userId: string }) => Promise<NextResponse>
): Promise<NextResponse> {
  const correlationId = generateCorrelationId()
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const endpoint = request.nextUrl.pathname
  const method = request.method

  try {
    // Get user from Clerk
    const { userId } = auth()

    // Check if user is authenticated
    if (!userId) {
      securityLogger.logWarn('Unauthenticated admin access attempt', {
        endpoint,
        method,
        ipAddress,
        correlationId
      })

      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'UNAUTHORIZED' 
        }, 
        { status: 401 }
      )
    }

    // Validate admin access
    const validation = await adminAuthenticator.validateAdminAccess(userId, ipAddress)

    if (!validation.isValid) {
      await securityLogger.logSecurityViolation({
        type: 'INVALID_TOKEN',
        severity: 'HIGH',
        description: 'Admin authentication failed',
        ipAddress,
        endpoint,
        userId,
        correlationId
      })

      return NextResponse.json(
        { 
          error: 'Authentication failed',
          code: 'AUTH_FAILED' 
        }, 
        { status: 401 }
      )
    }

    if (!validation.isAdmin) {
      await securityLogger.logSecurityViolation({
        type: 'UNAUTHORIZED_ACCESS',
        severity: 'HIGH',
        description: 'Non-admin user attempted to access admin endpoint',
        ipAddress,
        endpoint,
        userId,
        correlationId
      })

      return NextResponse.json(
        { 
          error: 'Admin access required',
          code: 'FORBIDDEN' 
        }, 
        { status: 403 }
      )
    }

    // Log successful admin access
    await securityLogger.logAuditEvent({
      userId,
      action: 'ADMIN_ENDPOINT_ACCESS',
      resource: endpoint,
      ipAddress,
      endpoint,
      method,
      correlationId,
      severity: 'INFO',
      category: 'AUTHORIZATION'
    })

    // User is authenticated and authorized - proceed with request
    return handler(request, { userId })

  } catch (error) {
    securityLogger.logError('Admin auth middleware error', error as Error, {
      endpoint,
      method,
      ipAddress,
      correlationId
    })

    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR' 
      }, 
      { status: 500 }
    )
  }
}

/**
 * Admin permission check middleware
 */
export async function withAdminPermission(
  request: NextRequest,
  permission: string,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // First check admin auth
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      )
    }

    // Check specific permission
    const hasPermission = await adminAuthenticator.checkAdminPermission(
      userId, 
      permission as any
    )

    if (!hasPermission) {
      return NextResponse.json(
        { 
          error: `Permission required: ${permission}`,
          code: 'INSUFFICIENT_PERMISSIONS' 
        }, 
        { status: 403 }
      )
    }

    return handler(request)

  } catch (error) {
    console.error('Admin permission middleware error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

/**
 * Helper to create protected admin route handler
 */
export function createAdminRoute(
  handler: (req: NextRequest, context: { userId: string }) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    return withAdminAuth(req, handler)
  }
}

/**
 * Helper to create permission-protected admin route handler
 */
export function createPermissionRoute(
  permission: string,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    return withAdminPermission(req, permission, handler)
  }
}