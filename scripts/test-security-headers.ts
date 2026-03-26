/**
 * Test script for Security Headers Service
 * 
 * Tests security headers application and violation detection
 */

import 'dotenv/config'
import { securityHeaders } from '../lib/middleware/securityHeaders'
import { NextRequest, NextResponse } from 'next/server'

async function testSecurityHeaders() {
  console.log('🧪 Testing Security Headers Service...\n')

  let passed = 0
  let failed = 0

  // Test 1: Apply security headers to response
  console.log('Test 1: Apply security headers to response')
  try {
    const response = NextResponse.json({ success: true })
    const request = new NextRequest('https://example.com/api/test')
    
    const securedResponse = securityHeaders.applySecurityHeaders(response, request)
    
    const headers = {
      hsts: securedResponse.headers.get('Strict-Transport-Security'),
      csp: securedResponse.headers.get('Content-Security-Policy'),
      xFrame: securedResponse.headers.get('X-Frame-Options'),
      xContent: securedResponse.headers.get('X-Content-Type-Options'),
      referrer: securedResponse.headers.get('Referrer-Policy'),
      xss: securedResponse.headers.get('X-XSS-Protection'),
      permissions: securedResponse.headers.get('Permissions-Policy')
    }
    
    // HSTS only in production, other headers always present
    const requiredHeadersPresent = headers.csp && headers.xFrame === 'DENY' && 
        headers.xContent === 'nosniff' && headers.referrer && headers.xss
    
    if (requiredHeadersPresent) {
      console.log('✅ All security headers applied correctly')
      console.log(`   HSTS: ${headers.hsts || 'disabled (development mode)'}`)
      console.log(`   X-Frame-Options: ${headers.xFrame}`)
      console.log(`   X-Content-Type-Options: ${headers.xContent}`)
      console.log(`   Referrer-Policy: ${headers.referrer}`)
      console.log(`   X-XSS-Protection: ${headers.xss}`)
      passed++
    } else {
      console.log('❌ Some security headers missing')
      failed++
    }
  } catch (error) {
    console.log(`❌ Test failed: ${(error as Error).message}`)
    failed++
  }

  // Test 2: HSTS header configuration (production mode)
  console.log('\nTest 2: HSTS header configuration (production mode)')
  try {
    // Temporarily enable HTTPS enforcement
    securityHeaders.updateConfig({ enforceHttps: true })
    
    const response = NextResponse.json({ success: true })
    const securedResponse = securityHeaders.applySecurityHeaders(response)
    
    const hsts = securedResponse.headers.get('Strict-Transport-Security')
    
    // Restore original config
    securityHeaders.updateConfig({ enforceHttps: process.env.NODE_ENV === 'production' })
    
    if (hsts && hsts.includes('max-age=') && hsts.includes('includeSubDomains')) {
      console.log(`✅ HSTS configured correctly: ${hsts}`)
      passed++
    } else {
      console.log(`❌ HSTS configuration incorrect: ${hsts}`)
      failed++
    }
  } catch (error) {
    console.log(`❌ Test failed: ${(error as Error).message}`)
    failed++
  }

  // Test 3: Content Security Policy
  console.log('\nTest 3: Content Security Policy')
  try {
    const response = NextResponse.json({ success: true })
    const securedResponse = securityHeaders.applySecurityHeaders(response)
    
    const csp = securedResponse.headers.get('Content-Security-Policy')
    
    if (csp && csp.includes("default-src 'self'") && 
        csp.includes("frame-ancestors 'none'") &&
        csp.includes('upgrade-insecure-requests')) {
      console.log('✅ CSP configured correctly')
      console.log(`   Includes default-src, frame-ancestors, upgrade-insecure-requests`)
      passed++
    } else {
      console.log('❌ CSP configuration incomplete')
      failed++
    }
  } catch (error) {
    console.log(`❌ Test failed: ${(error as Error).message}`)
    failed++
  }

  // Test 4: X-Frame-Options (Clickjacking protection)
  console.log('\nTest 4: X-Frame-Options (Clickjacking protection)')
  try {
    const response = NextResponse.json({ success: true })
    const securedResponse = securityHeaders.applySecurityHeaders(response)
    
    const xFrame = securedResponse.headers.get('X-Frame-Options')
    
    if (xFrame === 'DENY') {
      console.log('✅ Clickjacking protection enabled: DENY')
      passed++
    } else {
      console.log(`❌ X-Frame-Options incorrect: ${xFrame}`)
      failed++
    }
  } catch (error) {
    console.log(`❌ Test failed: ${(error as Error).message}`)
    failed++
  }

  // Test 5: X-Content-Type-Options (MIME sniffing protection)
  console.log('\nTest 5: X-Content-Type-Options (MIME sniffing protection)')
  try {
    const response = NextResponse.json({ success: true })
    const securedResponse = securityHeaders.applySecurityHeaders(response)
    
    const xContent = securedResponse.headers.get('X-Content-Type-Options')
    
    if (xContent === 'nosniff') {
      console.log('✅ MIME sniffing protection enabled: nosniff')
      passed++
    } else {
      console.log(`❌ X-Content-Type-Options incorrect: ${xContent}`)
      failed++
    }
  } catch (error) {
    console.log(`❌ Test failed: ${(error as Error).message}`)
    failed++
  }

  // Test 6: Referrer-Policy
  console.log('\nTest 6: Referrer-Policy')
  try {
    const response = NextResponse.json({ success: true })
    const securedResponse = securityHeaders.applySecurityHeaders(response)
    
    const referrer = securedResponse.headers.get('Referrer-Policy')
    
    if (referrer === 'strict-origin-when-cross-origin') {
      console.log('✅ Referrer policy configured: strict-origin-when-cross-origin')
      passed++
    } else {
      console.log(`❌ Referrer-Policy incorrect: ${referrer}`)
      failed++
    }
  } catch (error) {
    console.log(`❌ Test failed: ${(error as Error).message}`)
    failed++
  }

  // Test 7: Check security violations (HTTP in production)
  console.log('\nTest 7: Check security violations')
  try {
    const request = new NextRequest('https://example.com/api/test', {
      headers: {
        'user-agent': 'test-agent'
      }
    })
    
    const violations = await securityHeaders.checkSecurityViolations(request)
    
    console.log(`✅ Security violation check completed: ${violations.length} violations`)
    passed++
  } catch (error) {
    console.log(`❌ Test failed: ${(error as Error).message}`)
    failed++
  }

  // Test 8: Middleware wrapper
  console.log('\nTest 8: Middleware wrapper')
  try {
    const handler = async (req: NextRequest) => {
      return NextResponse.json({ message: 'test' })
    }
    
    const wrappedHandler = securityHeaders.withSecurityHeaders(handler)
    const request = new NextRequest('https://example.com/api/test')
    const response = await wrappedHandler(request)
    
    const hasHeaders = response.headers.get('X-Frame-Options') === 'DENY'
    
    if (hasHeaders) {
      console.log('✅ Middleware wrapper applies headers correctly')
      passed++
    } else {
      console.log('❌ Middleware wrapper failed to apply headers')
      failed++
    }
  } catch (error) {
    console.log(`❌ Test failed: ${(error as Error).message}`)
    failed++
  }

  // Test 9: Get configuration
  console.log('\nTest 9: Get configuration')
  try {
    const config = securityHeaders.getConfig()
    
    if (config.hstsMaxAge && config.includeSubdomains !== undefined) {
      console.log('✅ Configuration retrieved:')
      console.log(`   Enforce HTTPS: ${config.enforceHttps}`)
      console.log(`   HSTS Max Age: ${config.hstsMaxAge}s`)
      console.log(`   Include Subdomains: ${config.includeSubdomains}`)
      console.log(`   Preload: ${config.preload}`)
      passed++
    } else {
      console.log('❌ Configuration incomplete')
      failed++
    }
  } catch (error) {
    console.log(`❌ Test failed: ${(error as Error).message}`)
    failed++
  }

  // Test 10: Permissions-Policy header
  console.log('\nTest 10: Permissions-Policy header')
  try {
    const response = NextResponse.json({ success: true })
    const securedResponse = securityHeaders.applySecurityHeaders(response)
    
    const permissions = securedResponse.headers.get('Permissions-Policy')
    
    if (permissions && permissions.includes('camera=()') && permissions.includes('microphone=()')) {
      console.log('✅ Permissions-Policy configured correctly')
      console.log(`   ${permissions}`)
      passed++
    } else {
      console.log(`❌ Permissions-Policy incorrect: ${permissions}`)
      failed++
    }
  } catch (error) {
    console.log(`❌ Test failed: ${(error as Error).message}`)
    failed++
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log('='.repeat(50))

  if (failed === 0) {
    console.log('\n🎉 All security headers tests passed!')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.')
  }
}

// Run tests
testSecurityHeaders()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
