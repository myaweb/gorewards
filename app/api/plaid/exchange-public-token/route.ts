import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { plaidClient } from '@/lib/plaid'
import { prisma } from '@/lib/prisma'
import { tokenEncryptor } from '@/lib/services/tokenEncryptor'
import { securityLogger } from '@/lib/services/securityLogger'
import { TokenType } from '@prisma/client'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { public_token, metadata } = await req.json()

    if (!public_token) {
      return NextResponse.json(
        { error: 'public_token is required' },
        { status: 400 }
      )
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    })

    const accessToken = exchangeResponse.data.access_token
    const itemId = exchangeResponse.data.item_id

    // Get institution name
    const institutionName = metadata?.institution?.name || 'Unknown Bank'

    // Find or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkUserId: user.id,
          email: user.emailAddresses[0].emailAddress,
        },
      })
    }

    // Store encrypted Plaid token
    await tokenEncryptor.storeEncryptedToken(
      dbUser.id,
      accessToken,
      TokenType.PLAID_ACCESS_TOKEN
    )

    // Save linked account (without storing plain text token)
    await prisma.linkedAccount.create({
      data: {
        userId: dbUser.id,
        plaidItemId: itemId,
        plaidAccessToken: '[ENCRYPTED]', // Placeholder to indicate encrypted storage
        institutionName,
      },
    })

    // Log analytics event: plaid_connected
    await securityLogger.logAuditEvent({
      userId: dbUser.id,
      action: 'PLAID_CONNECTED',
      resource: 'plaid_account',
      resourceId: itemId,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      endpoint: '/api/plaid/exchange-public-token',
      method: 'POST',
      correlationId: crypto.randomBytes(16).toString('hex'),
      severity: 'INFO',
      category: 'DATA_MODIFICATION',
      newData: { institution: institutionName }
    })

    // Return data for client-side analytics tracking
    return NextResponse.json({ 
      success: true,
      institution: {
        name: institutionName,
        id: metadata?.institution?.institution_id || itemId,
        accounts_count: metadata?.accounts?.length || 0
      }
    })
  } catch (error) {
    console.error('Error exchanging public token:', error)
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    )
  }
}

