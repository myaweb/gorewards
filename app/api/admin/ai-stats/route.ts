import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAIUsageStats, getRecentErrors } from '@/lib/utils/aiMonitoring'

/**
 * GET /api/admin/ai-stats
 * 
 * Get AI usage statistics (admin only)
 */
export async function GET() {
  try {
    const { userId } = auth()
    
    // Check if user is admin
    const adminClerkId = process.env.ADMIN_CLERK_ID
    if (!userId || userId !== adminClerkId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const stats = getAIUsageStats()
    const recentErrors = getRecentErrors(5)

    return NextResponse.json({
      success: true,
      stats,
      recentErrors,
    })
  } catch (error) {
    console.error('AI stats error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch AI stats'
    }, { status: 500 })
  }
}
