import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/auth/adminAuth'
import { PostHog } from 'posthog-node'

// Initialize PostHog server client
const posthogClient = process.env.NEXT_PUBLIC_POSTHOG_KEY && 
  process.env.NEXT_PUBLIC_POSTHOG_KEY !== 'phc_placeholder' &&
  !process.env.NEXT_PUBLIC_POSTHOG_KEY.includes('placeholder')
  ? new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    })
  : null

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin authorization
    const adminAccess = await isAdmin()
    if (!adminAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // If PostHog is not configured, return empty stats
    if (!posthogClient) {
      return NextResponse.json({
        success: true,
        configured: false,
        message: 'PostHog is not configured',
      })
    }

    // Note: PostHog Node SDK doesn't provide analytics query API
    // You need to use PostHog's REST API or view data in PostHog dashboard
    // This endpoint confirms PostHog is configured
    
    return NextResponse.json({
      success: true,
      configured: true,
      posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      message: 'PostHog is configured. View detailed analytics in PostHog dashboard.',
    })
  } catch (error) {
    console.error('Error fetching AI stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics stats' },
      { status: 500 }
    )
  }
}
