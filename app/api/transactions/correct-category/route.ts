/**
 * Transaction Category Correction API
 * 
 * STEP 8 FIX: Allows users to correct transaction categories
 * Feeds corrections back into the confidence scoring system
 */

import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { confidenceScorer } from '@/lib/services/confidenceScorer'
import { securityLogger } from '@/lib/services/securityLogger'
import { SpendingCategory } from '@prisma/client'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const correlationId = crypto.randomBytes(16).toString('hex')

  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      transactionId, 
      originalCategory, 
      correctedCategory,
      merchantName,
      amount
    } = await req.json()

    // Validate input
    if (!transactionId || !originalCategory || !correctedCategory || !merchantName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find user in database
    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update transaction category in database
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        category: correctedCategory as SpendingCategory,
        categoryConfidence: 1.0, // User correction = 100% confidence
        correctedByUser: true,
        correctedAt: new Date()
      }
    })

    // Feed correction into confidence scorer for learning
    await confidenceScorer.learnFromCorrection({
      transactionId,
      originalCategory,
      correctedCategory,
      merchantName,
      amount,
      userId: dbUser.id
    })

    // Log correction
    await securityLogger.logAuditEvent({
      userId: dbUser.id,
      action: 'CATEGORY_CORRECTION',
      resource: 'transaction',
      resourceId: transactionId,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      endpoint: '/api/transactions/correct-category',
      method: 'POST',
      correlationId,
      severity: 'INFO',
      category: 'DATA_MODIFICATION',
      oldData: { category: originalCategory },
      newData: { category: correctedCategory }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    securityLogger.logError('Category correction error', error as Error, {
      correlationId
    })

    return NextResponse.json(
      { error: 'Failed to correct category' },
      { status: 500 }
    )
  }
}

