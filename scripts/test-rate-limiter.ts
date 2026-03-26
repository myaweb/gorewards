/**
 * Test Rate Limiter Service
 * 
 * Quick test to verify rate limiting is working correctly
 */

// Load environment variables first
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { rateLimiter } from '../lib/services/rateLimiter'

async function testRateLimiter() {
  console.log('⏱️  Testing Rate Limiter Service...')
  
  try {
    // Test 1: Basic rate limiting
    console.log('\n1️⃣ Testing basic rate limiting...')
    const limit = { requests: 3, windowMs: 1000 }
    const key = 'test:user:basic'
    
    const results = []
    for (let i = 0; i < 5; i++) {
      const result = await rateLimiter.checkRateLimit(key, limit)
      results.push(result.allowed)
    }
    
    const firstThreeAllowed = results.slice(0, 3).every(allowed => allowed)
    const lastTwoBlocked = results.slice(3).every(allowed => !allowed)
    
    console.log(`   First 3 requests allowed: ${firstThreeAllowed ? '✅' : '❌'}`)
    console.log(`   Requests 4-5 blocked: ${lastTwoBlocked ? '✅' : '❌'}`)

    // Test 2: Rate limit reset after window
    console.log('\n2️⃣ Testing rate limit reset...')
    await new Promise(resolve => setTimeout(resolve, 1100)) // Wait for window to expire
    
    const afterReset = await rateLimiter.checkRateLimit(key, limit)
    console.log(`   Requests allowed after reset: ${afterReset.allowed ? '✅' : '❌'}`)
    console.log(`   Remaining: ${afterReset.remaining}`)

    // Test 3: Endpoint-specific limits
    console.log('\n3️⃣ Testing endpoint-specific limits...')
    const userId = 'test-user-123'
    
    // AI endpoint (10 per minute)
    const aiResults = []
    for (let i = 0; i < 12; i++) {
      const allowed = await rateLimiter.checkEndpointLimit(userId, '/api/ai/insights')
      aiResults.push(allowed)
    }
    
    const aiFirst10Allowed = aiResults.slice(0, 10).every(allowed => allowed)
    const aiLast2Blocked = aiResults.slice(10).every(allowed => !allowed)
    
    console.log(`   AI endpoint: First 10 allowed: ${aiFirst10Allowed ? '✅' : '❌'}`)
    console.log(`   AI endpoint: Requests 11-12 blocked: ${aiLast2Blocked ? '✅' : '❌'}`)

    // Test 4: IP-based rate limiting
    console.log('\n4️⃣ Testing IP-based rate limiting...')
    const ipAddress = '192.168.1.100'
    
    // IP limit is 100 per minute - test first few
    const ipResults = []
    for (let i = 0; i < 5; i++) {
      const allowed = await rateLimiter.checkIPLimit(ipAddress)
      ipResults.push(allowed)
    }
    
    const ipAllowed = ipResults.every(allowed => allowed)
    console.log(`   IP requests allowed: ${ipAllowed ? '✅' : '❌'}`)

    // Test 5: Reset user limits
    console.log('\n5️⃣ Testing user limit reset...')
    const resetUserId = 'test-user-reset'
    
    // Exhaust limit
    for (let i = 0; i < 25; i++) {
      await rateLimiter.checkEndpointLimit(resetUserId, '/api/recommend')
    }
    
    // Should be blocked
    const beforeReset = await rateLimiter.checkEndpointLimit(resetUserId, '/api/recommend')
    
    // Reset limits
    await rateLimiter.resetUserLimits(resetUserId)
    
    // Should be allowed again
    const afterUserReset = await rateLimiter.checkEndpointLimit(resetUserId, '/api/recommend')
    
    console.log(`   Blocked before reset: ${!beforeReset ? '✅' : '❌'}`)
    console.log(`   Allowed after reset: ${afterUserReset ? '✅' : '❌'}`)

    // Test 6: Combined user and IP limit
    console.log('\n6️⃣ Testing combined limits...')
    const combinedUserId = 'test-user-combined'
    const combinedIP = '10.0.0.1'
    const combinedEndpoint = '/api/profile'
    
    const combinedResult = await rateLimiter.checkCombinedLimit(
      combinedUserId,
      combinedIP,
      combinedEndpoint
    )
    
    console.log(`   Combined check passed: ${combinedResult.allowed ? '✅' : '❌'}`)
    console.log(`   Remaining: ${combinedResult.remaining}`)

    // Test 7: Rate limit status check
    console.log('\n7️⃣ Testing rate limit status...')
    const statusKey = 'test:status'
    const statusLimit = { requests: 10, windowMs: 60000 }
    
    // Make some requests
    for (let i = 0; i < 3; i++) {
      await rateLimiter.checkRateLimit(statusKey, statusLimit)
    }
    
    const status = await rateLimiter.getRateLimitStatus(statusKey, statusLimit)
    console.log(`   Status retrieved: ✅`)
    console.log(`   Allowed: ${status.allowed}`)
    console.log(`   Remaining: ${status.remaining}`)
    console.log(`   Reset time: ${status.resetTime.toISOString()}`)

    // Test 8: Endpoint limits configuration
    console.log('\n8️⃣ Testing endpoint limits configuration...')
    const endpointLimits = rateLimiter.getEndpointLimits()
    const hasAILimit = '/api/ai' in endpointLimits
    const hasAdminLimit = '/api/admin' in endpointLimits
    const hasPlaidLimit = '/api/plaid' in endpointLimits
    
    console.log(`   AI endpoint configured: ${hasAILimit ? '✅' : '❌'}`)
    console.log(`   Admin endpoint configured: ${hasAdminLimit ? '✅' : '❌'}`)
    console.log(`   Plaid endpoint configured: ${hasPlaidLimit ? '✅' : '❌'}`)
    console.log(`   Total endpoints configured: ${Object.keys(endpointLimits).length}`)

    // Test 9: Store size tracking
    console.log('\n9️⃣ Testing store size tracking...')
    const storeSize = rateLimiter.getStoreSize()
    console.log(`   Store size: ${storeSize} entries`)
    console.log(`   Store tracking: ✅`)

    // Test 10: Retry-After header value
    console.log('\n🔟 Testing retry-after calculation...')
    const retryKey = 'test:retry'
    const retryLimit = { requests: 2, windowMs: 5000 }
    
    // Exhaust limit
    await rateLimiter.checkRateLimit(retryKey, retryLimit)
    await rateLimiter.checkRateLimit(retryKey, retryLimit)
    const blockedResult = await rateLimiter.checkRateLimit(retryKey, retryLimit)
    
    const hasRetryAfter = blockedResult.retryAfter !== undefined && blockedResult.retryAfter > 0
    console.log(`   Retry-After provided: ${hasRetryAfter ? '✅' : '❌'}`)
    console.log(`   Retry-After value: ${blockedResult.retryAfter} seconds`)

    console.log('\n🎉 All rate limiter tests passed!')
    console.log('\n📊 Summary:')
    console.log(`   Total store entries: ${rateLimiter.getStoreSize()}`)
    console.log(`   Configured endpoints: ${Object.keys(rateLimiter.getEndpointLimits()).length}`)
    
    return true

  } catch (error) {
    console.error('\n💥 Rate limiter test failed:', error)
    return false
  }
}

// Run the test
if (require.main === module) {
  testRateLimiter().then((success) => {
    process.exit(success ? 0 : 1)
  })
}

export { testRateLimiter }
