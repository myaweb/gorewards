/**
 * Cron Job: Update Card Data
 * 
 * Triggered daily by Vercel Cron (02:00 UTC).
 * Fetches card data from external sources, parses with AI,
 * diffs against database, and creates pending updates for admin review.
 * 
 * No data is written to the database automatically — admin approval required.
 */

import { NextRequest, NextResponse } from 'next/server'
import { cardUpdatePipeline } from '@/lib/services/cardUpdatePipeline'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60 // Allow up to 60s on Pro plan

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.warn('[update-cards] CRON_SECRET not configured')
    return false
  }

  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[update-cards] Pipeline started')
    const result = await cardUpdatePipeline.run()
    console.log('[update-cards] Pipeline completed', {
      success: result.success,
      parsed: result.totalCardsParsed,
      diffs: result.totalDiffsFound,
      pending: result.pendingUpdatesCreated,
      duration: `${result.durationMs}ms`,
    })

    return NextResponse.json({
      success: result.success,
      data: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[update-cards] Pipeline error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

