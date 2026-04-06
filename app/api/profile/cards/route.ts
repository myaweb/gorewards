import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { UserProfileService } from '@/lib/services/userProfileService'
import { UserCardSchema } from '@/lib/types/userProfile'
import { z } from 'zod'

/**
 * GET /api/profile/cards
 * 
 * Get user's card ownership status
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
    
    const cardOwnership = await UserProfileService.getCardOwnershipStatus(userId)
    
    return NextResponse.json({
      success: true,
      data: cardOwnership
    })
    
  } catch (error) {
    console.error('Error fetching user cards:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user cards'
    }, { status: 500 })
  }
}

/**
 * POST /api/profile/cards
 * 
 * Add a new card to user's portfolio
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
    
    // Validate input
    const cardData = UserCardSchema.parse({
      ...body,
      openDate: new Date(body.openDate),
      annualFeeDate: new Date(body.annualFeeDate),
      downgradeEligibleDate: body.downgradeEligibleDate ? new Date(body.downgradeEligibleDate) : undefined
    })
    
    // Add card to user's portfolio
    const userCard = await UserProfileService.addUserCard(userId, cardData)
    
    return NextResponse.json({
      success: true,
      data: userCard,
      message: 'Card added successfully'
    })
    
  } catch (error) {
    console.error('Error adding user card:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid card data',
        details: error.errors
      }, { status: 400 })
    }
    
    // Handle unique constraint violation (user already has this card)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({
        success: false,
        error: 'You already have this card in your portfolio'
      }, { status: 409 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to add card'
    }, { status: 500 })
  }
}
