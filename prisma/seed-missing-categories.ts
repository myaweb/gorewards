import { PrismaClient, SpendingCategory } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Seed missing categories: TRAVEL, BUSINESS, STUDENT
 * 
 * Logic:
 * - TRAVEL: Travel-focused cards get high multipliers (2-5x), others get base rate
 * - BUSINESS: Business cards get 1.5-2x, others get base rate
 * - STUDENT: Student cards get 1x, others get base rate
 */

async function seedMissingCategories() {
  console.log('🌱 Starting to seed missing categories (TRAVEL, BUSINESS, STUDENT)...\n')

  const cards = await prisma.card.findMany({
    where: { isActive: true },
    include: {
      multipliers: { where: { isActive: true } }
    }
  })

  let createdCount = 0

  for (const card of cards) {
    const name = card.name.toLowerCase()
    const bank = card.bank.toLowerCase()

    // Determine TRAVEL multiplier
    let travelMultiplier = Number(card.baseRewardRate)
    if (
      name.includes('travel') ||
      name.includes('aeroplan') ||
      name.includes('avion') ||
      name.includes('aventura') ||
      name.includes('passport') ||
      name.includes('world elite') ||
      name.includes('platinum') ||
      name.includes('privilege')
    ) {
      travelMultiplier = 0.05 // 5x for travel cards
    } else if (name.includes('gold') || name.includes('rewards')) {
      travelMultiplier = 0.02 // 2x for mid-tier cards
    }

    // Determine BUSINESS multiplier
    let businessMultiplier = Number(card.baseRewardRate)
    if (name.includes('business') || name.includes('corporate')) {
      businessMultiplier = 0.02 // 2x for business cards
    }

    // Determine STUDENT multiplier
    let studentMultiplier = Number(card.baseRewardRate)
    if (name.includes('student') || name.includes('no fee') || Number(card.annualFee) === 0) {
      studentMultiplier = 0.01 // 1x for student/no-fee cards
    }

    // Check if multipliers already exist
    const existingTravel = card.multipliers.find(m => m.category === SpendingCategory.TRAVEL)
    const existingBusiness = card.multipliers.find(m => m.category === SpendingCategory.BUSINESS)
    const existingStudent = card.multipliers.find(m => m.category === SpendingCategory.STUDENT)

    // Create TRAVEL multiplier if not exists
    if (!existingTravel) {
      await prisma.cardMultiplier.create({
        data: {
          cardId: card.id,
          category: SpendingCategory.TRAVEL,
          multiplierValue: travelMultiplier,
          description: `${(travelMultiplier * 100).toFixed(0)}% back on travel`,
          isActive: true
        }
      })
      createdCount++
    }

    // Create BUSINESS multiplier if not exists
    if (!existingBusiness) {
      await prisma.cardMultiplier.create({
        data: {
          cardId: card.id,
          category: SpendingCategory.BUSINESS,
          multiplierValue: businessMultiplier,
          description: `${(businessMultiplier * 100).toFixed(0)}% back on business`,
          isActive: true
        }
      })
      createdCount++
    }

    // Create STUDENT multiplier if not exists
    if (!existingStudent) {
      await prisma.cardMultiplier.create({
        data: {
          cardId: card.id,
          category: SpendingCategory.STUDENT,
          multiplierValue: studentMultiplier,
          description: `${(studentMultiplier * 100).toFixed(0)}% back for students`,
          isActive: true
        }
      })
      createdCount++
    }

    console.log(`✅ Processed: ${card.name}`)
  }

  console.log(`\n📊 Seeding completed:`)
  console.log(`   • Created: ${createdCount} multipliers`)
  console.log(`   • Cards processed: ${cards.length}`)
}

async function main() {
  try {
    await seedMissingCategories()
    
    const multiplierCount = await prisma.cardMultiplier.count()
    console.log(`\n📈 Total multipliers in database: ${multiplierCount}`)
    
    console.log('\n🎉 Missing categories seeded successfully!')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
