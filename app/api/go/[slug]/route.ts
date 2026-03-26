import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * The Money Router - Affiliate Link Click Tracker
 * 
 * This route tracks affiliate link clicks before redirecting users to banks.
 * It increments a clickCount for analytics and then redirects to the actual affiliate URL.
 * 
 * Usage: /api/go/[slug] where slug is the card name converted to URL-friendly format
 * Example: /api/go/amex-cobalt-card
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Convert slug back to searchable format
    const searchTerm = slug.replace(/-/g, ' ')

    // Find the card by name (case-insensitive partial match)
    const card = await prisma.card.findFirst({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
        isActive: true,
      },
    })

    // If card not found or no affiliate link, redirect to compare page
    if (!card || !card.affiliateLink) {
      console.warn(`Card not found or no affiliate link for slug: ${slug}`)
      return NextResponse.redirect(new URL('/compare', request.url))
    }

    // Increment click count for analytics (fire and forget - don't block redirect)
    prisma.card.update({
      where: { id: card.id },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    }).catch(error => {
      console.error('Error incrementing click count:', error)
      // Don't fail the redirect if analytics update fails
    })

    // Redirect to the affiliate URL
    return NextResponse.redirect(card.affiliateLink)
  } catch (error) {
    console.error('Error in affiliate router:', error)
    // On error, redirect to compare page as fallback
    return NextResponse.redirect(new URL('/compare', request.url))
  }
}
