'use server'

import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Admin email whitelist - centralized admin auth
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []

/**
 * Verify if the current user is an admin
 * Uses email-based whitelist for consistency with admin page auth
 */
async function isAdmin(): Promise<boolean> {
  try {
    const user = await currentUser()
    if (!user) return false
    
    const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase()
    if (!userEmail) return false
    
    return ADMIN_EMAILS.includes(userEmail)
  } catch (error) {
    console.error('Admin auth check failed:', error)
    return false
  }
}

/**
 * Update affiliate link and image URL for a card
 * Admin only
 */
export async function updateCardAffiliateLink(cardId: string, affiliateLink: string, imageUrl?: string) {
  try {
    const adminAccess = await isAdmin()
    
    if (!adminAccess) {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
      }
    }

    // Validate affiliate URL format if provided
    if (affiliateLink && affiliateLink.trim() !== '') {
      try {
        new URL(affiliateLink)
      } catch {
        return {
          success: false,
          error: 'Invalid affiliate URL format',
        }
      }
    }

    // Validate image URL format if provided
    if (imageUrl && imageUrl.trim() !== '') {
      const trimmed = imageUrl.trim()
      const isRelative = trimmed.startsWith('/')
      const isAbsolute = (() => { try { new URL(trimmed); return true } catch { return false } })()
      if (!isRelative && !isAbsolute) {
        return {
          success: false,
          error: 'Invalid image URL format',
        }
      }
    }

    // Update card
    await prisma.card.update({
      where: { id: cardId },
      data: { 
        affiliateLink: affiliateLink.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        updatedAt: new Date(),
      },
    })

    // Revalidate all comparison pages that might use this card
    revalidatePath('/compare/[slug]', 'page')
    revalidatePath('/admin')

    return {
      success: true,
      message: 'Card updated successfully',
    }
  } catch (error) {
    console.error('Error updating card:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update card',
    }
  }
}

/**
 * Get admin dashboard metrics
 * Admin only
 */
export async function getAdminMetrics() {
  try {
    const adminAccess = await isAdmin()
    
    if (!adminAccess) {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
        metrics: null,
      }
    }

    const [
      totalUsers,
      totalStrategies,
      totalPremiumUsers,
      totalCards,
      totalBonuses,
      totalMultipliers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.savedStrategy.count(),
      prisma.user.count({ where: { isPremium: true } }),
      prisma.card.count({ where: { isActive: true } }),
      prisma.cardBonus.count(),
      prisma.cardMultiplier.count(),
    ])

    return {
      success: true,
      metrics: {
        totalUsers,
        totalStrategies,
        totalPremiumUsers,
        totalCards,
        totalBonuses,
        totalMultipliers,
      },
    }
  } catch (error) {
    console.error('Error fetching admin metrics:', error)
    return {
      success: false,
      error: 'Failed to fetch metrics',
      metrics: null,
    }
  }
}

/**
 * Get all cards with basic info
 * Admin only
 */
export async function getAllCards() {
  try {
    const adminAccess = await isAdmin()
    
    if (!adminAccess) {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
        cards: [],
      }
    }

    const cards = await prisma.card.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        bank: true,
        annualFee: true,
        affiliateLink: true,
        imageUrl: true,
        isActive: true,
        network: true,
        clickCount: true,
        createdAt: true,
      },
    })

    return {
      success: true,
      cards,
    }
  } catch (error) {
    console.error('Error fetching cards:', error)
    return {
      success: false,
      error: 'Failed to fetch cards',
      cards: [],
    }
  }
}

/**
 * Get all cards with full details (bonuses, multipliers)
 * Admin only
 */
export async function getAllCardsWithDetails() {
  try {
    const adminAccess = await isAdmin()
    
    if (!adminAccess) {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
        cards: [],
      }
    }

    const cards = await prisma.card.findMany({
      orderBy: { name: 'asc' },
      include: {
        bonuses: true,
        multipliers: true,
      },
    })

    return {
      success: true,
      cards,
    }
  } catch (error) {
    console.error('Error fetching cards with details:', error)
    return {
      success: false,
      error: 'Failed to fetch cards',
      cards: [],
    }
  }
}

/**
 * Get affiliate analytics (click tracking)
 * Admin only
 */
export async function getAffiliateAnalytics() {
  try {
    const adminAccess = await isAdmin()
    
    if (!adminAccess) {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
        analytics: [],
      }
    }

    const cards = await prisma.card.findMany({
      where: {
        affiliateLink: { not: null },
      },
      orderBy: { clickCount: 'desc' },
      select: {
        id: true,
        name: true,
        bank: true,
        clickCount: true,
        affiliateLink: true,
      },
    })

    return {
      success: true,
      analytics: cards,
    }
  } catch (error) {
    console.error('Error fetching affiliate analytics:', error)
    return {
      success: false,
      error: 'Failed to fetch analytics',
      analytics: [],
    }
  }
}

/**
 * Get all users with stats
 * Admin only
 */
export async function getAllUsers() {
  try {
    const adminAccess = await isAdmin()
    
    if (!adminAccess) {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
        users: [],
      }
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            savedStrategies: true,
            linkedAccounts: true,
          },
        },
      },
    })

    return {
      success: true,
      users,
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return {
      success: false,
      error: 'Failed to fetch users',
      users: [],
    }
  }
}

/**
 * Update user premium status
 * Admin only
 */
export async function updateUserPlan(
  targetUserId: string,
  isPremium: boolean
) {
  try {
    const adminAccess = await isAdmin()
    
    if (!adminAccess) {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
      }
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { 
        isPremium,
        updatedAt: new Date(),
      },
    })

    revalidatePath('/admin')

    return {
      success: true,
      message: 'User plan updated successfully',
    }
  } catch (error) {
    console.error('Error updating user plan:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user plan',
    }
  }
}
