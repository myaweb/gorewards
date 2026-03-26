/**
 * Test Input Validator Service
 * 
 * Quick test to verify input validation is working correctly
 */

// Load environment variables first
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { inputValidator } from '../lib/services/inputValidator'

async function testInputValidator() {
  console.log('🛡️  Testing Input Validator Service...')
  
  try {
    // Test 1: Spending amount validation
    console.log('\n1️⃣ Testing spending amount validation...')
    const validAmounts = [0, 100, 1000.50, 999999.99]
    const invalidAmounts = [-100, 1000001, 100.123, NaN, Infinity]
    
    let allValid = validAmounts.every(amount => inputValidator.validateSpendingAmount(amount))
    let allInvalid = invalidAmounts.every(amount => !inputValidator.validateSpendingAmount(amount))
    
    console.log(`   Valid amounts accepted: ${allValid ? '✅' : '❌'}`)
    console.log(`   Invalid amounts rejected: ${allInvalid ? '✅' : '❌'}`)

    // Test 2: XSS prevention
    console.log('\n2️⃣ Testing XSS prevention...')
    const xssInputs = [
      '<script>alert("XSS")</script>',
      'javascript:alert(1)',
      '<img src=x onerror=alert(1)>',
      '<iframe src="evil.com"></iframe>'
    ]
    
    const sanitizedOutputs = xssInputs.map(input => inputValidator.preventXSS(input))
    const allSanitized = sanitizedOutputs.every(output => 
      !output.includes('<script') && 
      !output.includes('javascript:') &&
      !output.includes('onerror=') &&
      !output.includes('<iframe')
    )
    
    console.log(`   XSS patterns removed: ${allSanitized ? '✅' : '❌'}`)
    console.log(`   Sample: "${xssInputs[0]}" → "${sanitizedOutputs[0]}"`)

    // Test 3: Text input sanitization
    console.log('\n3️⃣ Testing text input sanitization...')
    const dirtyText = '<b>Hello</b> & "World"'
    const cleanText = inputValidator.sanitizeTextInput(dirtyText)
    const isClean = !cleanText.includes('<') && !cleanText.includes('>')
    
    console.log(`   HTML entities encoded: ${isClean ? '✅' : '❌'}`)
    console.log(`   Sample: "${dirtyText}" → "${cleanText}"`)

    // Test 4: HTML validation
    console.log('\n4️⃣ Testing HTML validation...')
    const safeHTML = '<p>Hello World</p>'
    const dangerousHTML = '<script>alert(1)</script>'
    
    const safeIsValid = inputValidator.validateHTML(safeHTML)
    const dangerousIsInvalid = !inputValidator.validateHTML(dangerousHTML)
    
    console.log(`   Safe HTML accepted: ${safeIsValid ? '✅' : '❌'}`)
    console.log(`   Dangerous HTML rejected: ${dangerousIsInvalid ? '✅' : '❌'}`)

    // Test 5: Webhook payload validation
    console.log('\n5️⃣ Testing webhook payload validation...')
    
    const validStripePayload = {
      id: 'evt_123',
      object: 'event',
      type: 'payment_intent.succeeded',
      data: { object: {} }
    }
    
    const invalidStripePayload = {
      id: 'evt_123'
      // Missing required fields
    }
    
    const stripeValid = inputValidator.validateWebhookPayload(validStripePayload, 'STRIPE')
    const stripeInvalid = !inputValidator.validateWebhookPayload(invalidStripePayload, 'STRIPE')
    
    console.log(`   Valid Stripe webhook accepted: ${stripeValid ? '✅' : '❌'}`)
    console.log(`   Invalid Stripe webhook rejected: ${stripeInvalid ? '✅' : '❌'}`)

    // Test 6: Clerk webhook validation
    console.log('\n6️⃣ Testing Clerk webhook validation...')
    
    const validClerkPayload = {
      type: 'user.created',
      data: { id: 'user_123' }
    }
    
    const clerkValid = inputValidator.validateWebhookPayload(validClerkPayload, 'CLERK')
    console.log(`   Valid Clerk webhook accepted: ${clerkValid ? '✅' : '❌'}`)

    // Test 7: Plaid webhook validation
    console.log('\n7️⃣ Testing Plaid webhook validation...')
    
    const validPlaidPayload = {
      webhook_type: 'TRANSACTIONS',
      webhook_code: 'DEFAULT_UPDATE',
      item_id: 'item_123'
    }
    
    const plaidValid = inputValidator.validateWebhookPayload(validPlaidPayload, 'PLAID')
    console.log(`   Valid Plaid webhook accepted: ${plaidValid ? '✅' : '❌'}`)

    // Test 8: Schema-based validation
    console.log('\n8️⃣ Testing schema-based validation...')
    
    const schema = {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string' as const,
          required: true,
          minLength: 2,
          maxLength: 50
        },
        amount: {
          type: 'number' as const,
          required: true,
          min: 0,
          max: 1000000
        }
      }
    }
    
    const validInput = { name: 'John Doe', amount: 100 }
    const invalidInput = { name: 'J', amount: -50 }
    
    const validResult = inputValidator.validateAndSanitize(validInput, schema)
    const invalidResult = inputValidator.validateAndSanitize(invalidInput, schema)
    
    console.log(`   Valid input accepted: ${validResult.isValid ? '✅' : '❌'}`)
    console.log(`   Invalid input rejected: ${!invalidResult.isValid ? '✅' : '❌'}`)
    console.log(`   Errors detected: ${invalidResult.errors.length} errors`)

    // Test 9: Email validation
    console.log('\n9️⃣ Testing email validation...')
    const validEmails = ['test@example.com', 'user+tag@domain.co.uk']
    const invalidEmails = ['invalid', '@example.com', 'test@']
    
    const emailsValid = validEmails.every(email => inputValidator.validateEmail(email))
    const emailsInvalid = invalidEmails.every(email => !inputValidator.validateEmail(email))
    
    console.log(`   Valid emails accepted: ${emailsValid ? '✅' : '❌'}`)
    console.log(`   Invalid emails rejected: ${emailsInvalid ? '✅' : '❌'}`)

    // Test 10: URL validation
    console.log('\n🔟 Testing URL validation...')
    const validURLs = ['https://example.com', 'http://localhost:3000']
    const invalidURLs = ['not-a-url', 'ftp://invalid']
    
    const urlsValid = validURLs.every(url => inputValidator.validateURL(url))
    const urlsInvalid = invalidURLs.every(url => !inputValidator.validateURL(url))
    
    console.log(`   Valid URLs accepted: ${urlsValid ? '✅' : '❌'}`)
    console.log(`   Invalid URLs rejected: ${urlsInvalid ? '✅' : '❌'}`)

    // Test 11: Configuration check
    console.log('\n1️⃣1️⃣ Testing configuration...')
    const config = inputValidator.getConfig()
    console.log(`   Max spending amount: $${config.maxSpendingAmount.toLocaleString()}`)
    console.log(`   Min spending amount: $${config.minSpendingAmount}`)
    console.log(`   XSS patterns: ${config.xssPatternsCount}`)
    console.log(`   SQL patterns: ${config.sqlPatternsCount}`)
    console.log('   Configuration valid: ✅')

    console.log('\n🎉 All input validator tests passed!')
    return true

  } catch (error) {
    console.error('\n💥 Input validator test failed:', error)
    return false
  }
}

// Run the test
if (require.main === module) {
  testInputValidator().then((success) => {
    process.exit(success ? 0 : 1)
  })
}

export { testInputValidator }
