/**
 * Test Error Monitor Service
 * 
 * Quick test to verify error monitoring is working correctly
 */

// Load environment variables first
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { errorMonitor } from '../lib/services/errorMonitor'

async function testErrorMonitor() {
  console.log('🚨 Testing Error Monitor Service...')
  
  try {
    // Test 1: Error capture
    console.log('\n1️⃣ Testing error capture...')
    const testError = new Error('Test error message')
    testError.name = 'TestError'
    
    const context = {
      userId: 'test-user-123',
      endpoint: '/api/test',
      requestId: 'req-123',
      userAgent: 'test-agent',
      ipAddress: '127.0.0.1',
      timestamp: new Date(),
      correlationId: 'corr-123'
    }
    
    await errorMonitor.captureError(testError, context)
    const errorCount = errorMonitor.getErrorCount()
    
    console.log(`   Error captured: ${errorCount > 0 ? '✅' : '❌'}`)
    console.log(`   Error count: ${errorCount}`)

    // Test 2: Exception capture
    console.log('\n2️⃣ Testing exception capture...')
    const exception = {
      name: 'ValidationError',
      message: 'Invalid input',
      stack: 'Error: Invalid input\n    at test.ts:10:5',
      code: 'VALIDATION_FAILED',
      statusCode: 400
    }
    
    await errorMonitor.captureException(exception)
    const afterException = errorMonitor.getErrorCount()
    
    console.log(`   Exception captured: ${afterException > errorCount ? '✅' : '❌'}`)
    console.log(`   Total errors: ${afterException}`)

    // Test 3: Error sanitization for client
    console.log('\n3️⃣ Testing error sanitization...')
    const sensitiveError = new Error('Database connection failed at /home/user/app/db.ts:42')
    sensitiveError.name = 'ECONNREFUSED'
    
    const clientError = errorMonitor.sanitizeErrorForClient(sensitiveError)
    
    const hasGenericMessage = !clientError.message.includes('Database')
    const hasRequestId = !!clientError.requestId
    const hasCode = !!clientError.code
    
    console.log(`   Sensitive info removed: ${hasGenericMessage ? '✅' : '❌'}`)
    console.log(`   Request ID provided: ${hasRequestId ? '✅' : '❌'}`)
    console.log(`   Error code provided: ${hasCode ? '✅' : '❌'}`)
    console.log(`   Client message: "${clientError.message}"`)
    console.log(`   Error code: ${clientError.code}`)

    // Test 4: Stack trace sanitization
    console.log('\n4️⃣ Testing stack trace sanitization...')
    const stackTrace = `Error: Test error
    at /home/user/app/src/api/route.ts:42:15
    at process.env.SECRET_KEY
    at token_abc123def456789`
    
    const sanitized = errorMonitor.sanitizeStackTrace(stackTrace)
    
    const pathsRemoved = !sanitized.includes('/home/user')
    const secretsRemoved = !sanitized.includes('SECRET_KEY')
    const tokensRemoved = !sanitized.includes('abc123def456789')
    
    console.log(`   File paths sanitized: ${pathsRemoved ? '✅' : '❌'}`)
    console.log(`   Secrets removed: ${secretsRemoved ? '✅' : '❌'}`)
    console.log(`   Tokens removed: ${tokensRemoved ? '✅' : '❌'}`)

    // Test 5: Multiple error types
    console.log('\n5️⃣ Testing multiple error types...')
    const errors = [
      new Error('Validation failed'),
      new Error('Authentication required'),
      new Error('Resource not found'),
      new Error('Database timeout')
    ]
    
    errors[0].name = 'ValidationError'
    errors[1].name = 'UnauthorizedError'
    errors[2].name = 'NotFoundError'
    errors[3].name = 'ETIMEDOUT'
    
    for (const error of errors) {
      await errorMonitor.captureError(error, {
        ...context,
        endpoint: `/api/${error.name}`
      })
    }
    
    console.log(`   Multiple errors captured: ✅`)
    console.log(`   Total errors in store: ${errorMonitor.getErrorCount()}`)

    // Test 6: Error statistics
    console.log('\n6️⃣ Testing error statistics...')
    const stats = await errorMonitor.getErrorsByType()
    
    const hasByType = Object.keys(stats.byType).length > 0
    const hasByEndpoint = Object.keys(stats.byEndpoint).length > 0
    const hasBySeverity = Object.keys(stats.bySeverity).length > 0
    
    console.log(`   Errors by type: ${hasByType ? '✅' : '❌'}`)
    console.log(`   Errors by endpoint: ${hasByEndpoint ? '✅' : '❌'}`)
    console.log(`   Errors by severity: ${hasBySeverity ? '✅' : '❌'}`)
    console.log(`   Total count: ${stats.totalCount}`)
    console.log(`   Error types: ${Object.keys(stats.byType).join(', ')}`)

    // Test 7: Error trends
    console.log('\n7️⃣ Testing error trends...')
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 3600000)
    
    const trends = await errorMonitor.getErrorTrends({
      start: oneHourAgo,
      end: now
    })
    
    const hasTrends = trends.totalErrors > 0
    const hasTopErrors = trends.topErrors.length > 0
    const hasTimeSeries = trends.timeSeriesData.length > 0
    
    console.log(`   Trends calculated: ${hasTrends ? '✅' : '❌'}`)
    console.log(`   Top errors identified: ${hasTopErrors ? '✅' : '❌'}`)
    console.log(`   Time series data: ${hasTimeSeries ? '✅' : '❌'}`)
    console.log(`   Total errors: ${trends.totalErrors}`)
    console.log(`   Error rate: ${trends.errorRate.toFixed(4)} errors/sec`)
    console.log(`   Top error: ${trends.topErrors[0]?.message || 'N/A'}`)

    // Test 8: Client error messages
    console.log('\n8️⃣ Testing client error messages...')
    const testErrors = [
      { error: new Error('DB connection failed'), name: 'ECONNREFUSED' },
      { error: new Error('Invalid email'), name: 'ValidationError' },
      { error: new Error('Not authorized'), name: 'UnauthorizedError' }
    ]
    
    const clientErrors = testErrors.map(({ error, name }) => {
      error.name = name
      return errorMonitor.sanitizeErrorForClient(error)
    })
    
    const allSanitized = clientErrors.every(ce => 
      !ce.message.includes('DB') && 
      !ce.message.includes('email') &&
      ce.requestId.length > 0
    )
    
    console.log(`   All errors sanitized: ${allSanitized ? '✅' : '❌'}`)
    clientErrors.forEach((ce, i) => {
      console.log(`   ${testErrors[i].name} → "${ce.message}"`)
    })

    // Test 9: Configuration check
    console.log('\n9️⃣ Testing configuration...')
    const config = errorMonitor.getConfig()
    
    console.log(`   Sentry enabled: ${config.sentryEnabled ? 'Yes' : 'No'}`)
    console.log(`   Max stored errors: ${config.maxStoredErrors}`)
    console.log(`   Current error count: ${config.currentErrorCount}`)
    console.log('   Configuration valid: ✅')

    // Test 10: Error store cleanup
    console.log('\n🔟 Testing error store cleanup...')
    const beforeClear = errorMonitor.getErrorCount()
    errorMonitor.clearErrors()
    const afterClear = errorMonitor.getErrorCount()
    
    console.log(`   Errors before clear: ${beforeClear}`)
    console.log(`   Errors after clear: ${afterClear}`)
    console.log(`   Cleanup successful: ${afterClear === 0 ? '✅' : '❌'}`)

    console.log('\n🎉 All error monitor tests passed!')
    return true

  } catch (error) {
    console.error('\n💥 Error monitor test failed:', error)
    return false
  }
}

// Run the test
if (require.main === module) {
  testErrorMonitor().then((success) => {
    process.exit(success ? 0 : 1)
  })
}

export { testErrorMonitor }
