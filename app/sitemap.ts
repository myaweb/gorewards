import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://GoRewards.net'
  
  // Fetch all active cards with real updatedAt for freshness signal
  const cards = await prisma.card.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, updatedAt: true },
    orderBy: { name: 'asc' },
  })

  // Most recently updated card date — used for category pages
  const latestCardUpdate = cards.reduce(
    (latest, c) => (c.updatedAt > latest ? c.updatedAt : latest),
    new Date(0)
  )

  // Card detail pages — each uses its own real updatedAt
  const cardPages: MetadataRoute.Sitemap = cards.map((card) => ({
    url: `${baseUrl}/cards/${card.slug}`,
    lastModified: card.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  // Top comparison pages — use latest card update as proxy
  const topCards = cards.slice(0, 20)
  const comparisonPages: MetadataRoute.Sitemap = []
  
  for (let i = 0; i < topCards.length; i++) {
    for (let j = i + 1; j < topCards.length; j++) {
      comparisonPages.push({
        url: `${baseUrl}/compare/${topCards[i].slug}-vs-${topCards[j].slug}`,
        lastModified: latestCardUpdate,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }

  // Programmatic category pages — all reflect latest card update
  const categoryPages: MetadataRoute.Sitemap = [
    ...["groceries","gas","dining","travel","bills","entertainment","shopping"].map(cat => ({
      url: `${baseUrl}/cards/best-for/${cat}`,
      lastModified: latestCardUpdate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...["aeroplan","scene-plus","membership-rewards","cashback","avion","air-miles","aventura","marriott-bonvoy"].map(prog => ({
      url: `${baseUrl}/cards/by-program/${prog}`,
      lastModified: latestCardUpdate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...["td","rbc","amex","cibc","scotiabank","bmo"].map(bank => ({
      url: `${baseUrl}/cards/by-bank/${bank}`,
      lastModified: latestCardUpdate,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    {
      url: `${baseUrl}/cards/no-annual-fee`,
      lastModified: latestCardUpdate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ]

  // Static routes with realistic lastModified dates
  const staticPagesDate = new Date('2026-03-15') // Last major update to static pages
  const pricingDate = new Date('2026-02-01') // Last pricing change
  
  return [
    {
      url: baseUrl,
      lastModified: latestCardUpdate, // Homepage reflects latest card data
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/cards`,
      lastModified: latestCardUpdate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: pricingDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: latestCardUpdate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/donate`,
      lastModified: staticPagesDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: staticPagesDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: staticPagesDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // All card detail pages
    ...cardPages,
    // All comparison pages (limited to top 10 cards to avoid spam)
    ...comparisonPages.slice(0, 45), // 10 cards = 45 combinations (10*9/2)
    // Programmatic category pages
    ...categoryPages,
  ]
}

