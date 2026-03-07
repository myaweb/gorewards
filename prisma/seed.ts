import { PrismaClient, CardNetwork, SpendingCategory, PointType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // 1. American Express Cobalt Card
  const amexCobalt = await prisma.card.upsert({
    where: { id: 'amex-cobalt-001' },
    update: {},
    create: {
      id: 'amex-cobalt-001',
      name: 'American Express Cobalt Card',
      bank: 'American Express',
      network: CardNetwork.AMEX,
      annualFee: 156, // $12.99/month
      currency: 'CAD',
      baseImageUrl: '/cards/amex-cobalt.png',
      isActive: true,
    },
  })

  await prisma.cardBonus.upsert({
    where: { id: 'bonus-amex-cobalt-001' },
    update: {},
    create: {
      id: 'bonus-amex-cobalt-001',
      cardId: amexCobalt.id,
      bonusPoints: 30000,
      pointType: PointType.MEMBERSHIP_REWARDS,
      minimumSpendAmount: 3000,
      spendPeriodMonths: 3,
      description: 'Earn 30,000 Membership Rewards points after spending $3,000 in the first 3 months',
      isActive: true,
    },
  })

  await prisma.cardMultiplier.createMany({
    data: [
      {
        id: 'mult-amex-cobalt-grocery',
        cardId: amexCobalt.id,
        category: SpendingCategory.GROCERY,
        multiplierValue: 5,
        description: '5x points on eligible grocery purchases',
        isActive: true,
      },
      {
        id: 'mult-amex-cobalt-dining',
        cardId: amexCobalt.id,
        category: SpendingCategory.DINING,
        multiplierValue: 5,
        description: '5x points on eligible dining and food delivery',
        isActive: true,
      },
      {
        id: 'mult-amex-cobalt-gas',
        cardId: amexCobalt.id,
        category: SpendingCategory.GAS,
        multiplierValue: 2,
        description: '2x points on gas and transit',
        isActive: true,
      },
      {
        id: 'mult-amex-cobalt-travel',
        cardId: amexCobalt.id,
        category: SpendingCategory.TRAVEL,
        multiplierValue: 3,
        description: '3x points on eligible travel purchases',
        isActive: true,
      },
      {
        id: 'mult-amex-cobalt-recurring',
        cardId: amexCobalt.id,
        category: SpendingCategory.RECURRING,
        multiplierValue: 1,
        description: '1x points on recurring bills',
        isActive: true,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seeded: American Express Cobalt Card')

  // 2. TD Aeroplan Visa Infinite
  const tdAeroplan = await prisma.card.upsert({
    where: { id: 'td-aeroplan-001' },
    update: {},
    create: {
      id: 'td-aeroplan-001',
      name: 'TD Aeroplan Visa Infinite',
      bank: 'TD Bank',
      network: CardNetwork.VISA,
      annualFee: 139,
      currency: 'CAD',
      baseImageUrl: '/cards/td-aeroplan.png',
      isActive: true,
    },
  })

  await prisma.cardBonus.upsert({
    where: { id: 'bonus-td-aeroplan-001' },
    update: {},
    create: {
      id: 'bonus-td-aeroplan-001',
      cardId: tdAeroplan.id,
      bonusPoints: 50000,
      pointType: PointType.AEROPLAN,
      minimumSpendAmount: 3000,
      spendPeriodMonths: 3,
      description: 'Earn 50,000 Aeroplan points after spending $3,000 in the first 3 months',
      isActive: true,
    },
  })

  await prisma.cardMultiplier.createMany({
    data: [
      {
        id: 'mult-td-aeroplan-grocery',
        cardId: tdAeroplan.id,
        category: SpendingCategory.GROCERY,
        multiplierValue: 3,
        description: '3x Aeroplan points on grocery purchases',
        isActive: true,
      },
      {
        id: 'mult-td-aeroplan-dining',
        cardId: tdAeroplan.id,
        category: SpendingCategory.DINING,
        multiplierValue: 2,
        description: '2x Aeroplan points on dining',
        isActive: true,
      },
      {
        id: 'mult-td-aeroplan-gas',
        cardId: tdAeroplan.id,
        category: SpendingCategory.GAS,
        multiplierValue: 2,
        description: '2x Aeroplan points on gas',
        isActive: true,
      },
      {
        id: 'mult-td-aeroplan-travel',
        cardId: tdAeroplan.id,
        category: SpendingCategory.TRAVEL,
        multiplierValue: 2,
        description: '2x Aeroplan points on Air Canada purchases',
        isActive: true,
      },
      {
        id: 'mult-td-aeroplan-recurring',
        cardId: tdAeroplan.id,
        category: SpendingCategory.RECURRING,
        multiplierValue: 1.5,
        description: '1.5x Aeroplan points on recurring bills',
        isActive: true,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seeded: TD Aeroplan Visa Infinite')

  // 3. Scotiabank Momentum Visa Infinite
  const scotiaMomentum = await prisma.card.upsert({
    where: { id: 'scotia-momentum-001' },
    update: {},
    create: {
      id: 'scotia-momentum-001',
      name: 'Scotiabank Momentum Visa Infinite',
      bank: 'Scotiabank',
      network: CardNetwork.VISA,
      annualFee: 120,
      currency: 'CAD',
      baseImageUrl: '/cards/scotia-momentum.png',
      isActive: true,
    },
  })

  await prisma.cardBonus.upsert({
    where: { id: 'bonus-scotia-momentum-001' },
    update: {},
    create: {
      id: 'bonus-scotia-momentum-001',
      cardId: scotiaMomentum.id,
      bonusPoints: 10000, // $100 cashback = 10,000 points
      pointType: PointType.CASHBACK,
      minimumSpendAmount: 3000,
      spendPeriodMonths: 3,
      description: 'Earn $100 cashback after spending $3,000 in the first 3 months',
      isActive: true,
    },
  })

  await prisma.cardMultiplier.createMany({
    data: [
      {
        id: 'mult-scotia-momentum-grocery',
        cardId: scotiaMomentum.id,
        category: SpendingCategory.GROCERY,
        multiplierValue: 4, // 4% cashback
        description: '4% cashback on grocery and recurring bill payments',
        isActive: true,
      },
      {
        id: 'mult-scotia-momentum-dining',
        cardId: scotiaMomentum.id,
        category: SpendingCategory.DINING,
        multiplierValue: 2, // 2% cashback
        description: '2% cashback on dining and entertainment',
        isActive: true,
      },
      {
        id: 'mult-scotia-momentum-gas',
        cardId: scotiaMomentum.id,
        category: SpendingCategory.GAS,
        multiplierValue: 4, // 4% cashback
        description: '4% cashback on gas and daily transit',
        isActive: true,
      },
      {
        id: 'mult-scotia-momentum-travel',
        cardId: scotiaMomentum.id,
        category: SpendingCategory.TRAVEL,
        multiplierValue: 1, // 1% cashback
        description: '1% cashback on all other purchases',
        isActive: true,
      },
      {
        id: 'mult-scotia-momentum-recurring',
        cardId: scotiaMomentum.id,
        category: SpendingCategory.RECURRING,
        multiplierValue: 4, // 4% cashback
        description: '4% cashback on recurring bill payments',
        isActive: true,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seeded: Scotiabank Momentum Visa Infinite')

  // 4. CIBC Aeroplan Visa
  const cibcAeroplan = await prisma.card.upsert({
    where: { id: 'cibc-aeroplan-001' },
    update: {},
    create: {
      id: 'cibc-aeroplan-001',
      name: 'CIBC Aeroplan Visa',
      bank: 'CIBC',
      network: CardNetwork.VISA,
      annualFee: 0,
      currency: 'CAD',
      baseImageUrl: '/cards/cibc-aeroplan.png',
      isActive: true,
    },
  })

  await prisma.cardBonus.upsert({
    where: { id: 'bonus-cibc-aeroplan-001' },
    update: {},
    create: {
      id: 'bonus-cibc-aeroplan-001',
      cardId: cibcAeroplan.id,
      bonusPoints: 20000,
      pointType: PointType.AEROPLAN,
      minimumSpendAmount: 1500,
      spendPeriodMonths: 3,
      description: 'Earn 20,000 Aeroplan points after spending $1,500 in the first 3 months',
      isActive: true,
    },
  })

  await prisma.cardMultiplier.createMany({
    data: [
      {
        id: 'mult-cibc-aeroplan-grocery',
        cardId: cibcAeroplan.id,
        category: SpendingCategory.GROCERY,
        multiplierValue: 2,
        description: '2x Aeroplan points on grocery purchases',
        isActive: true,
      },
      {
        id: 'mult-cibc-aeroplan-dining',
        cardId: cibcAeroplan.id,
        category: SpendingCategory.DINING,
        multiplierValue: 1.5,
        description: '1.5x Aeroplan points on dining',
        isActive: true,
      },
      {
        id: 'mult-cibc-aeroplan-gas',
        cardId: cibcAeroplan.id,
        category: SpendingCategory.GAS,
        multiplierValue: 1.5,
        description: '1.5x Aeroplan points on gas',
        isActive: true,
      },
      {
        id: 'mult-cibc-aeroplan-travel',
        cardId: cibcAeroplan.id,
        category: SpendingCategory.TRAVEL,
        multiplierValue: 1.5,
        description: '1.5x Aeroplan points on Air Canada purchases',
        isActive: true,
      },
      {
        id: 'mult-cibc-aeroplan-recurring',
        cardId: cibcAeroplan.id,
        category: SpendingCategory.RECURRING,
        multiplierValue: 1,
        description: '1x Aeroplan points on recurring bills',
        isActive: true,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seeded: CIBC Aeroplan Visa')

  // 5. Scotiabank Passport Visa Infinite
  const scotiaPassport = await prisma.card.upsert({
    where: { id: 'scotia-passport-001' },
    update: {},
    create: {
      id: 'scotia-passport-001',
      name: 'Scotiabank Passport Visa Infinite',
      bank: 'Scotiabank',
      network: CardNetwork.VISA,
      annualFee: 139,
      currency: 'CAD',
      baseImageUrl: '/cards/scotia-passport.png',
      isActive: true,
    },
  })

  await prisma.cardBonus.upsert({
    where: { id: 'bonus-scotia-passport-001' },
    update: {},
    create: {
      id: 'bonus-scotia-passport-001',
      cardId: scotiaPassport.id,
      bonusPoints: 40000,
      pointType: PointType.SCENE_PLUS,
      minimumSpendAmount: 4000,
      spendPeriodMonths: 4,
      description: 'Earn 40,000 Scene+ points after spending $4,000 in the first 4 months',
      isActive: true,
    },
  })

  await prisma.cardMultiplier.createMany({
    data: [
      {
        id: 'mult-scotia-passport-grocery',
        cardId: scotiaPassport.id,
        category: SpendingCategory.GROCERY,
        multiplierValue: 2,
        description: '2x Scene+ points on grocery purchases',
        isActive: true,
      },
      {
        id: 'mult-scotia-passport-dining',
        cardId: scotiaPassport.id,
        category: SpendingCategory.DINING,
        multiplierValue: 3,
        description: '3x Scene+ points on dining and entertainment',
        isActive: true,
      },
      {
        id: 'mult-scotia-passport-gas',
        cardId: scotiaPassport.id,
        category: SpendingCategory.GAS,
        multiplierValue: 2,
        description: '2x Scene+ points on gas and daily transit',
        isActive: true,
      },
      {
        id: 'mult-scotia-passport-travel',
        cardId: scotiaPassport.id,
        category: SpendingCategory.TRAVEL,
        multiplierValue: 2,
        description: '2x Scene+ points on travel purchases',
        isActive: true,
      },
      {
        id: 'mult-scotia-passport-recurring',
        cardId: scotiaPassport.id,
        category: SpendingCategory.RECURRING,
        multiplierValue: 1,
        description: '1x Scene+ points on recurring bills',
        isActive: true,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seeded: Scotiabank Passport Visa Infinite')

  // Create sample goals
  const goals = [
    {
      id: 'goal-tokyo-flight',
      name: 'Round-trip Flight to Tokyo',
      requiredPoints: 75000,
      pointType: PointType.AEROPLAN,
      description: 'Business class flight to Tokyo via Aeroplan',
      estimatedValue: 3000,
      isActive: true,
    },
    {
      id: 'goal-europe-flight',
      name: 'Round-trip Flight to Europe',
      requiredPoints: 60000,
      pointType: PointType.AEROPLAN,
      description: 'Economy flight to Europe via Aeroplan',
      estimatedValue: 1200,
      isActive: true,
    },
    {
      id: 'goal-caribbean-flight',
      name: 'Round-trip Flight to Caribbean',
      requiredPoints: 35000,
      pointType: PointType.AEROPLAN,
      description: 'Economy flight to Caribbean via Aeroplan',
      estimatedValue: 700,
      isActive: true,
    },
    {
      id: 'goal-cashback-1000',
      name: '$1,000 Cashback',
      requiredPoints: 100000,
      pointType: PointType.CASHBACK,
      description: 'Redeem for $1,000 statement credit',
      estimatedValue: 1000,
      isActive: true,
    },
    {
      id: 'goal-hotel-stay',
      name: 'Luxury Hotel Stay',
      requiredPoints: 50000,
      pointType: PointType.SCENE_PLUS,
      description: '5-night stay at premium hotel',
      estimatedValue: 1500,
      isActive: true,
    },
  ]

  for (const goal of goals) {
    await prisma.goal.upsert({
      where: { id: goal.id },
      update: {},
      create: goal,
    })
  }

  console.log('✅ Seeded: Sample Goals')

  // Summary
  const cardCount = await prisma.card.count()
  const bonusCount = await prisma.cardBonus.count()
  const multiplierCount = await prisma.cardMultiplier.count()
  const goalCount = await prisma.goal.count()

  console.log('\n📊 Seed Summary:')
  console.log(`   Cards: ${cardCount}`)
  console.log(`   Bonuses: ${bonusCount}`)
  console.log(`   Multipliers: ${multiplierCount}`)
  console.log(`   Goals: ${goalCount}`)
  console.log('\n✨ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
