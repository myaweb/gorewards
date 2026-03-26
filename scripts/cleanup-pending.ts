import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Keep only the latest batch, delete older pending ones
  const latestBatch = await prisma.updateBatch.findFirst({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  })

  if (!latestBatch) {
    console.log('No pending batches found')
    await prisma.$disconnect()
    return
  }

  console.log(`Keeping latest batch: ${latestBatch.name} (${latestBatch.id})`)

  // Delete old pending update records (not in latest batch)
  const deleted = await prisma.updateRecord.deleteMany({
    where: {
      status: 'PENDING',
      batchId: { not: latestBatch.id },
    },
  })

  console.log(`Deleted ${deleted.count} old pending updates`)

  // Delete empty old batches
  const oldBatches = await prisma.updateBatch.deleteMany({
    where: {
      status: 'PENDING',
      id: { not: latestBatch.id },
    },
  })

  console.log(`Deleted ${oldBatches.count} old batches`)

  // Verify
  const remaining = await prisma.updateRecord.count({ where: { status: 'PENDING' } })
  console.log(`Remaining pending updates: ${remaining}`)

  await prisma.$disconnect()
}

main()
