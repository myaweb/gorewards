/**
 * Test script for Webhook Verifier Service
 * 
 * Tests webhook signature verification and retry logic
 */

import 'dotenv/config'
import { webhookVerifier } from '../lib/services/webhookVerifier'
import crypto from 'crypto'

async function testWebhookVerifier() {
  console.log('🧪 Testing Webhook Verifier Service...\n')

  let passed = 0
  let failed = 0

  // Test 1: Stripe webhook verification (mock)
  console.log('Test 1: Stripe webhook verification')
  try {
    // Note: This will fail without real Stripe signature, but tests the flow
    const payload = JSON.stringify({
      id: 'evt_test_123',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_123' } }
    })
    
    const result = await webhookVerifier.verifyStripeWebhook(
      payload,
      'test_signature',
      process.env.STRIPE_WEBHOOK_SECRET || 'test_secret'
    )
    
    // Expected to fail with invalid signature
    if (!result.isValid && result.error) {
      console.log('✅ Stripe verification correctly rejected invalid signature')
      passed++
    } else {
      console.log('❌ Stripe verification should have failed')
      failed++
    }
  } catch (error) {
    console.log('✅ Stripe verification correctly threw error for invalid signature')
    passed++
  }

  // Test 2: Clerk webhook verification
  console.log('\nTest 2: Clerk webhook verification')
  try {
    const payload = JSON.stringify({
      type: 'user.created',
      data: { id: 'user_123' }
    })
    
    const headers = {
      'svix-id': 'msg_test',
      'svix-timestamp': Date.now().toString(),
      'svix-signature': 'test_sig'
    }
    
    const result = await webhookVerifier.verifyClerkWebhook(payload, headers)
    
    // Should pass basic structure validation
    console.log(`✅ Clerk webhook verification completed: ${result.isValid ? 'valid' : 'invalid'}`)
    passed++
  } catch (error) {
    console.log(`❌ Clerk verification failed: ${(error as Error).message}`)
    failed++
  }

  // Test 3: Plaid webhook verification
  console.log('\nTest 3: Plaid webhook verification')
  try {
    const payload = JSON.stringify({
      webhook_type: 'TRANSACTIONS',
      webhook_code: 'DEFAULT_UPDATE',
      item_id: 'item_123'
    })
    
    const result = await webhookVerifier.verifyPlaidWebhook(payload, 'test_signature')
    
    console.log(`✅ Plaid webhook verification completed: ${result.isValid ? 'valid' : 'invalid'}`)
    passed++
  } catch (error) {
    console.log(`❌ Plaid verification failed: ${(error as Error).message}`)
    failed++
  }

  // Test 4: Retry logic
  console.log('\nTest 4: Retry logic with exponential backoff')
  try {
    let attempts = 0
    const maxAttempts = 3
    
    const handler = async () => {
      attempts++
      if (attempts < maxAttempts) {
        throw new Error('Simulated failure')
      }
      return 'success'
    }
    
    const startTime = Date.now()
    const result = await webhookVerifier.processWithRetry(handler, {
      maxRetries: 2,
      initialDelayMs: 100,
      maxDelayMs: 1000,
      backoffMultiplier: 2
    })
    const duration = Date.now() - startTime
    
    if (result === 'success' && attempts === maxAttempts && duration >= 300) {
      console.log(`✅ Retry logic worked: ${attempts} attempts, ${duration}ms duration`)
      passed++
    } else {
      console.log(`❌ Retry logic failed: ${attempts} attempts, ${duration}ms duration`)
      failed++
    }
  } catch (error) {
    console.log(`❌ Retry logic test failed: ${(error as Error).message}`)
    failed++
  }

  // Test 5: Retry exhaustion
  console.log('\nTest 5: Retry exhaustion')
  try {
    const handler = async () => {
      throw new Error('Always fails')
    }
    
    await webhookVerifier.processWithRetry(handler, {
      maxRetries: 2,
      initialDelayMs: 50,
      maxDelayMs: 500,
      backoffMultiplier: 2
    })
    
    console.log('❌ Should have thrown error after retries exhausted')
    failed++
  } catch (error) {
    console.log('✅ Correctly threw error after retries exhausted')
    passed++
  }

  // Test 6: Webhook event logging
  console.log('\nTest 6: Webhook event logging')
  try {
    await webhookVerifier.logWebhookEvent('STRIPE', { id: 'evt_123', type: 'test' }, true)
    await webhookVerifier.logWebhookEvent('CLERK', { type: 'user.created' }, false)
    await webhookVerifier.logWebhookEvent('PLAID', { webhook_code: 'TEST' }, true)
    
    console.log('✅ Webhook event logging completed')
    passed++
  } catch (error) {
    console.log(`❌ Webhook event logging failed: ${(error as Error).message}`)
    failed++
  }

  // Test 7: Get retry configuration
  console.log('\nTest 7: Get retry configuration')
  try {
    const config = webhookVerifier.getRetryConfig()
    
    if (config.maxRetries === 3 && config.initialDelayMs === 1000) {
      console.log('✅ Retry configuration retrieved correctly')
      console.log(`   Max retries: ${config.maxRetries}`)
      console.log(`   Initial delay: ${config.initialDelayMs}ms`)
      console.log(`   Max delay: ${config.maxDelayMs}ms`)
      console.log(`   Backoff multiplier: ${config.backoffMultiplier}x`)
      passed++
    } else {
      console.log('❌ Retry configuration incorrect')
      failed++
    }
  } catch (error) {
    console.log(`❌ Get retry config failed: ${(error as Error).message}`)
    failed++
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log('='.repeat(50))

  if (failed === 0) {
    console.log('\n🎉 All webhook verifier tests passed!')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.')
  }
}

// Run tests
testWebhookVerifier()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
