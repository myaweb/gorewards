/**
 * Admin Authentication & Authorization
 * 
 * Provides admin access control for sensitive operations
 */

import { currentUser } from '@clerk/nextjs/server'

// Admin email whitelist - configure via environment variable
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []

/**
 * Check if current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await currentUser()
    
    if (!user) {
      return false
    }

    const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase()
    
    if (!userEmail) {
      return false
    }

    return ADMIN_EMAILS.includes(userEmail)
  } catch (error) {
    console.error('Admin auth check failed:', error)
    return false
  }
}

/**
 * Require admin access - throws if not admin
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin()
  
  if (!admin) {
    throw new Error('Unauthorized: Admin access required')
  }
}

/**
 * Get current user with admin status
 */
export async function getCurrentUserWithAdminStatus() {
  const user = await currentUser()
  
  if (!user) {
    return null
  }

  const admin = await isAdmin()
  
  return {
    user,
    isAdmin: admin,
  }
}
