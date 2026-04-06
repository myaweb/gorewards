import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { canadianCardsMasterList, getCardImage, type CardData } from '@/app/lib/cardData'
import { CardNetwork, SpendingCategory, PointType } from '@prisma/client'
import { createAdminRoute } from '@/lib/middleware/adminAuth'

// Force TypeScript to reload Prisma types

// Helper functions from seed.ts
function getCardNetwork(network: string): CardNetwork {
  switch (network.toUpperCase()) {
    case 'VISA':
      return CardNetwork.VISA
    case 'MASTERCARD':
      return CardNetwork.MASTERCARD
    case 'AMEX':
      return CardNetwork.AMEX
    case 'DISCOVER':
      return CardNetwork.DISCOVER
    default:
      return CardNetwork.VISA
  }
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function determinePointType(cardData: CardData): PointType {
  const name = cardData.name.toLowerCase()
  const bank = cardData.bank.toLowerCase()
  
  if (name.includes('aeroplan')) return PointType.AEROPLAN
  if (name.includes('avion')) return PointType.AVION
  if (name.includes('scene')) return PointType.SCENE_PLUS
  if (name.includes('air miles')) return PointType.AIR_MILES
  if (name.includes('aventura')) return PointType.AVENTURA
  if (name.includes('marriott') || name.includes('bonvoy')) return PointType.MARRIOTT_BONVOY
  if (name.includes('hilton')) return PointType.HILTON_HONORS
  if (name.includes('cash') || name.includes('cashback')) return PointType.CASHBACK
  if (bank.includes('american express') || cardData.network === 'Amex') return PointType.MEMBERSHIP_REWARDS
  
  if (bank.includes('td') || bank.includes('cibc')) return PointType.AEROPLAN
  if (bank.includes('rbc')) return PointType.AVION
  if (bank.includes('scotia')) return PointType.SCENE_PLUS
  if (bank.includes('bmo')) return PointType.CASHBACK
  
  return PointType.CASHBACK
}

function estimateBonusPoints(welcomeBonusValue: number, pointType: PointType): number {
  const conversionRates = {
    [PointType.AEROPLAN]: 100,
    [PointType.MEMBERSHIP_REWARDS]: 100,
    [PointType.AVION]: 100,
    [PointType.SCENE_PLUS]: 100,
    [PointType.AIR_MILES]: 10,
    [PointType.AVENTURA]: 100,
    [PointType.MARRIOTT_BONVOY]: 80,
    [PointType.HILTON_HONORS]: 200,
    [PointType.CASHBACK]: 100,
    [PointType.AMERICAN_EXPRESS_POINTS]: 100,
    [PointType.OTHER]: 100
  }
  
  return Math.round(welcomeBonusValue * conversionRates[pointType])
}

function estimateMinimumSpend(bonusPoints: number): number {
  const bonusValueInDollars = bonusPoints / 100
  return Math.round(bonusValueInDollars * 3)
}

/**
 * POST /api/admin/sync-cards
 * 
 * Automated Sync Bot to populate and update the Card database with normalized structure
 * 
 * This endpoint:
 * 1. Reads the master card data from cardData.ts
 * 2. Creates/updates cards with bonuses and multipliers in normalized tables
 * 3. Uses card name as the unique identifier
 * 4. Returns a summary of the sync operation
 * 
 * Security: Protected with admin authentication
 */
async function syncCardsHandler(request: NextRequest, context: { userId: string }) {
  try {
    console.log('🤖 Starting Card Sync Bot...')
    console.log(`📊 Found ${canadianCardsMasterList.length} cards in master list`)

    let createdCount = 0
    let updatedCount = 0
    const errors: string[] = []

    // Loop through each card in the master list
    for (const cardData of canadianCardsMasterList) {
      try {
        const slug = createSlug(cardData.name)
        const network = getCardNetwork(cardData.network)
        const pointType = determinePointType(cardData)
        const bonusPoints = estimateBonusPoints(cardData.welcomeBonusValue, pointType)
        const minimumSpend = estimateMinimumSpend(bonusPoints)
        
        // Check if card exists
        const existingCard = await prisma.card.findUnique({
          where: { name: cardData.name }
        })
        
        let card
        if (existingCard) {
          // Update existing card
          card = await prisma.card.update({
            where: { id: existingCard.id },
            data: {
              slug,
              bank: cardData.bank,
              network,
              annualFee: cardData.annualFee,
              baseRewardRate: cardData.baseRewardRate,
              imageUrl: getCardImage(cardData),
              affiliateLink: cardData.applyLink,
              updatedAt: new Date()
            }
          })
          updatedCount++
          console.log(`🔄 Updated: ${cardData.name}`)
        } else {
          // Create new card
          card = await prisma.card.create({
            data: {
              name: cardData.name,
              slug,
              bank: cardData.bank,
              network,
              annualFee: cardData.annualFee,
              baseRewardRate: cardData.baseRewardRate,
              imageUrl: getCardImage(cardData),
              affiliateLink: cardData.applyLink,
              isActive: true
            }
          })
          createdCount++
          console.log(`✅ Created: ${cardData.name}`)
        }
        
        // Create or update welcome bonus
        if (cardData.welcomeBonusValue > 0) {
          const existingBonus = await prisma.cardBonus.findFirst({
            where: {
              cardId: card.id,
              pointType: pointType,
              isActive: true
            }
          })
          
          if (existingBonus) {
            await prisma.cardBonus.update({
              where: { id: existingBonus.id },
              data: {
                bonusPoints,
                minimumSpendAmount: minimumSpend,
                spendPeriodMonths: 3,
                estimatedValue: cardData.welcomeBonusValue,
                description: `Welcome bonus: ${bonusPoints.toLocaleString()} ${pointType.replace('_', ' ')} points`,
                updatedAt: new Date()
              }
            })
          } else {
            await prisma.cardBonus.create({
              data: {
                cardId: card.id,
                bonusPoints,
                pointType,
                minimumSpendAmount: minimumSpend,
                spendPeriodMonths: 3,
                estimatedValue: cardData.welcomeBonusValue,
                description: `Welcome bonus: ${bonusPoints.toLocaleString()} ${pointType.replace('_', ' ')} points`,
                isActive: true
              }
            })
          }
        }
        
        // Create multipliers
        const multipliers = [
          { category: SpendingCategory.GROCERY, value: cardData.groceryMultiplier },
          { category: SpendingCategory.GAS, value: cardData.gasMultiplier },
          { category: SpendingCategory.DINING, value: cardData.diningMultiplier },
          { category: SpendingCategory.RECURRING, value: cardData.billsMultiplier }
        ]
        
        for (const multiplier of multipliers) {
          if (multiplier.value > 0) {
            const existingMultiplier = await prisma.cardMultiplier.findFirst({
              where: {
                cardId: card.id,
                category: multiplier.category,
                isActive: true
              }
            })
            
            if (existingMultiplier) {
              await prisma.cardMultiplier.update({
                where: { id: existingMultiplier.id },
                data: {
                  multiplierValue: multiplier.value,
                  description: `${multiplier.value}x points on ${multiplier.category.toLowerCase()}`,
                  updatedAt: new Date()
                }
              })
            } else {
              await prisma.cardMultiplier.create({
                data: {
                  cardId: card.id,
                  category: multiplier.category,
                  multiplierValue: multiplier.value,
                  description: `${multiplier.value}x points on ${multiplier.category.toLowerCase()}`,
                  isActive: true
                }
              })
            }
          }
        }
        
      } catch (error) {
        const errorMessage = `Failed to sync ${cardData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMessage)
        console.error(`❌ ${errorMessage}`)
      }
    }

    // Get final count from database
    const totalCardsInDb = await prisma.card.count()
    const totalBonuses = await prisma.cardBonus.count()
    const totalMultipliers = await prisma.cardMultiplier.count()

    const summary = {
      success: true,
      message: 'Card sync completed successfully',
      stats: {
        totalInMasterList: canadianCardsMasterList.length,
        created: createdCount,
        updated: updatedCount,
        errors: errors.length,
        totalInDatabase: totalCardsInDb,
        totalBonuses,
        totalMultipliers,
      },
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    }

    console.log('\n📊 Sync Summary:')
    console.log(`   Total in Master List: ${summary.stats.totalInMasterList}`)
    console.log(`   Created: ${summary.stats.created}`)
    console.log(`   Updated: ${summary.stats.updated}`)
    console.log(`   Errors: ${summary.stats.errors}`)
    console.log(`   Total in Database: ${summary.stats.totalInDatabase}`)
    console.log(`   Total Bonuses: ${summary.stats.totalBonuses}`)
    console.log(`   Total Multipliers: ${summary.stats.totalMultipliers}`)
    console.log('✨ Sync Bot completed!\n')

    return NextResponse.json(summary, { status: 200 })
  } catch (error) {
    console.error('❌ Sync Bot failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync cards',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/sync-cards
 * 
 * Returns information about the sync bot without running it
 * 
 * Security: Protected with admin authentication
 */
async function getSyncStatusHandler(request: NextRequest, context: { userId: string }) {
  try {
    const totalCardsInDb = await prisma.card.count()
    const totalBonuses = await prisma.cardBonus.count()
    const totalMultipliers = await prisma.cardMultiplier.count()
    const totalInMasterList = canadianCardsMasterList.length

    return NextResponse.json({
      message: 'Card Sync Bot Status',
      stats: {
        totalInMasterList,
        totalInDatabase: totalCardsInDb,
        totalBonuses,
        totalMultipliers,
        needsSync: totalInMasterList !== totalCardsInDb,
      },
      info: {
        endpoint: '/api/admin/sync-cards',
        method: 'POST',
        description: 'Syncs all cards from the master list to the normalized database structure',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to get sync status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Export protected routes
export const POST = createAdminRoute(syncCardsHandler)
export const GET = createAdminRoute(getSyncStatusHandler)

