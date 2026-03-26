/**
 * Card Sync Script
 * 
 * Run this script to sync all cards from the master list to the database
 * 
 * Usage:
 *   npx tsx scripts/sync-cards.ts
 */

async function syncCards() {
  console.log('🚀 Starting card sync...\n')

  try {
    const response = await fetch('http://localhost:3000/api/admin/sync-cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (data.success) {
      console.log('✅ Sync completed successfully!\n')
      console.log('📊 Summary:')
      console.log(`   Cards in Master List: ${data.stats.totalInMasterList}`)
      console.log(`   Created: ${data.stats.created}`)
      console.log(`   Updated: ${data.stats.updated}`)
      console.log(`   Errors: ${data.stats.errors}`)
      console.log(`   Total in Database: ${data.stats.totalInDatabase}`)
      
      if (data.errors && data.errors.length > 0) {
        console.log('\n⚠️  Errors:')
        data.errors.forEach((error: string) => console.log(`   - ${error}`))
      }
    } else {
      console.error('❌ Sync failed:', data.error)
      if (data.details) {
        console.error('   Details:', data.details)
      }
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Failed to connect to sync endpoint:', error)
    console.error('\n💡 Make sure your development server is running:')
    console.error('   npm run dev')
    process.exit(1)
  }
}

syncCards()
