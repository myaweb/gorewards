import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

// Helper to create slug from card name
function createSlug(cardName: string): string {
  return cardName
    .toLowerCase()
    .replace(/american express/gi, 'amex')
    .replace(/\s+card$/i, '')
    .replace(/\s+visa$/i, '-visa')
    .replace(/\s+mastercard$/i, '-mastercard')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://creditrich.net'
  
  // Fetch all active cards
  const cards = await prisma.card.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  // Generate individual card detail pages
  const cardPages: MetadataRoute.Sitemap = cards.map((card: { id: string; name: string }) => ({
    url: `${baseUrl}/cards/${createSlug(card.name)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  // Generate all unique comparison slugs (A-vs-B, no duplicates)
  const comparisonPages: MetadataRoute.Sitemap = []
  
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const slug1 = createSlug(cards[i].name)
      const slug2 = createSlug(cards[j].name)
      const comparisonSlug = `${slug1}-vs-${slug2}`
      
      comparisonPages.push({
        url: `${baseUrl}/compare/${comparisonSlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }

  // Static routes
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/users`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/donate`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    // All card detail pages
    ...cardPages,
    // All comparison pages
    ...comparisonPages,
  ]
}
