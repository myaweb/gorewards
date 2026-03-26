import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { UserProfileService } from '@/lib/services/userProfileService'
import { UserCardSchema } from '@/lib/types/userProfile'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

/**
 * PUT /api/profile/cards/[cardId]
 * 
 * Update a user's card
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }
    
    const body = await request.json()
    
    // Validate input (partial update)
    const cardData = UserCardSchema.partial().parse({
      ...body,
      openDate: body.openDate ? new Date(body.openDate) : undefined,
      annualFeeDate: body.annualFeeDate ? new Date(body.annualFeeDate) : undefined,
      downgradeEligibleDate: body.downgradeEligibleDate ? new Date(body.downgradeEligibleDate) : undefined
    })
    
    // Update card
    const updatedCard = await prisma.userCard.update({
      where: {
        id: params.cardId,
        userId
      },
      data: cardData
    })
    
    return NextResponse.json({
      success: true,
      data: updatedCard,
      message: 'Card updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating user card:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid card data',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update card'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/profile/cards/[cardId]
 * 
 * Remove a card from user's portfolio
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }
    
    // Remove card from user's portfolio
    await UserProfileService.removeUserCard(userId, params.cardId)
    
    return NextResponse.json({
      success: true,
      message: 'Card removed successfully'
    })
    
  } catch (error) {
    console.error('Error removing user card:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to remove card'
    }, { status: 500 })
  }
}