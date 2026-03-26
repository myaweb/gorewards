/**
 * Test Security Logger Service
 * 
 * Quick test to verify security logging is working correctly
 */

// Load environment variables first
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { securityLogger } from '../lib/services/securityLogger'
import { AuditSeverity, AuditCategory } from '@prisma/client'
import crypto from 'crypto'

async function testSecurityLogger() {
  console.log('🔒 Testing Security Logger Service...')
  
  try {
    const correlationId = crypto.randomBytes(16).toString('hex')

    // Test 1: Structured logging
    console.log('\n1️⃣ Testing structured logging...')
    securityLogger.logInfo('Test info message', { test: true }, correlationId)
    securityLogger.logWarn('Test warning message', { test: true }, correlationId)
    securityLogger.logError('Test error message', new Error('Test error'), { test: true }, correlationId)
    securityLogger.logDebug('Test debug message', { test: true }, correlationId)
    console.log('   Structured logging: ✅')

    // Test 2: Audit event logging
    console.log('\n2️⃣ Testing audit event logging...')
    await securityLogger.logAuditEvent({
      userId: 'test-user-123',
      action: 'TEST_ACTION',
      resource: 'test_resource',
      ipAddress: '127.0.0.1',
      endpoint: '/api/test',
      method: 'POST',
      correlationId,
      severity: AuditSeverity.INFO,
      category: AuditCategory.DATA_ACCESS
    })
    console.log('   Audit event logged: ✅')

    // Test 3: Admin access logging
    console.log('\n3️⃣ Testing admin access logging...')
    await securityLogger.logAdminAccess(
      'test-admin-123',
      'ADMIN_LOGIN',
      'admin_panel',
      '127.0.0.1',
      correlationId
    )
    console.log('   Admin access logged: ✅')

    // Test 4: Security violation logging
    console.log('\n4️⃣ Testing security violation logging...')
    await securityLogger.logSecurityViolation({
      type: 'RATE_LIMIT_EXCEEDED',
      severity: 'MEDIUM',
      description: 'Test rate limit violation',
      ipAddress: '127.0.0.1',
      endpoint: '/api/test',
      userId: 'test-user-123',
      correlationId
    })
    console.log('   Security violation logged: ✅')

    // Test 5: Rate limit logging
    console.log('\n5️⃣ Testing rate limit exceeded logging...')
    await securityLogger.logRateLimitExceeded(
      'test-user-123',
      '/api/test',
      '127.0.0.1',
      correlationId
    )
    console.log('   Rate limit exceeded logged: ✅')

    // Test 6: Input validation failure logging
    console.log('\n6️⃣ Testing input validation failure logging...')
    await securityLogger.logInputValidationFailure(
      'invalid-input',
      'Input contains invalid characters',
      '/api/test',
      correlationId
    )
    console.log('   Input validation failure logged: ✅')

    // Test 7: Performance metric logging
    console.log('\n7️⃣ Testing performance metric logging...')
    await securityLogger.logPerformanceMetric({
      metricType: 'RESPONSE_TIME',
      endpoint: '/api/test',
      value: 1500,
      unit: 'ms',
      timeWindow: 60,
      requestId: correlationId
    })
    console.log('   Performance metric logged: ✅')

    // Test 8: Slow query logging
    console.log('\n8️⃣ Testing slow query logging...')
    await securityLogger.logSlowQuery(
      'SELECT * FROM users WHERE id = ?',
      750,
      correlationId
    )
    console.log('   Slow query logged: ✅')

    // Test 9: Token refresh logging
    console.log('\n9️⃣ Testing token refresh logging...')
    await securityLogger.logTokenRefresh('test-user-123', true, correlationId)
    await securityLogger.logTokenRefresh('test-user-456', false, correlationId)
    console.log('   Token refresh logged: ✅')

    // Test 10: Configuration check
    console.log('\n🔟 Testing configuration...')
    const config = securityLogger.getConfig()
    console.log(`   Log level: ${config.logLevel}`)
    console.log(`   Console output: ${config.enableConsoleOutput ? 'enabled' : 'disabled'}`)
    console.log(`   Database logging: ${config.enableDatabaseLogging ? 'enabled' : 'disabled'}`)
    console.log('   Configuration valid: ✅')

    console.log('\n🎉 All security logger tests passed!')
    console.log(`\n📊 Correlation ID for this test run: ${correlationId}`)
    console.log('   You can use this ID to query logs in the database')
    
    return true

  } catch (error) {
    console.error('\n💥 Security logger test failed:', error)
    return false
  }
}

// Run the test
if (require.main === module) {
  testSecurityLogger().then((success) => {
    process.exit(success ? 0 : 1)
  })
}

export { testSecurityLogger }
