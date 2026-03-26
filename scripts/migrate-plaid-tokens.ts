/**
 * Migration Script: Encrypt Existing Plaid Tokens
 * 
 * This script migrates existing plain text Plaid tokens to encrypted storage.
 * Run this once after implementing the TokenEncryptor service.
 */

import { prisma } from '../lib/prisma'
import { tokenEncryptor } from '../lib/services/tokenEncryptor'
import { TokenType } from '@prisma/client'

async function migratePlaidTokens() {
  console.log('🔐 Starting Plaid token migration to encrypted storage...')
  
  try {
    // Get all linked accounts with plain text tokens
    const linkedAccounts = await prisma.linkedAccount.findMany({
      where: {
        plaidAccessToken: {
          not: '[ENCRYPTED]'
        }
      },
      include: {
        user: true
      }
    })

    console.log(`📊 Found ${linkedAccounts.length} linked accounts to migrate`)

    let migratedCount = 0
    let errorCount = 0

    for (const account of linkedAccounts) {
      try {
        console.log(`🔄 Migrating token for user ${account.user.clerkUserId}...`)

        // Store encrypted token
        await tokenEncryptor.storeEncryptedToken(
          account.userId,
          account.plaidAccessToken,
          TokenType.PLAID_ACCESS_TOKEN
        )

        // Clear plain text token from LinkedAccount
        await prisma.linkedAccount.update({
          where: {
            id: account.id
          },
          data: {
            plaidAccessToken: '[ENCRYPTED]' // Placeholder to indicate migration
          }
        })

        migratedCount++
        console.log(`✅ Successfully migrated token for user ${account.user.clerkUserId}`)

      } catch (error) {
        errorCount++
        console.error(`❌ Failed to migrate token for user ${account.user.clerkUserId}:`, error)
      }
    }

    console.log('\n📈 Migration Summary:')
    console.log(`   • Total accounts: ${linkedAccounts.length}`)
    console.log(`   • Successfully migrated: ${migratedCount}`)
    console.log(`   • Errors: ${errorCount}`)

    if (errorCount === 0) {
      console.log('\n🎉 All Plaid tokens successfully migrated to encrypted storage!')
    } else {
      console.log('\n⚠️  Migration completed with some errors. Please review the failed accounts.')
    }

  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }
}

async function validateMigration() {
  console.log('\n🔍 Validating migration...')
  
  try {
    // Check that all tokens can be decrypted
    const encryptedTokens = await prisma.encryptedToken.findMany({
      where: {
        tokenType: TokenType.PLAID_ACCESS_TOKEN
      }
    })

    console.log(`📊 Found ${encryptedTokens.length} encrypted tokens to validate`)

    let validCount = 0
    let invalidCount = 0

    for (const token of encryptedTokens) {
      try {
        const decrypted = await tokenEncryptor.decryptToken(
          token.encryptedValue, 
          TokenType.PLAID_ACCESS_TOKEN
        )

        if (decrypted && decrypted.length > 0) {
          validCount++
        } else {
          invalidCount++
          console.error(`❌ Invalid decrypted token for user ${token.userId}`)
        }
      } catch (error) {
        invalidCount++
        console.error(`❌ Failed to decrypt token for user ${token.userId}:`, error)
      }
    }

    console.log('\n📈 Validation Summary:')
    console.log(`   • Total encrypted tokens: ${encryptedTokens.length}`)
    console.log(`   • Valid tokens: ${validCount}`)
    console.log(`   • Invalid tokens: ${invalidCount}`)

    if (invalidCount === 0) {
      console.log('\n✅ All encrypted tokens are valid!')
    } else {
      console.log('\n⚠️  Some tokens failed validation. Please investigate.')
    }

  } catch (error) {
    console.error('💥 Validation failed:', error)
  }
}

async function main() {
  console.log('🚀 Plaid Token Migration Script')
  console.log('================================\n')

  // Check if encryption key is configured
  if (!process.env.TOKEN_ENCRYPTION_KEY) {
    console.error('❌ TOKEN_ENCRYPTION_KEY environment variable is required')
    console.log('💡 Generate a 64-character hex string for encryption:')
    console.log('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"')
    process.exit(1)
  }

  // Validate encryption key
  if (!tokenEncryptor.validateEncryptionKey()) {
    console.error('❌ Invalid encryption key configuration')
    process.exit(1)
  }

  console.log('✅ Encryption key validated')

  // Run migration
  await migratePlaidTokens()

  // Validate migration
  await validateMigration()

  console.log('\n🏁 Migration script completed')
  process.exit(0)
}

// Run the migration
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  })
}

export { migratePlaidTokens, validateMigration }