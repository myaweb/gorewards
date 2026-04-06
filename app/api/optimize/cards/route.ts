import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { CardOptimizationEngine } from '@/lib/services/cardOptimizationEngine'
import { CardOptimizationRequestSchema } from '@/lib/types/cardOptimization'
import { UserProfileService } from '@/lib/services/userProfileService'
import { z } from 'zod'

/**
 * POST /api/optimize/cards
 * 
 * Calculate optimal card usage per spending category for authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }
    
    const body = await request.json()
    
    // Validate request
    const validatedData = CardOptimizationRequestSchema.parse({
      ...body,
      userId
    })
    
    // Calculate optimization
    const result = await CardOptimizationEngine.calculateBestCardPerCategory(
      userId,
      validatedData.spendingProfile
    )
    
    return NextResponse.json({
      success: true,
      data: result,
      message: `Optimized ${result.optimizations.length} spending categories`
    })
    
  } catch (error) {
    console.error('Card optimization error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 })
    }
    
    if (error instanceof Error && error.message.includes('no active cards')) {
      return NextResponse.json({
        success: false,
        error: 'No active cards found for optimization',
        message: 'Please add cards to your portfolio first'
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to optimize card usage',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * GET /api/optimize/cards
 * 
 * Get card optimization using user's saved profile
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
    
    // Get user's profile with details
    const profileData = await UserProfileService.getProfileWithDetails(userId)
    
    if (!profileData || !profileData.profile) {
      return NextResponse.json({
        success: false,
        error: 'Profile not found',
        message: 'Please create your financial profile first'
      }, { status: 400 })
    }
    
    const profile = profileData.profile
    
    // Extract spending profile from individual fields
    const spendingProfile = {
      grocery: Number(profile.monthlyGrocery),
      gas: Number(profile.monthlyGas),
      dining: Number(profile.monthlyDining),
      bills: Number(profile.monthlyBills),
      travel: Number(profile.monthlyTravel),
      shopping: Number(profile.monthlyShopping),
      other: Number(profile.monthlyOther)
    }
    
    // Calculate optimization
    const result = await CardOptimizationEngine.calculateBestCardPerCategory(
      userId,
      spendingProfile
    )
    
    return NextResponse.json({
      success: true,
      data: result,
      context: {
        usedSavedProfile: true,
        profileLastUpdated: profile.lastUpdated
      },
      message: `Optimized ${result.optimizations.length} spending categories using saved profile`
    })
    
  } catch (error) {
    console.error('Card optimization error:', error)
    
    if (error instanceof Error && error.message.includes('no active cards')) {
      return NextResponse.json({
        success: false,
        error: 'No active cards found for optimization',
        message: 'Please add cards to your portfolio first'
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to optimize card usage',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
