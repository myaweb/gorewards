import { NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET() {
  try {
    const res = await fetch(
      'https://blog.creditrich.net/wp-json/wp/v2/posts?per_page=5&_embed',
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return NextResponse.json([])
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json([])
  }
}

