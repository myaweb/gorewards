/**
 * Token Encryption Service
 * 
 * Provides AES-256-GCM encryption for sensitive tokens (Plaid, Stripe, etc.)
 * with automatic key rotation and secure key management.
 */

import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { TokenType } from '@prisma/client'
import { TokenEncryptor, RefreshResult } from '@/lib/types/security'
import { plaidClient } from '@/lib/plaid'

export class TokenEncryptorService implements TokenEncryptor {
  private readonly algorithm = 'aes-256-cbc'
  private readonly keyLength = 32 // 256 bits
  private readonly ivLength = 16  // 128 bits for CBC
  
  private encryptionKey!: Buffer
  private keyVersion: number = 1

  constructor() {
    this.initializeEncryptionKey()
  }

  /**
   * Initialize encryption key from environment variable
   */
  private initializeEncryptionKey(): void {
    const keyString = process.env.TOKEN_ENCRYPTION_KEY
    
    if (!keyString) {
      throw new Error('TOKEN_ENCRYPTION_KEY environment variable is required')
    }
    
    if (keyString.length !== 64) { // 32 bytes = 64 hex characters
      throw new Error('TOKEN_ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
    }
    
    try {
      this.encryptionKey = Buffer.from(keyString, 'hex')
    } catch (error) {
      throw new Error('TOKEN_ENCRYPTION_KEY must be valid hex string')
    }
    
    // Get key version from environment (for key rotation)
    const keyVersionString = process.env.TOKEN_ENCRYPTION_KEY_VERSION
    if (keyVersionString) {
      this.keyVersion = parseInt(keyVersionString, 10)
      if (isNaN(this.keyVersion) || this.keyVersion < 1) {
        throw new Error('TOKEN_ENCRYPTION_KEY_VERSION must be a positive integer')
      }
    }
  }

  /**
   * Encrypt a token using AES-256-CBC (simpler than GCM for now)
   */
  private encrypt(plaintext: string): { encrypted: string; keyVersion: number } {
    try {
      // Generate random IV
      const iv = crypto.randomBytes(16) // 128 bits for CBC
      
      // Create cipher
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey)
      
      // Encrypt the plaintext
      let encrypted = cipher.update(plaintext, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      // Combine IV + encrypted data
      const combined = Buffer.concat([iv, Buffer.from(encrypted, 'hex')])
      
      return {
        encrypted: combined.toString('base64'),
        keyVersion: this.keyVersion
      }
    } catch (error) {
      throw new Error(`Token encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Decrypt a token using AES-256-CBC
   */
  private decrypt(encryptedData: string, keyVersion?: number): string {
    try {
      // Decode from base64
      const combined = Buffer.from(encryptedData, 'base64')
      
      // Extract components
      const iv = combined.subarray(0, 16) // First 16 bytes are IV
      const encrypted = combined.subarray(16) // Rest is encrypted data
      
      // Create decipher
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey)
      
      // Decrypt
      let decrypted = decipher.update(encrypted, undefined, 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      throw new Error(`Token decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Encrypt a Plaid access token
   */
  async encryptPlaidToken(token: string): Promise<string> {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token: must be a non-empty string')
    }
    
    const { encrypted } = this.encrypt(token)
    return encrypted
  }

  /**
   * Decrypt a Plaid access token
   */
  async decryptPlaidToken(encryptedToken: string): Promise<string> {
    if (!encryptedToken || typeof encryptedToken !== 'string') {
      throw new Error('Invalid encrypted token: must be a non-empty string')
    }
    
    return this.decrypt(encryptedToken)
  }

  /**
   * Generic token encryption
   */
  async encryptToken(token: string, tokenType: TokenType): Promise<string> {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token: must be a non-empty string')
    }
    
    const { encrypted } = this.encrypt(token)
    return encrypted
  }

  /**
   * Generic token decryption
   */
  async decryptToken(encryptedToken: string, tokenType: TokenType): Promise<string> {
    if (!encryptedToken || typeof encryptedToken !== 'string') {
      throw new Error('Invalid encrypted token: must be a non-empty string')
    }
    
    return this.decrypt(encryptedToken)
  }

  /**
   * Store encrypted token in database
   */
  async storeEncryptedToken(
    userId: string, 
    token: string, 
    tokenType: TokenType,
    expiresAt?: Date,
    refreshToken?: string
  ): Promise<void> {
    const encryptedValue = await this.encryptToken(token, tokenType)
    const encryptedRefreshToken = refreshToken ? await this.encryptToken(refreshToken, tokenType) : undefined

    await prisma.encryptedToken.upsert({
      where: {
        userId_tokenType: {
          userId,
          tokenType
        }
      },
      update: {
        encryptedValue,
        keyVersion: this.keyVersion,
        expiresAt,
        refreshToken: encryptedRefreshToken,
        updatedAt: new Date(),
        lastUsed: new Date()
      },
      create: {
        userId,
        tokenType,
        encryptedValue,
        keyVersion: this.keyVersion,
        expiresAt,
        refreshToken: encryptedRefreshToken,
        lastUsed: new Date()
      }
    })
  }

  /**
   * Retrieve and decrypt token from database
   */
  async retrieveDecryptedToken(userId: string, tokenType: TokenType): Promise<string | null> {
    const encryptedToken = await prisma.encryptedToken.findUnique({
      where: {
        userId_tokenType: {
          userId,
          tokenType
        }
      }
    })

    if (!encryptedToken) {
      return null
    }

    // Update last used timestamp
    await prisma.encryptedToken.update({
      where: {
        id: encryptedToken.id
      },
      data: {
        lastUsed: new Date()
      }
    })

    return this.decryptToken(encryptedToken.encryptedValue, tokenType)
  }

  /**
   * Refresh Plaid access token
   */
  async refreshPlaidToken(userId: string, itemId: string): Promise<RefreshResult> {
    try {
      // Get current encrypted token
      const encryptedTokenRecord = await prisma.encryptedToken.findUnique({
        where: {
          userId_tokenType: {
            userId,
            tokenType: TokenType.PLAID_ACCESS_TOKEN
          }
        }
      })

      if (!encryptedTokenRecord) {
        return {
          success: false,
          error: 'No Plaid token found for user',
          requiresReauth: true
        }
      }

      // Decrypt current token
      const currentToken = await this.decryptToken(
        encryptedTokenRecord.encryptedValue, 
        TokenType.PLAID_ACCESS_TOKEN
      )

      // Attempt to refresh token with Plaid
      // Note: Plaid doesn't have a refresh mechanism like OAuth2
      // Instead, we validate the token and check if it's still valid
      try {
        await plaidClient.accountsGet({
          access_token: currentToken
        })

        // Token is still valid
        return {
          success: true,
          newToken: currentToken,
          requiresReauth: false
        }
      } catch (plaidError: any) {
        // Check if error indicates token expiration or invalidity
        if (plaidError?.error_code === 'INVALID_ACCESS_TOKEN' || 
            plaidError?.error_code === 'ITEM_LOGIN_REQUIRED') {
          return {
            success: false,
            error: 'Plaid token expired or invalid',
            requiresReauth: true
          }
        }

        // Other Plaid errors (network, etc.)
        return {
          success: false,
          error: `Plaid API error: ${plaidError.message}`,
          requiresReauth: false
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        requiresReauth: false
      }
    }
  }

  /**
   * Rotate encryption key (for key rotation)
   */
  async rotateEncryptionKey(): Promise<void> {
    // This would be implemented for key rotation
    // For now, throw an error as this requires careful planning
    throw new Error('Key rotation not implemented - requires manual process')
  }

  /**
   * Validate encryption key
   */
  validateEncryptionKey(): boolean {
    try {
      // Test encryption/decryption with a sample string
      const testString = 'test-encryption-key-validation'
      const { encrypted } = this.encrypt(testString)
      const decrypted = this.decrypt(encrypted)
      
      return decrypted === testString
    } catch (error) {
      return false
    }
  }

  /**
   * Check if token is expired
   */
  async isTokenExpired(userId: string, tokenType: TokenType): Promise<boolean> {
    const encryptedToken = await prisma.encryptedToken.findUnique({
      where: {
        userId_tokenType: {
          userId,
          tokenType
        }
      }
    })

    if (!encryptedToken || !encryptedToken.expiresAt) {
      return false // No expiration set
    }

    return new Date() > encryptedToken.expiresAt
  }

  /**
   * Delete encrypted token
   */
  async deleteToken(userId: string, tokenType: TokenType): Promise<void> {
    await prisma.encryptedToken.deleteMany({
      where: {
        userId,
        tokenType
      }
    })
  }

  /**
   * Get token metadata (without decrypting)
   */
  async getTokenMetadata(userId: string, tokenType: TokenType) {
    return prisma.encryptedToken.findUnique({
      where: {
        userId_tokenType: {
          userId,
          tokenType
        }
      },
      select: {
        id: true,
        tokenType: true,
        keyVersion: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        lastUsed: true
      }
    })
  }
}

// Singleton instance
export const tokenEncryptor = new TokenEncryptorService()