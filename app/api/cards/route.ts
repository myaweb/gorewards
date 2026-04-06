import { NextResponse } from 'next/server'
import { CardService } from '@/lib/services/cardService'
import type { PointType } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cards
 * 
 * Get all active credit cards or filter by point type
 * Query params:
 * - pointType: Filter cards by point type (AEROPLAN, CASHBACK, etc.)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const pointType = searchParams.get('pointType') as PointType | null
    
    let cards
    if (pointType) {
      cards = await CardService.getCardsByPointType(pointType)
    } else {
      cards = await CardService.getAllCardsWithDetails()
    }
    
    return NextResponse.json({
      success: true,
      data: cards,
      count: cards.length
    })
  } catch (error) {
    console.error('Error fetching cards:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch cards'
    }, { status: 500 })
  }
}

