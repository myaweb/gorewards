/**
 * Fix Multiplier Format Script
 * 
 * Problem: Multipliers are stored as whole numbers (5) instead of decimals (0.05)
 * Solution: Divide all multipliers > 1 by 100 to convert to correct format
 * 
 * Run: npx tsx prisma/fix-multipliers.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixMultipliers() {
  console.log('🔧 Starting multiplier format fix...\n')
  
  try {
    // Get all multipliers that are in wrong format (> 1.0)
    const wrongFormatMultipliers = await prisma.cardMultiplier.findMany({
      where: {
        multiplierValue: {
          gt: 1.0
        }
      },
      include: {
        Card: {
          select: {
            name: true
          }
        }
      }
    })
    
    console.log(`Found ${wrongFormatMultipliers.length} multipliers in wrong format\n`)
    
    if (wrongFormatMultipliers.length === 0) {
      console.log('✅ All multipliers are already in correct format!')
      return
    }
    
    // Show what will be fixed
    console.log('📋 Multipliers to be fixed:')
    console.log('─'.repeat(80))
    wrongFormatMultipliers.forEach(m => {
      const oldValue = Number(m.multiplierValue)
      const newValue = oldValue / 100
      console.log(`${m.Card.name}`)
      console.log(`  Category: ${m.category}`)
      console.log(`  Current: ${oldValue} (wrong) → New: ${newValue.toFixed(2)} (correct)`)
      console.log(`  Description: ${m.description}`)
      console.log()
    })
    
    // Ask for confirmation
    console.log('⚠️  This will update the database. Continue? (y/n)')
    
    // For automated scripts, you can skip confirmation by setting env var
    const autoConfirm = process.env.AUTO_CONFIRM === 'true'
    
    if (!autoConfirm) {
      console.log('Set AUTO_CONFIRM=true to skip this prompt')
      console.log('Exiting without changes...')
      return
    }
    
    // Perform the fix
    console.log('\n🔄 Updating multipliers...\n')
    
    let updatedCount = 0
    for (const multiplier of wrongFormatMultipliers) {
      const oldValue = Number(multiplier.multiplierValue)
      const newValue = oldValue / 100
      
      await prisma.cardMultiplier.update({
        where: { id: multiplier.id },
        data: {
          multiplierValue: newValue,
          updatedAt: new Date()
        }
      })
      
      updatedCount++
      console.log(`✅ Updated ${multiplier.Card.name} - ${multiplier.category}: ${oldValue} → ${newValue.toFixed(2)}`)
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} multipliers!`)
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...')
    const remainingWrong = await prisma.cardMultiplier.count({
      where: {
        multiplierValue: {
          gt: 1.0
        }
      }
    })
    
    if (remainingWrong === 0) {
      console.log('✅ All multipliers are now in correct format!')
    } else {
      console.log(`⚠️  Warning: ${remainingWrong} multipliers still in wrong format`)
    }
    
    // Show statistics
    console.log('\n📊 Final Statistics:')
    const stats = await prisma.cardMultiplier.groupBy({
      by: ['category'],
      _avg: {
        multiplierValue: true
      },
      _max: {
        multiplierValue: true
      },
      _count: true
    })
    
    console.log('─'.repeat(80))
    stats.forEach(stat => {
      console.log(`${stat.category}:`)
      console.log(`  Count: ${stat._count}`)
      console.log(`  Average: ${Number(stat._avg.multiplierValue || 0).toFixed(4)}`)
      console.log(`  Maximum: ${Number(stat._max.multiplierValue || 0).toFixed(4)}`)
    })
    
  } catch (error) {
    console.error('❌ Error fixing multipliers:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixMultipliers()
  .then(() => {
    console.log('\n✨ Multiplier fix completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Multiplier fix failed:', error)
    process.exit(1)
  })
