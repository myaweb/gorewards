import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/clear-verdict?slug=xxx
 * 
 * Clear a specific comparison verdict to regenerate it
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({
        success: false,
        error: 'Missing slug parameter'
      }, { status: 400 })
    }

    // Delete the verdict
    await prisma.cardComparison.deleteMany({
      where: { slug }
    })

    return NextResponse.json({
      success: true,
      message: `Verdict for ${slug} deleted successfully`
    })
  } catch (error) {
    console.error('Clear verdict error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to clear verdict',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * GET /api/clear-verdict?slug=xxx
 * 
 * Same as DELETE but accessible via browser
 */
export async function GET(request: NextRequest) {
  return DELETE(request)
}
