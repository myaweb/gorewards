import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { UserProfileService } from '@/lib/services/userProfileService'
import { UserProfileUpdateSchema } from '@/lib/types/userProfile'
import { z } from 'zod'

/**
 * GET /api/profile
 * 
 * Get user's financial profile with all details
 */
export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }
    
    const profile = await UserProfileService.getProfileWithDetails(userId)
    
    if (!profile) {
      // Create empty profile if none exists
      const newProfile = await UserProfileService.getOrCreateProfile(userId)
      return NextResponse.json({
        success: true,
        data: {
          profile: newProfile,
          userCards: [],
          bonusProgress: []
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      data: profile
    })
    
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch profile'
    }, { status: 500 })
  }
}

/**
 * PUT /api/profile
 * 
 * Update user's financial profile
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }
    
    const body = await request.json()
    
    // Validate input with proper schema
    const validatedData = UserProfileUpdateSchema.parse(body)
    
    // Update profile with validated data
    const updatedProfile = await UserProfileService.updateProfile(userId, validatedData)
    
    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating user profile:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid profile data',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
