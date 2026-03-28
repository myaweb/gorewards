import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const updates = await prisma.updateRecord.findMany({
    where: { status: 'PENDING' },
    include: { card: { select: { name: true } }, updateBatch: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  console.log(`Total pending: ${updates.length}`)

  const grouped: Record<string, number> = {}
  updates.forEach(u => {
    grouped[u.card.name] = (grouped[u.card.name] || 0) + 1
  })

  console.log(`Unique cards: ${Object.keys(grouped).length}`)
  console.log('\nDuplicates:')
  Object.entries(grouped)
    .filter(([, c]) => c > 1)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, count]) => console.log(`  ${count}x ${name}`))

  // Show batch breakdown
  const batches: Record<string, number> = {}
  updates.forEach(u => {
    batches[u.updateBatch.name] = (batches[u.updateBatch.name] || 0) + 1
  })
  console.log('\nBatches:')
  Object.entries(batches).forEach(([name, count]) => console.log(`  ${count} updates in "${name}"`))

  await prisma.$disconnect()
}

main()
