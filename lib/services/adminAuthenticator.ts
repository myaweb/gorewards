/**
 * Admin Authentication Service
 * 
 * Provides multi-layer admin authentication and authorization
 * with session management and security logging.
 */

import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { 
  AdminAuthenticator, 
  AdminValidationResult, 
  AdminSession, 
  AdminPermission 
} from '@/lib/types/security'
import { securityLogger } from './securityLogger'
import { generateCorrelationId, generateSessionId } from '../utils/crypto'

export class AdminAuthenticatorService implements AdminAuthenticator {
  private readonly sessionDurationMs = 8 * 60 * 60 * 1000 // 8 hours
  private readonly adminClerkId: string

  constructor() {
    const adminId = process.env.ADMIN_CLERK_ID
    if (!adminId) {
      securityLogger.logWarn('ADMIN_CLERK_ID environment variable not set - admin access disabled', {})
      this.adminClerkId = ''
    } else {
      this.adminClerkId = adminId
    }
  }

  /**
   * Validate admin access for a Clerk user
   */
  async validateAdminAccess(clerkUserId: string, ipAddress?: string): Promise<AdminValidationResult> {
    const correlationId = generateCorrelationId()
    
    try {
      // Check if user is authenticated
      if (!clerkUserId) {
        securityLogger.logWarn('Admin access attempt with no user ID', {
          correlationId
        })
        return {
          isValid: false,
          isAdmin: false,
          permissions: [],
          sessionId: ''
        }
      }

      // Check if user is the designated admin
      const isAdmin = clerkUserId === this.adminClerkId

      if (!isAdmin) {
        // Log unauthorized admin access attempt
        await securityLogger.logSecurityViolation({
          type: 'UNAUTHORIZED_ACCESS',
          severity: 'MEDIUM',
          description: 'Non-admin user attempted to access admin resources',
          ipAddress: ipAddress || 'unknown',
          userId: clerkUserId,
          correlationId
        })

        return {
          isValid: true, // User is authenticated but not admin
          isAdmin: false,
          permissions: [],
          sessionId: ''
        }
      }

      // User is admin - get full permissions
      const permissions = this.getAllAdminPermissions()

      // Log successful admin access
      await securityLogger.logAdminAccess(
        clerkUserId,
        'ADMIN_ACCESS_VALIDATED',
        'admin_system',
        ipAddress || 'unknown',
        correlationId
      )

      return {
        isValid: true,
        isAdmin: true,
        permissions,
        sessionId: '' // Will be set by createAdminSession if needed
      }

    } catch (error) {
      securityLogger.logError('Admin validation error', error as Error, {
        userId: clerkUserId,
        correlationId
      })
      return {
        isValid: false,
        isAdmin: false,
        permissions: [],
        sessionId: ''
      }
    }
  }

  /**
   * Check specific admin permission
   */
  async checkAdminPermission(userId: string, permission: AdminPermission): Promise<boolean> {
    const correlationId = generateCorrelationId()
    
    try {
      const validation = await this.validateAdminAccess(userId)
      const hasPermission = validation.isAdmin && validation.permissions.includes(permission)
      
      securityLogger.logDebug('Admin permission check', {
        userId,
        permission,
        hasPermission,
        correlationId
      })
      
      return hasPermission
    } catch (error) {
      securityLogger.logError('Permission check error', error as Error, {
        userId,
        permission,
        correlationId
      })
      return false
    }
  }

  /**
   * Create admin session
   */
  async createAdminSession(userId: string, ipAddress: string): Promise<AdminSession> {
    const correlationId = generateCorrelationId()
    
    try {
      // Validate admin access first
      const validation = await this.validateAdminAccess(userId, ipAddress)
      if (!validation.isAdmin) {
        securityLogger.logWarn('Admin session creation attempted by non-admin user', {
          userId,
          ipAddress,
          correlationId
        })
        throw new Error('User is not authorized as admin')
      }

      // Generate session ID
      const sessionId = generateSessionId()
      const now = new Date()
      const expiresAt = new Date(now.getTime() + this.sessionDurationMs)

      // Persist session to database
      // Note: Requires AdminSession model in prisma schema + migration
      // await prisma.adminSession.create({
      //   data: { id: sessionId, userId, ipAddress, expiresAt }
      // })

      const session: AdminSession = {
        id: sessionId,
        userId,
        ipAddress,
        createdAt: now,
        expiresAt
      }

      // Log session creation
      await securityLogger.logAdminAccess(
        userId,
        'ADMIN_SESSION_CREATED',
        'admin_session',
        ipAddress,
        correlationId
      )

      return session

    } catch (error) {
      securityLogger.logError('Admin session creation error', error as Error, {
        userId,
        ipAddress,
        correlationId
      })
      throw new Error('Failed to create admin session')
    }
  }

  /**
   * Validate admin session
   * Note: Full DB-backed validation requires AdminSession model in schema.
   * To enable: add AdminSession model to prisma/schema.prisma and run prisma migrate.
   */
  async validateAdminSession(sessionId: string): Promise<boolean> {
    try {
      if (!sessionId || sessionId.length !== 64) {
        return false
      }
      // Placeholder until AdminSession migration is applied
      return true
    } catch (error) {
      securityLogger.logError('Session validation error', error as Error)
      return false
    }
  }

  /**
   * Revoke admin session
   * Note: Full DB-backed revocation requires AdminSession model in schema.
   */
  async revokeAdminSession(sessionId: string): Promise<void> {
    try {
      securityLogger.logInfo(`Admin session revoke requested: ${sessionId.substring(0, 8)}...`)
    } catch (error) {
      securityLogger.logError('Session revocation error', error as Error)
      throw new Error('Failed to revoke admin session')
    }
  }

  /**
   * Get all admin permissions
   */
  private getAllAdminPermissions(): AdminPermission[] {
    return [
      'CARD_MANAGEMENT',
      'USER_MANAGEMENT', 
      'SYSTEM_MONITORING',
      'AUDIT_ACCESS',
      'SECURITY_SETTINGS'
    ]
  }

  /**
   * Validate admin access from request context
   */
  async validateAdminFromRequest(): Promise<AdminValidationResult> {
    try {
      const { userId } = auth()
      
      if (!userId) {
        return {
          isValid: false,
          isAdmin: false,
          permissions: [],
          sessionId: ''
        }
      }

      return this.validateAdminAccess(userId)

    } catch (error) {
      securityLogger.logError('Request admin validation error', error as Error)
      return {
        isValid: false,
        isAdmin: false,
        permissions: [],
        sessionId: ''
      }
    }
  }

  /**
   * Get admin user details
   */
  async getAdminUserDetails(clerkUserId: string) {
    try {
      if (clerkUserId !== this.adminClerkId) {
        return null
      }

      const user = await clerkClient.users.getUser(clerkUserId)
      return {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        lastSignInAt: user.lastSignInAt,
        createdAt: user.createdAt
      }

    } catch (error) {
      securityLogger.logError('Get admin user details error', error as Error)
      return null
    }
  }

  /**
   * Check if current environment allows admin access
   */
  isAdminAccessEnabled(): boolean {
    return !!this.adminClerkId && this.adminClerkId.length > 0
  }

  /**
   * Get admin configuration
   */
  getAdminConfig() {
    return {
      adminClerkId: this.adminClerkId,
      sessionDurationMs: this.sessionDurationMs,
      isEnabled: this.isAdminAccessEnabled()
    }
  }
}

// Singleton instance
export const adminAuthenticator = new AdminAuthenticatorService()