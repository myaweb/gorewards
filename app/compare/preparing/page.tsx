'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'

interface Card {
  id: string
  name: string
  bank: string
  imageUrl: string | null
}

export default function PreparingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [cards, setCards] = useState<Card[]>([])
  const [cardNames, setCardNames] = useState<string[]>(['Card A', 'Card B'])

  useEffect(() => {
    // Update page title
    document.title = 'Preparing Comparison | GoRewards'

    const targetUrl = searchParams.get('url')
    if (!targetUrl) {
      router.push('/compare')
      return
    }

    // Extract card names from URL
    const match = targetUrl.match(/\/compare\/(.+)/)
    if (match) {
      const slug = match[1]
      const slugs = slug.split('-vs-')
      const names = slugs.map(s => 
        s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      )
      setCardNames(names)
      
      // Fetch the actual cards being compared
      fetchSpecificCards(slugs)
    }

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100
        return prev + 2
      })
    }, 100)

    // Navigate after 5 seconds
    const navigationTimeout = setTimeout(() => {
      window.location.href = targetUrl
    }, 5000)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(navigationTimeout)
    }
  }, [searchParams, router])

  const fetchSpecificCards = async (slugs: string[]) => {
    try {
      // Fetch all cards and find the matching ones
      const response = await fetch('/api/cards')
      const data = await response.json()
      
      if (data.success && data.data) {
        const allCards = data.data
        const matchedCards: Card[] = []
        
        // Try to match cards by slug
        slugs.forEach(slug => {
          const card = allCards.find((c: Card) => 
            c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug
          )
          if (card) {
            matchedCards.push(card)
          }
        })
        
        // If we found matches, use them; otherwise use first 2 cards
        if (matchedCards.length > 0) {
          setCards(matchedCards)
        } else {
          setCards(allCards.slice(0, 2))
        }
      }
    } catch (error) {
      console.error('Error fetching cards:', error)
    }
  }

  const getCardImageUrl = (card: Card) => {
    if (card.imageUrl) return card.imageUrl
    return `https://placehold.co/400x252/1e293b/06b6d4?text=${encodeURIComponent(card.bank)}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0B0F] p-4">
      {/* Subtle background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Compact card */}
      <div className="w-full max-w-lg">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-sm">
          {/* Two Cards with VS */}
          <div className="flex justify-center items-center gap-4 mb-6">
            {/* Card 1 */}
            <div className="relative w-32 h-20 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              {cards[0] ? (
                <Image
                  src={getCardImageUrl(cards[0])}
                  alt={cards[0].name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20" />
              )}
            </div>

            {/* VS Badge */}
            <div className="px-4 py-2 bg-gradient-to-r from-primary to-cyan-400 rounded-full font-bold text-[#0A0B0F] text-sm shadow-lg">
              VS
            </div>

            {/* Card 2 */}
            <div className="relative w-32 h-20 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              {cards[1] ? (
                <Image
                  src={getCardImageUrl(cards[1])}
                  alt={cards[1].name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-purple-600/20" />
              )}
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-white mb-2">
              Preparing Comparison
            </h1>
            <p className="text-sm text-gray-400">
              Analyzing {cardNames[0]} vs {cardNames[1]}
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Processing</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
