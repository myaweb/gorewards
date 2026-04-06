import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { RedirectCountdown } from '@/components/redirect-countdown'
import { Shield } from 'lucide-react'

interface GoPageProps {
  params: { slug: string }
}

export default async function GoPage({ params }: GoPageProps) {
  const searchTerm = params.slug.replace(/-/g, ' ')

  const card = await prisma.card.findFirst({
    where: {
      name: { contains: searchTerm, mode: 'insensitive' },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      bank: true,
      imageUrl: true,
      affiliateLink: true,
    },
  })

  if (!card || !card.affiliateLink) {
    redirect('/compare')
  }

  // Track click (fire and forget)
  prisma.card.update({
    where: { id: card.id },
    data: { clickCount: { increment: 1 } },
  }).catch(() => {})

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090A0F]">
      <div className="container mx-auto px-4 max-w-lg text-center">

        {/* Card image */}
        {card.imageUrl && (
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-cyan-400/30 rounded-2xl blur-2xl" />
              <img
                src={card.imageUrl}
                alt={card.name}
                className="relative w-64 h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        )}

        {/* Card name */}
        <h1 className="text-2xl font-bold mb-1">{card.name}</h1>
        <p className="text-muted-foreground mb-8">{card.bank}</p>

        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium border border-primary/20 mb-8 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          You're being redirected to the official bank website
        </div>

        {/* Countdown */}
        <RedirectCountdown url={card.affiliateLink} seconds={5} />

        <p className="text-xs text-muted-foreground mt-6">
          GoRewards may earn a commission if you apply through this link. This does not affect our recommendations.
        </p>
      </div>
    </div>
  )
}
