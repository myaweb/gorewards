/**
 * Security Configuration
 * 
 * Centralized security configuration for all security services
 */

import { SecurityConfig } from '@/lib/types/security'

export const securityConfig: SecurityConfig = {
  encryption: {
    algorithm: 'aes-256-cbc',
    keyLength: 32,
    keyRotationDays: 90
  },
  rateLimit: {
    ai: {
      requests: 10,
      windowMs: 60000 // 1 minute
    },
    plaid: {
      requests: 5,
      windowMs: 60000
    },
    recommendations: {
      requests: 20,
      windowMs: 60000
    },
    admin: {
      requests: 100,
      windowMs: 3600000 // 1 hour
    }
  },
  monitoring: {
    responseTimeThreshold: 2000, // 2 seconds
    errorRateThreshold: 0.05, // 5%
    memoryUsageThreshold: 85 // 85%
  },
  audit: {
    retentionDays: 90,
    compressionEnabled: true
  }
}

/**
 * Environment variable validation
 */
export function validateSecurityEnvironment(): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Required environment variables
  const required = [
    'DATABASE_URL',
    'CLERK_SECRET_KEY',
    'TOKEN_ENCRYPTION_KEY',
    'TOKEN_ENCRYPTION_KEY_VERSION'
  ]

  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`)
    }
  }

  // Validate encryption key length
  if (process.env.TOKEN_ENCRYPTION_KEY) {
    const keyLength = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY, 'hex').length
    if (keyLength !== 32) {
      errors.push(`TOKEN_ENCRYPTION_KEY must be 32 bytes (64 hex characters), got ${keyLength} bytes`)
    }
  }

  // Validate admin ID if set
  if (process.env.ADMIN_CLERK_ID && !process.env.ADMIN_CLERK_ID.startsWith('user_')) {
    errors.push('ADMIN_CLERK_ID must be a valid Clerk user ID (starts with user_)')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get security status
 */
export function getSecurityStatus() {
  const envValidation = validateSecurityEnvironment()
  
  return {
    environment: envValidation.isValid ? 'SECURE' : 'INSECURE',
    encryption: {
      enabled: !!process.env.TOKEN_ENCRYPTION_KEY,
      algorithm: securityConfig.encryption.algorithm
    },
    rateLimit: {
      enabled: true,
      endpoints: Object.keys(securityConfig.rateLimit).length
    },
    monitoring: {
      enabled: true,
      thresholds: securityConfig.monitoring
    },
    audit: {
      enabled: true,
      retention: securityConfig.audit.retentionDays
    },
    admin: {
      configured: !!process.env.ADMIN_CLERK_ID
    },
    errors: envValidation.errors
  }
}
