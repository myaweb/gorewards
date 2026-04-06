import { PrismaClient, SpendingCategory } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Categorize cards intelligently:
 * - STUDENT: Low/no annual fee, entry-level cards
 * - BUSINESS: Premium cards suitable for business spending
 * - TRAVEL: Cards with strong travel benefits and multipliers
 */

async function categorizeCards() {
  console.log('🏷️  Categorizing cards...\n')

  const cards = await prisma.card.findMany({
    where: { isActive: true },
    include: {
      multipliers: { where: { isActive: true } }
    }
  })

  let studentCount = 0
  let businessCount = 0
  let travelCount = 0

  for (const card of cards) {
    const name = card.name.toLowerCase()
    const annualFee = Number(card.annualFee)

    // === STUDENT CATEGORY ===
    // Low/no annual fee cards suitable for students
    const isStudentFriendly = 
      annualFee === 0 || // No annual fee
      annualFee <= 50 || // Very low fee
      name.includes('student') ||
      name.includes('ion') || // RBC ION - student friendly
      name.includes('cash back') && annualFee === 0 ||
      name.includes('pc mastercard') && !name.includes('world elite') ||
      name.includes('tangerine') ||
      name.includes('simplii')

    if (isStudentFriendly) {
      const existing = card.multipliers.find(m => m.category === SpendingCategory.STUDENT)
      if (!existing) {
        await prisma.cardMultiplier.create({
          data: {
            cardId: card.id,
            category: SpendingCategory.STUDENT,
            multiplierValue: 0.01,
            description: 'Student-friendly card',
            isActive: true
          }
        })
        studentCount++
        console.log(`🎓 STUDENT: ${card.name}`)
      }
    }

    // === BUSINESS CATEGORY ===
    // Premium cards with high limits, good for business spending
    const isBusinessSuitable = 
      name.includes('business') ||
      name.includes('world elite') ||
      name.includes('infinite privilege') ||
      name.includes('platinum') ||
      annualFee >= 120 // High annual fee cards

    if (isBusinessSuitable) {
      const existing = card.multipliers.find(m => m.category === SpendingCategory.BUSINESS)
      if (!existing) {
        await prisma.cardMultiplier.create({
          data: {
            cardId: card.id,
            category: SpendingCategory.BUSINESS,
            multiplierValue: 0.015,
            description: 'Suitable for business spending',
            isActive: true
          }
        })
        businessCount++
        console.log(`💼 BUSINESS: ${card.name}`)
      }
    }

    // === TRAVEL CATEGORY ===
    // Already has TRAVEL multiplier, but let's boost travel-focused cards
    const travelMult = card.multipliers.find(m => m.category === SpendingCategory.TRAVEL)
    const isTravelCard = 
      name.includes('travel') ||
      name.includes('aeroplan') ||
      name.includes('avion') ||
      name.includes('aventura') ||
      name.includes('passport') ||
      name.includes('platinum') ||
      name.includes('privilege') ||
      name.includes('marriott') ||
      name.includes('bonvoy')

    if (isTravelCard && travelMult && Number(travelMult.multiplierValue) < 0.03) {
      // Boost travel multiplier for travel-focused cards
      await prisma.cardMultiplier.update({
        where: { id: travelMult.id },
        data: {
          multiplierValue: 0.05, // 5% for travel cards
          description: 'Premium travel rewards'
        }
      })
      travelCount++
      console.log(`✈️  TRAVEL (boosted): ${card.name}`)
    }
  }

  console.log(`\n📊 Categorization completed:`)
  console.log(`   • Student-friendly: ${studentCount} cards`)
  console.log(`   • Business-suitable: ${businessCount} cards`)
  console.log(`   • Travel-boosted: ${travelCount} cards`)
}

async function main() {
  try {
    await categorizeCards()
    
    const studentCount = await prisma.cardMultiplier.count({
      where: { category: SpendingCategory.STUDENT, isActive: true }
    })
    const businessCount = await prisma.cardMultiplier.count({
      where: { category: SpendingCategory.BUSINESS, isActive: true }
    })
    const travelCount = await prisma.cardMultiplier.count({
      where: { category: SpendingCategory.TRAVEL, isActive: true }
    })
    
    console.log(`\n📈 Final database counts:`)
    console.log(`   • STUDENT multipliers: ${studentCount}`)
    console.log(`   • BUSINESS multipliers: ${businessCount}`)
    console.log(`   • TRAVEL multipliers: ${travelCount}`)
    
    console.log('\n🎉 Cards categorized successfully!')
  } catch (error) {
    console.error('❌ Error during categorization:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
