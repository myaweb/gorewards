/**
 * Test Token Encryption Service
 * 
 * Quick test to verify token encryption is working correctly
 */

import { tokenEncryptor } from '../lib/services/tokenEncryptor'

async function testTokenEncryption() {
  console.log('🔐 Testing Token Encryption Service...')
  
  try {
    // Test 1: Validate encryption key
    console.log('\n1️⃣ Testing encryption key validation...')
    const isKeyValid = tokenEncryptor.validateEncryptionKey()
    console.log(`   Encryption key valid: ${isKeyValid ? '✅' : '❌'}`)
    
    if (!isKeyValid) {
      throw new Error('Encryption key validation failed')
    }

    // Test 2: Basic encryption/decryption
    console.log('\n2️⃣ Testing basic encryption/decryption...')
    const testToken = 'access-sandbox-test-token-12345'
    
    const encrypted = await tokenEncryptor.encryptPlaidToken(testToken)
    console.log(`   Original token: ${testToken}`)
    console.log(`   Encrypted token: ${encrypted.substring(0, 20)}...`)
    
    const decrypted = await tokenEncryptor.decryptPlaidToken(encrypted)
    console.log(`   Decrypted token: ${decrypted}`)
    console.log(`   Round-trip successful: ${testToken === decrypted ? '✅' : '❌'}`)
    
    if (testToken !== decrypted) {
      throw new Error('Round-trip encryption/decryption failed')
    }

    // Test 3: Multiple encryptions produce different results
    console.log('\n3️⃣ Testing encryption randomness...')
    const encrypted1 = await tokenEncryptor.encryptPlaidToken(testToken)
    const encrypted2 = await tokenEncryptor.encryptPlaidToken(testToken)
    console.log(`   First encryption: ${encrypted1.substring(0, 20)}...`)
    console.log(`   Second encryption: ${encrypted2.substring(0, 20)}...`)
    console.log(`   Different ciphertexts: ${encrypted1 !== encrypted2 ? '✅' : '❌'}`)
    
    if (encrypted1 === encrypted2) {
      throw new Error('Encryption should produce different ciphertexts for same plaintext')
    }

    // Test 4: Both decrypt to same plaintext
    const decrypted1 = await tokenEncryptor.decryptPlaidToken(encrypted1)
    const decrypted2 = await tokenEncryptor.decryptPlaidToken(encrypted2)
    console.log(`   Both decrypt correctly: ${decrypted1 === testToken && decrypted2 === testToken ? '✅' : '❌'}`)

    // Test 5: Error handling
    console.log('\n4️⃣ Testing error handling...')
    try {
      await tokenEncryptor.decryptPlaidToken('invalid-encrypted-data')
      console.log('   Error handling: ❌ (should have thrown error)')
    } catch (error) {
      console.log('   Error handling: ✅ (correctly threw error)')
    }

    console.log('\n🎉 All token encryption tests passed!')
    return true

  } catch (error) {
    console.error('\n💥 Token encryption test failed:', error)
    return false
  }
}

// Run the test
if (require.main === module) {
  testTokenEncryption().then((success) => {
    process.exit(success ? 0 : 1)
  })
}

export { testTokenEncryption }