import { PrismaClient, SpendingCategory } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Fix STUDENT and BUSINESS categories
 * - Only keep STUDENT multipliers for actual student cards
 * - Only keep BUSINESS multipliers for actual business cards
 */

async function fixCategories() {
  console.log('🔧 Fixing STUDENT and BUSINESS categories...\n')

  const cards = await prisma.card.findMany({
    where: { isActive: true },
    include: {
      multipliers: { where: { isActive: true } }
    }
  })

  let deletedCount = 0

  for (const card of cards) {
    const name = card.name.toLowerCase()

    // Check if it's a real student card
    const isStudentCard = name.includes('student')
    
    // Check if it's a real business card
    const isBusinessCard = name.includes('business') || name.includes('corporate')

    // Delete STUDENT multiplier if not a student card
    if (!isStudentCard) {
      const studentMult = card.multipliers.find(m => m.category === SpendingCategory.STUDENT)
      if (studentMult) {
        await prisma.cardMultiplier.delete({
          where: { id: studentMult.id }
        })
        deletedCount++
        console.log(`❌ Deleted STUDENT from: ${card.name}`)
      }
    }

    // Delete BUSINESS multiplier if not a business card
    if (!isBusinessCard) {
      const businessMult = card.multipliers.find(m => m.category === SpendingCategory.BUSINESS)
      if (businessMult) {
        await prisma.cardMultiplier.delete({
          where: { id: businessMult.id }
        })
        deletedCount++
        console.log(`❌ Deleted BUSINESS from: ${card.name}`)
      }
    }

    // Keep if it's the right type
    if (isStudentCard) {
      console.log(`✅ Kept STUDENT: ${card.name}`)
    }
    if (isBusinessCard) {
      console.log(`✅ Kept BUSINESS: ${card.name}`)
    }
  }

  console.log(`\n📊 Cleanup completed:`)
  console.log(`   • Deleted: ${deletedCount} multipliers`)
}

async function main() {
  try {
    await fixCategories()
    
    const studentCount = await prisma.cardMultiplier.count({
      where: { category: SpendingCategory.STUDENT, isActive: true }
    })
    const businessCount = await prisma.cardMultiplier.count({
      where: { category: SpendingCategory.BUSINESS, isActive: true }
    })
    
    console.log(`\n📈 Final counts:`)
    console.log(`   • STUDENT multipliers: ${studentCount}`)
    console.log(`   • BUSINESS multipliers: ${businessCount}`)
    
    console.log('\n🎉 Categories fixed successfully!')
  } catch (error) {
    console.error('❌ Error during fix:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
