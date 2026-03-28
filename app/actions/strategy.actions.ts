'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

/**
 * Save a user's optimization strategy to the database
 * Requires authentication via Clerk
 */
export async function saveUserStrategy(roadmapData: any, goalName: string) {
  try {
    // Get authenticated user from Clerk
    const { userId: clerkUserId } = auth()

    if (!clerkUserId) {
      return {
        success: false,
        error: 'You must be logged in to save strategies',
        requiresAuth: true,
      }
    }

    // Find or create user in our database
    let user = await prisma.user.findUnique({
      where: { clerkUserId },
    })

    if (!user) {
      // Get user details from Clerk
      const clerkUser = await currentUser()
      
      if (!clerkUser) {
        return {
          success: false,
          error: 'User not found',
        }
      }

      // Create user if doesn't exist (first time saving)
      user = await prisma.user.create({
        data: {
          clerkUserId,
          email: clerkUser.emailAddresses[0]?.emailAddress || `user-${clerkUserId}@temp.com`,
        },
      })
    }

    // Save the strategy
    const savedStrategy = await prisma.savedStrategy.create({
      data: {
        userId: user.id,
        goalName,
        roadmapData,
        isCompleted: false,
      },
    })

    // Revalidate dashboard page
    revalidatePath('/users')

    return {
      success: true,
      strategyId: savedStrategy.id,
      message: 'Strategy saved successfully!',
    }
  } catch (error) {
    console.error('Error saving strategy:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save strategy',
    }
  }
}

/**
 * Get all saved strategies for the current user
 */
export async function getUserStrategies() {
  try {
    const { userId: clerkUserId } = auth()

    if (!clerkUserId) {
      return {
        success: false,
        error: 'You must be logged in to view strategies',
        strategies: [],
      }
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        savedStrategies: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) {
      return {
        success: true,
        strategies: [],
      }
    }

    return {
      success: true,
      strategies: user.savedStrategies,
    }
  } catch (error) {
    console.error('Error fetching strategies:', error)
    return {
      success: false,
      error: 'Failed to fetch strategies',
      strategies: [],
    }
  }
}

/**
 * Update strategy completion status
 */
export async function updateStrategyCompletion(strategyId: string, isCompleted: boolean) {
  try {
    const { userId: clerkUserId } = auth()

    if (!clerkUserId) {
      return {
        success: false,
        error: 'You must be logged in',
      }
    }

    // Verify ownership
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    const strategy = await prisma.savedStrategy.findUnique({
      where: { id: strategyId },
    })

    if (!strategy || strategy.userId !== user.id) {
      return {
        success: false,
        error: 'Strategy not found or unauthorized',
      }
    }

    // Update completion status
    await prisma.savedStrategy.update({
      where: { id: strategyId },
      data: { isCompleted },
    })

    revalidatePath('/users')

    return {
      success: true,
      message: isCompleted ? 'Strategy marked as completed!' : 'Strategy marked as incomplete',
    }
  } catch (error) {
    console.error('Error updating strategy:', error)
    return {
      success: false,
      error: 'Failed to update strategy',
    }
  }
}

/**
 * Delete a saved strategy
 */
export async function deleteStrategy(strategyId: string) {
  try {
    const { userId: clerkUserId } = auth()

    if (!clerkUserId) {
      return {
        success: false,
        error: 'You must be logged in',
      }
    }

    // Verify ownership
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    const strategy = await prisma.savedStrategy.findUnique({
      where: { id: strategyId },
    })

    if (!strategy || strategy.userId !== user.id) {
      return {
        success: false,
        error: 'Strategy not found or unauthorized',
      }
    }

    // Delete strategy
    await prisma.savedStrategy.delete({
      where: { id: strategyId },
    })

    revalidatePath('/users')

    return {
      success: true,
      message: 'Strategy deleted successfully',
    }
  } catch (error) {
    console.error('Error deleting strategy:', error)
    return {
      success: false,
      error: 'Failed to delete strategy',
    }
  }
}
