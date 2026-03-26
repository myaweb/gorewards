/**
 * Card Mapping API
 * 
 * STEP 8 FIX: Maps Plaid accounts to user credit cards
 */

import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { securityLogger } from '@/lib/services/securityLogger'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
      include: {
        cardMappings: {
          include: {
            linkedAccount: true,
            userCard: {
              include: {
                card: true
              }
            }
          }
        }
      }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const mappings = dbUser.cardMappings.map(mapping => ({
      accountId: mapping.linkedAccountId,
      cardId: mapping.userCardId
    }))

    return NextResponse.json({ mappings })

  } catch (error) {
    console.error('Get mappings error:', error)
    return NextResponse.json(
      { error: 'Failed to get mappings' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const correlationId = crypto.randomBytes(16).toString('hex')

  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mappings } = await req.json()

    if (!Array.isArray(mappings)) {
      return NextResponse.json(
        { error: 'Mappings must be an array' },
        { status: 400 }
      )
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete existing mappings
    await prisma.cardMapping.deleteMany({
      where: { userId: dbUser.id }
    })

    // Create new mappings
    await prisma.cardMapping.createMany({
      data: mappings.map((mapping: any) => ({
        userId: dbUser.id,
        linkedAccountId: mapping.accountId,
        userCardId: mapping.cardId
      }))
    })

    // Log mapping update
    await securityLogger.logAuditEvent({
      userId: dbUser.id,
      action: 'CARD_MAPPINGS_UPDATED',
      resource: 'card_mappings',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      endpoint: '/api/profile/card-mappings',
      method: 'POST',
      correlationId,
      severity: 'INFO',
      category: 'DATA_MODIFICATION',
      newData: { mappings_count: mappings.length }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    securityLogger.logError('Card mapping error', error as Error, {
      correlationId
    })

    return NextResponse.json(
      { error: 'Failed to save mappings' },
      { status: 500 }
    )
  }
}
