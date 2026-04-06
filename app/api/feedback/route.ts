/**
 * Beta Feedback API
 * 
 * STEP 8 FIX: Collects user feedback during beta phase
 */

import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { securityLogger } from '@/lib/services/securityLogger'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const correlationId = crypto.randomBytes(16).toString('hex')

  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { feedback, source } = await req.json()

    if (!feedback || typeof feedback !== 'string') {
      return NextResponse.json(
        { error: 'Feedback is required' },
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

    // Store feedback
    await prisma.betaFeedback.create({
      data: {
        userId: dbUser.id,
        feedback: feedback.trim(),
        source: source || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown'
      }
    })

    // Log feedback submission
    await securityLogger.logAuditEvent({
      userId: dbUser.id,
      action: 'BETA_FEEDBACK_SUBMITTED',
      resource: 'feedback',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      endpoint: '/api/feedback',
      method: 'POST',
      correlationId,
      severity: 'INFO',
      category: 'DATA_MODIFICATION'
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    securityLogger.logError('Feedback submission error', error as Error, {
      correlationId
    })

    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

