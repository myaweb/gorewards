import { PrismaClient, CardNetwork, SpendingCategory, PointType } from '@prisma/client'
import { canadianCardsMasterList, type CardData } from '../app/lib/cardData'

const prisma = new PrismaClient()

// Helper function to convert network string to enum
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
      return CardNetwork.VISA // Default fallback
  }
}

// Helper function to create URL-friendly slug
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

// Helper function to determine point type from card name and bank
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
  
  // Default based on bank
  if (bank.includes('td') || bank.includes('cibc')) return PointType.AEROPLAN
  if (bank.includes('rbc')) return PointType.AVION
  if (bank.includes('scotia')) return PointType.SCENE_PLUS
  if (bank.includes('bmo')) return PointType.CASHBACK
  
  return PointType.CASHBACK // Default fallback
}

// Helper function to estimate bonus points from welcome bonus value
function estimateBonusPoints(welcomeBonusValue: number, pointType: PointType): number {
  // Rough conversion rates (points per dollar value)
  const conversionRates = {
    [PointType.AEROPLAN]: 100, // ~1 cent per point
    [PointType.MEMBERSHIP_REWARDS]: 100,
    [PointType.AVION]: 100,
    [PointType.SCENE_PLUS]: 100,
    [PointType.AIR_MILES]: 10, // ~10 cents per mile
    [PointType.AVENTURA]: 100,
    [PointType.MARRIOTT_BONVOY]: 80,
    [PointType.HILTON_HONORS]: 200,
    [PointType.CASHBACK]: 100,
    [PointType.AMERICAN_EXPRESS_POINTS]: 100,
    [PointType.OTHER]: 100
  }
  
  return Math.round(welcomeBonusValue * conversionRates[pointType])
}

// Helper function to estimate minimum spend for bonus
function estimateMinimumSpend(bonusPoints: number): number {
  // Typical minimum spend is 2-5x the bonus value in dollars
  const bonusValueInDollars = bonusPoints / 100 // Rough estimate
  return Math.round(bonusValueInDollars * 3) // 3x multiplier
}

async function seedCards() {
  console.log('🌱 Starting card seeding process...')
  
  let createdCount = 0
  let updatedCount = 0
  
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
            imageUrl: cardData.image || "/images/cards/placeholder-card.svg",
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
            imageUrl: cardData.image || "/images/cards/placeholder-card.svg",
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
      console.error(`❌ Error processing ${cardData.name}:`, error)
    }
  }
  
  console.log(`\n📊 Seeding completed:`)
  console.log(`   • Created: ${createdCount} cards`)
  console.log(`   • Updated: ${updatedCount} cards`)
  console.log(`   • Total: ${createdCount + updatedCount} cards processed`)
}

async function seedGoals() {
  console.log('\n🎯 Seeding goals...')
  
  const goals = [
    {
      name: "Tokyo Flight",
      requiredPoints: 75000,
      pointType: PointType.AEROPLAN,
      description: "Round-trip flight to Tokyo in economy class",
      estimatedValue: 1200
    },
    {
      name: "Europe Flight", 
      requiredPoints: 60000,
      pointType: PointType.AEROPLAN,
      description: "Round-trip flight to Europe in economy class",
      estimatedValue: 800
    },
    {
      name: "Caribbean Flight",
      requiredPoints: 35000,
      pointType: PointType.AEROPLAN,
      description: "Round-trip flight to Caribbean in economy class",
      estimatedValue: 500
    },
    {
      name: "Luxury Hotel Stay",
      requiredPoints: 50000,
      pointType: PointType.MARRIOTT_BONVOY,
      description: "5-night stay at luxury Marriott property",
      estimatedValue: 750
    },
    {
      name: "$1,000 Cashback",
      requiredPoints: 100000,
      pointType: PointType.CASHBACK,
      description: "$1,000 in cashback rewards",
      estimatedValue: 1000
    }
  ]
  
  let createdGoals = 0
  let updatedGoals = 0
  
  for (const goal of goals) {
    try {
      const existingGoal = await prisma.goal.findFirst({
        where: { name: goal.name }
      })
      
      if (existingGoal) {
        await prisma.goal.update({
          where: { id: existingGoal.id },
          data: {
            requiredPoints: goal.requiredPoints,
            pointType: goal.pointType,
            description: goal.description,
            estimatedValue: goal.estimatedValue,
            updatedAt: new Date()
          }
        })
        updatedGoals++
        console.log(`🔄 Updated goal: ${goal.name}`)
      } else {
        await prisma.goal.create({
          data: goal
        })
        createdGoals++
        console.log(`✅ Created goal: ${goal.name}`)
      }
    } catch (error) {
      console.error(`❌ Error processing goal ${goal.name}:`, error)
    }
  }
  
  console.log(`📊 Goals seeding completed:`)
  console.log(`   • Created: ${createdGoals} goals`)
  console.log(`   • Updated: ${updatedGoals} goals`)
}

async function main() {
  try {
    console.log('🚀 Starting database seed...\n')
    
    await seedCards()
    await seedGoals()
    
    // Get final statistics
    const cardCount = await prisma.card.count()
    const bonusCount = await prisma.cardBonus.count()
    const multiplierCount = await prisma.cardMultiplier.count()
    const goalCount = await prisma.goal.count()
    
    console.log('\n📈 Final database statistics:')
    console.log(`   • Cards: ${cardCount}`)
    console.log(`   • Bonuses: ${bonusCount}`)
    console.log(`   • Multipliers: ${multiplierCount}`)
    console.log(`   • Goals: ${goalCount}`)
    
    console.log('\n🎉 Database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()