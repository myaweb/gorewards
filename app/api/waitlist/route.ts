/**
 * Waitlist API
 * 
 * Handles closed beta waitlist signups
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import crypto from 'crypto'

// Admin email whitelist
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []

async function isAdmin(): Promise<boolean> {
  try {
    const user = await currentUser()
    if (!user) return false
    
    const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase()
    if (!userEmail) return false
    
    return ADMIN_EMAILS.includes(userEmail)
  } catch (error) {
    console.error('Admin auth check failed:', error)
    return false
  }
}

export async function POST(req: NextRequest) {
  const correlationId = crypto.randomBytes(16).toString('hex')

  try {
    const { email, name, source } = await req.json()

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await prisma.waitlist.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 409 }
      )
    }

    // Create waitlist entry
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        source: source || 'homepage',
        status: 'pending',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist',
      data: {
        id: waitlistEntry.id,
        email: waitlistEntry.email
      }
    })

  } catch (error) {
    console.error('Waitlist submission error:', error, {
      correlationId
    })

    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Admin authentication required
    const adminAccess = await isAdmin()
    
    if (!adminAccess) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const status = searchParams.get('status') || undefined

    const entries = await prisma.waitlist.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        source: true,
        status: true,
        createdAt: true
      }
    })

    const total = await prisma.waitlist.count({
      where: status ? { status } : undefined
    })

    return NextResponse.json({
      success: true,
      data: entries,
      total
    })

  } catch (error) {
    console.error('Waitlist fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    )
  }
}

