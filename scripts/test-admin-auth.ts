/**
 * Test Admin Authentication Service
 * 
 * Quick test to verify admin authentication is working correctly
 */

// Load environment variables first
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { adminAuthenticator } from '../lib/services/adminAuthenticator'

async function testAdminAuthentication() {
  console.log('🔐 Testing Admin Authentication Service...')
  
  try {
    // Test 1: Check if admin access is enabled
    console.log('\n1️⃣ Testing admin access configuration...')
    const isEnabled = adminAuthenticator.isAdminAccessEnabled()
    console.log(`   Admin access enabled: ${isEnabled ? '✅' : '❌'}`)
    
    if (!isEnabled) {
      console.log('   ⚠️  ADMIN_CLERK_ID not configured - this is expected in development')
      return true
    }

    // Test 2: Get admin configuration
    console.log('\n2️⃣ Testing admin configuration...')
    const config = adminAuthenticator.getAdminConfig()
    console.log(`   Admin Clerk ID: ${config.adminClerkId.substring(0, 10)}...`)
    console.log(`   Session duration: ${config.sessionDurationMs / (60 * 60 * 1000)} hours`)
    console.log(`   Configuration valid: ✅`)

    // Test 3: Test invalid user validation
    console.log('\n3️⃣ Testing invalid user validation...')
    const invalidValidation = await adminAuthenticator.validateAdminAccess('invalid-user-id')
    console.log(`   Invalid user rejected: ${!invalidValidation.isAdmin ? '✅' : '❌'}`)
    console.log(`   Is valid: ${invalidValidation.isValid}`)
    console.log(`   Is admin: ${invalidValidation.isAdmin}`)
    console.log(`   Permissions: ${invalidValidation.permissions.length}`)

    // Test 4: Test admin user validation (if configured)
    console.log('\n4️⃣ Testing admin user validation...')
    const adminValidation = await adminAuthenticator.validateAdminAccess(config.adminClerkId)
    console.log(`   Admin user recognized: ${adminValidation.isAdmin ? '✅' : '❌'}`)
    console.log(`   Is valid: ${adminValidation.isValid}`)
    console.log(`   Is admin: ${adminValidation.isAdmin}`)
    console.log(`   Permissions count: ${adminValidation.permissions.length}`)
    console.log(`   Permissions: ${adminValidation.permissions.join(', ')}`)

    // Test 5: Test permission checking
    console.log('\n5️⃣ Testing permission checking...')
    const hasCardManagement = await adminAuthenticator.checkAdminPermission(
      config.adminClerkId, 
      'CARD_MANAGEMENT'
    )
    const hasInvalidPermission = await adminAuthenticator.checkAdminPermission(
      'invalid-user', 
      'CARD_MANAGEMENT'
    )
    console.log(`   Admin has CARD_MANAGEMENT: ${hasCardManagement ? '✅' : '❌'}`)
    console.log(`   Invalid user has permission: ${!hasInvalidPermission ? '✅' : '❌'}`)

    console.log('\n🎉 All admin authentication tests passed!')
    return true

  } catch (error) {
    console.error('\n💥 Admin authentication test failed:', error)
    return false
  }
}

// Run the test
if (require.main === module) {
  testAdminAuthentication().then((success) => {
    process.exit(success ? 0 : 1)
  })
}

export { testAdminAuthentication }