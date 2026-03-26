/**
 * Startup Environment Validation
 * 
 * Validates all required environment variables on application startup
 */

import { validateSecurityEnvironment } from '@/lib/config/security'
import { securityLogger } from '@/lib/services/securityLogger'

export function validateEnvironmentOnStartup(): void {
  console.log('🔍 Validating environment configuration...')
  
  const validation = validateSecurityEnvironment()
  
  if (!validation.isValid) {
    console.error('❌ Environment validation failed:')
    validation.errors.forEach(error => {
      console.error(`   - ${error}`)
      securityLogger.logError('Environment validation error', new Error(error))
    })
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot start application - invalid environment configuration')
    } else {
      console.warn('⚠️  Running in development mode with invalid configuration')
    }
  } else {
    console.log('✅ Environment validation passed')
    securityLogger.logInfo('Environment validation successful')
  }
}

// Auto-validate on import in production
if (process.env.NODE_ENV === 'production') {
  validateEnvironmentOnStartup()
}
