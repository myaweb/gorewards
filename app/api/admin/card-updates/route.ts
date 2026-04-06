import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { CardDataUpdateService } from '@/lib/services/cardDataUpdateService'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createAdminRoute } from '@/lib/middleware/adminAuth'

// Validation schemas
const BonusUpdateSchema = z.object({
  cardId: z.string(),
  bonusId: z.string().optional(),
  bonusPoints: z.number().optional(),
  minimumSpendAmount: z.number().optional(),
  spendPeriodMonths: z.number().optional()
})

const MultiplierUpdateSchema = z.object({
  cardId: z.string(),
  multiplierId: z.string().optional(),
  category: z.string().optional(),
  multiplierValue: z.number().optional()
})

const CardInfoUpdateSchema = z.object({
  cardId: z.string(),
  annualFee: z.number().optional(),
  affiliateLink: z.string().optional(),
  imageUrl: z.string().optional()
})

/**
 * POST /api/admin/card-updates
 * 
 * Handle various types of card data updates from admin interface
 * Security: Protected with admin authentication
 */
async function postCardUpdatesHandler(request: NextRequest, context: { userId: string }) {
  try {
    // Admin authentication is handled by middleware
    const { userId } = context
    
    const body = await request.json()
    const { updateType, ...updateData } = body
    
    let result
    let cardId: string
    
    switch (updateType) {
      case 'BONUS':
        const bonusData = BonusUpdateSchema.parse(updateData)
        cardId = bonusData.cardId
        result = await CardDataUpdateService.createUpdate({
          updateType: 'BONUS',
          cardId,
          updateData: bonusData,
          source: `admin:${userId}`
        })
        break
        
      case 'MULTIPLIER':
        const multiplierData = MultiplierUpdateSchema.parse(updateData)
        cardId = multiplierData.cardId
        result = await CardDataUpdateService.createUpdate({
          updateType: 'MULTIPLIER',
          cardId,
          updateData: multiplierData,
          source: `admin:${userId}`
        })
        break
        
      case 'CARD_INFO':
        const cardInfoData = CardInfoUpdateSchema.parse(updateData)
        cardId = cardInfoData.cardId
        const { cardId: _, ...updates } = cardInfoData
        result = await CardDataUpdateService.createUpdate({
          updateType: 'CARD_INFO',
          cardId,
          updateData: updates,
          source: `admin:${userId}`
        })
        break
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid update type'
        }, { status: 400 })
    }
    
    // Process the update immediately
    const processed = await CardDataUpdateService.processUpdate(result.id)
    
    if (processed.status === 'APPLIED') {
      return NextResponse.json({
        success: true,
        data: processed,
        message: `${updateType} updated successfully`
      })
    } else {
      return NextResponse.json({
        success: false,
        error: processed.error || 'Update failed',
        data: processed
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Card update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update card data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * GET /api/admin/card-updates
 * 
 * Get update statistics and recent changes for admin dashboard
 * Security: Protected with admin authentication
 */
async function getCardUpdatesHandler(request: NextRequest, context: { userId: string }) {
  try {
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view')

    // Return pending updates with full details for admin review UI
    if (view === 'pending') {
      const pendingUpdates = await CardDataUpdateService.getPendingUpdatesWithDetails()
      return NextResponse.json({ success: true, data: pendingUpdates })
    }

    // Default: return statistics and recent updates
    const statistics = await CardDataUpdateService.getUpdateStatistics()
    
    // Get recent updates
    const recentUpdates = await prisma.updateRecord.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        card: {
          select: {
            name: true
          }
        }
      }
    })

    // Format recent updates
    const formattedRecentUpdates = recentUpdates.map(update => ({
      id: update.id,
      cardName: update.card.name,
      changeType: update.updateType,
      changeReason: update.status === 'FAILED' ? update.error : null,
      createdAt: update.createdAt,
      status: update.status
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        ...statistics,
        recentUpdates: formattedRecentUpdates
      }
    })
    
  } catch (error) {
    console.error('Error fetching update statistics:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch update statistics'
    }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/card-updates
 * 
 * Approve pending update(s) — applies changes to database
 * Supports single: { updateId: string } or bulk: { updateIds: string[] }
 */
async function patchCardUpdatesHandler(request: NextRequest, context: { userId: string }) {
  try {
    const body = await request.json()
    const ids: string[] = body.updateIds || (body.updateId ? [body.updateId] : [])

    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No update IDs provided' }, { status: 400 })
    }

    let approved = 0
    let failed = 0
    const errors: string[] = []

    for (const id of ids) {
      try {
        const result = await CardDataUpdateService.processUpdate(id)
        if (result.status === 'APPLIED') {
          approved++
        } else {
          failed++
          if (result.error) errors.push(`${id}: ${result.error}`)
        }
      } catch (error) {
        failed++
        errors.push(`${id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      data: { approved, failed, errors },
      message: `${approved} update(s) approved, ${failed} failed`,
    })
  } catch (error) {
    console.error('Approve update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to approve updates' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/card-updates
 * 
 * Reject pending update(s) — marks as rejected without applying
 * Supports single: { updateId: string } or bulk: { updateIds: string[] }
 */
async function deleteCardUpdatesHandler(request: NextRequest, context: { userId: string }) {
  try {
    const body = await request.json()
    const ids: string[] = body.updateIds || (body.updateId ? [body.updateId] : [])

    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No update IDs provided' }, { status: 400 })
    }

    let rejected = 0
    for (const id of ids) {
      try {
        await CardDataUpdateService.rejectUpdate(id)
        rejected++
      } catch {
        // Skip silently — might already be processed
      }
    }

    return NextResponse.json({
      success: true,
      data: { rejected },
      message: `${rejected} update(s) rejected`,
    })
  } catch (error) {
    console.error('Reject update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reject updates' },
      { status: 500 }
    )
  }
}

// Export protected routes
export const POST = createAdminRoute(postCardUpdatesHandler)
export const GET = createAdminRoute(getCardUpdatesHandler)
export const PATCH = createAdminRoute(patchCardUpdatesHandler)
export const DELETE = createAdminRoute(deleteCardUpdatesHandler)
