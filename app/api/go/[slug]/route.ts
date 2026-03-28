import { NextRequest, NextResponse } from 'next/server'

/**
 * Legacy redirect — now handled by /go/[slug] page with countdown UI.
 * Keep this for backwards compatibility with any existing links.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  return NextResponse.redirect(new URL(`/go/${params.slug}`, request.url))
}
