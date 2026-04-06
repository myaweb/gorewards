/**
 * Security Services Index
 * 
 * Central export point for all security services
 */

// Core Services
export { tokenEncryptor } from '../services/tokenEncryptor'
export { adminAuthenticator } from '../services/adminAuthenticator'
export { securityLogger } from '../services/securityLogger'
export { inputValidator } from '../services/inputValidator'
export { rateLimiter } from '../services/rateLimiter'
export { errorMonitor } from '../services/errorMonitor'
export { performanceMonitor } from '../services/performanceMonitor'
export { webhookVerifier } from '../services/webhookVerifier'
export { confidenceScorer } from '../services/confidenceScorer'

// Import for internal use
import { tokenEncryptor } from '../services/tokenEncryptor'
import { adminAuthenticator } from '../services/adminAuthenticator'
import { securityLogger } from '../services/securityLogger'
import { performanceMonitor } from '../services/performanceMonitor'

// Middleware
export { 
  withAdminAuth, 
  withAdminPermission,
  createAdminRoute,
  createPermissionRoute
} from '../middleware/adminAuth'

export {
  withRateLimit,
  withInputValidation,
  withSecurity,
  createSecureRoute,
  withWebhookValidation,
  createSecureWebhookRoute
} from '../middleware/security'

export {
  securityHeaders,
  withSecurityHeaders,
  applySecurityHeaders
} from '../middleware/securityHeaders'

// Types
export * from '../types/security'

/**
 * Security configuration status
 */
export interface SecurityStatus {
  environment: string
  encryption: {
    enabled: boolean
    algorithm: string
  }
  rateLimit: {
    enabled: boolean
  }
  monitoring: {
    enabled: boolean
  }
  audit: {
    enabled: boolean
  }
  admin: {
    configured: boolean
  }
}

/**
 * Environment validation result
 */
export interface EnvironmentValidation {
  isValid: boolean
  errors: string[]
}

/**
 * Validate security environment variables
 */
export function validateSecurityEnvironment(): EnvironmentValidation {
  const errors: string[] = []
  
  // Check required environment variables
  if (!process.env.ENCRYPTION_KEY) {
    errors.push('ENCRYPTION_KEY is not set')
  }
  
  if (!process.env.CLERK_SECRET_KEY) {
    errors.push('CLERK_SECRET_KEY is not set')
  }
  
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is not set')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get current security status
 */
export function getSecurityStatus(): SecurityStatus {
  return {
    environment: process.env.NODE_ENV || 'development',
    encryption: {
      enabled: !!process.env.ENCRYPTION_KEY,
      algorithm: 'aes-256-gcm'
    },
    rateLimit: {
      enabled: true
    },
    monitoring: {
      enabled: true
    },
    audit: {
      enabled: true
    },
    admin: {
      configured: !!process.env.ADMIN_EMAIL
    }
  }
}

/**
 * Initialize security services
 */
export async function initializeSecurity() {
  console.log('🔒 Initializing GoRewards Security Services...')
  
  // Validate environment
  const envValidation = validateSecurityEnvironment()
  
  if (!envValidation.isValid) {
    console.error('❌ Security environment validation failed:')
    envValidation.errors.forEach((error: string) => console.error(`   - ${error}`))
    throw new Error('Security initialization failed - invalid environment configuration')
  }
  
  console.log('✅ Environment validation passed')
  
  // Check admin configuration
  const adminEnabled = adminAuthenticator.isAdminAccessEnabled()
  console.log(`${adminEnabled ? '✅' : '⚠️ '} Admin authentication: ${adminEnabled ? 'enabled' : 'disabled'}`)
  
  // Check encryption
  const encryptionValid = tokenEncryptor.validateEncryptionKey()
  console.log(`${encryptionValid ? '✅' : '❌'} Token encryption: ${encryptionValid ? 'enabled' : 'invalid'}`)
  
  // Log security status
  const status = getSecurityStatus()
  securityLogger.logInfo('Security services initialized', {
    environment: status.environment,
    encryption: status.encryption.enabled,
    rateLimit: status.rateLimit.enabled,
    monitoring: status.monitoring.enabled,
    audit: status.audit.enabled,
    admin: status.admin.configured
  })
  
  console.log('✅ Security services initialized successfully')
  
  return status
}

/**
 * Get security health check
 */
export async function getSecurityHealth() {
  const systemHealth = await performanceMonitor.getSystemHealth()
  const securityStatus = getSecurityStatus()
  
  return {
    overall: systemHealth.status,
    security: securityStatus,
    uptime: systemHealth.uptime,
    issues: systemHealth.issues,
    timestamp: new Date()
  }
}
