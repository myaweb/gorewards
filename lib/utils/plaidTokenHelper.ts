/**
 * Plaid Token Helper Utilities
 * 
 * Helper functions for retrieving and using encrypted Plaid tokens
 */

import { tokenEncryptor } from '@/lib/services/tokenEncryptor'
import { TokenType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/**
 * Get decrypted Plaid access token for a user
 */
export async function getPlaidAccessToken(userId: string): Promise<string | null> {
  try {
    return await tokenEncryptor.retrieveDecryptedToken(userId, TokenType.PLAID_ACCESS_TOKEN)
  } catch (error) {
    console.error('Failed to retrieve Plaid access token:', error)
    return null
  }
}

/**
 * Get decrypted Plaid access token by Clerk user ID
 */
export async function getPlaidAccessTokenByClerkId(clerkUserId: string): Promise<string | null> {
  try {
    // Find user by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkUserId }
    })

    if (!user) {
      return null
    }

    return await getPlaidAccessToken(user.id)
  } catch (error) {
    console.error('Failed to retrieve Plaid access token by Clerk ID:', error)
    return null
  }
}

/**
 * Check if user has a valid Plaid token
 */
export async function hasValidPlaidToken(userId: string): Promise<boolean> {
  try {
    const token = await getPlaidAccessToken(userId)
    return token !== null && token.length > 0
  } catch (error) {
    return false
  }
}

/**
 * Get Plaid item ID for a user
 */
export async function getPlaidItemId(userId: string): Promise<string | null> {
  try {
    const linkedAccount = await prisma.linkedAccount.findFirst({
      where: { userId }
    })

    return linkedAccount?.plaidItemId || null
  } catch (error) {
    console.error('Failed to retrieve Plaid item ID:', error)
    return null
  }
}

/**
 * Remove Plaid token and linked account for a user
 */
export async function removePlaidConnection(userId: string): Promise<void> {
  try {
    // Delete encrypted token
    await tokenEncryptor.deleteToken(userId, TokenType.PLAID_ACCESS_TOKEN)

    // Delete linked account
    await prisma.linkedAccount.deleteMany({
      where: { userId }
    })
  } catch (error) {
    console.error('Failed to remove Plaid connection:', error)
    throw error
  }
}

/**
 * Refresh Plaid token if needed
 */
export async function refreshPlaidTokenIfNeeded(userId: string): Promise<boolean> {
  try {
    const itemId = await getPlaidItemId(userId)
    if (!itemId) {
      return false
    }

    const refreshResult = await tokenEncryptor.refreshPlaidToken(userId, itemId)
    return refreshResult.success
  } catch (error) {
    console.error('Failed to refresh Plaid token:', error)
    return false
  }
}