'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Card {
  id: string
  name: string
  bank: string
  imageUrl: string | null
}

export default function AnalyzePage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [dots, setDots] = useState('')
  const [cards, setCards] = useState<Card[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Update page title
    document.title = 'Analyzing Your Cards | GoRewards'
    
    // Fetch popular cards for carousel
    fetchPopularCards()
    
    // Get form data from sessionStorage
    const storedData = sessionStorage.getItem('calculatorFormData')
    if (!storedData) {
      router.push('/')
      return
    }

    // Start calculation immediately
    const formData = JSON.parse(storedData)
    performCalculation(formData)

    // Animated dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100
        return prev + 2
      })
    }, 100)

    return () => {
      clearInterval(dotsInterval)
      clearInterval(progressInterval)
    }
  }, [router])

  // Card carousel effect
  useEffect(() => {
    if (cards.length === 0) return

    const cardInterval = setInterval(() => {
      setCurrentCardIndex(prev => (prev + 1) % cards.length)
    }, 800)

    return () => clearInterval(cardInterval)
  }, [cards])

  const fetchPopularCards = async () => {
    try {
      const response = await fetch('/api/cards?limit=10')
      const data = await response.json()
      
      if (data.success && data.data) {
        setCards(data.data.slice(0, 10))
      }
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const performCalculation = async (formData: any) => {
    try {
      // Use enhanced recommendation engine
      const enhancedResponse = await fetch('/api/recommend/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spending: {
            grocery: formData.grocery,
            gas: formData.gas,
            dining: formData.dining,
            bills: formData.bills,
          },
          creditScore: 'GOOD',
          preferredPointTypes: [formData.pointType],
          prioritizeSignupBonus: true,
          timeHorizon: 'LONG_TERM',
          goal: {
            name: formData.goalName,
            requiredPoints: formData.requiredPoints,
            pointType: formData.pointType,
          },
        }),
      })

      if (!enhancedResponse.ok) {
        throw new Error('Failed to get recommendations')
      }

      const enhancedData = await enhancedResponse.json()

      // Get cards data
      const cardsResponse = await fetch(`/api/cards?pointType=${formData.pointType}`)
      const cardsData = await cardsResponse.json()

      // Store results in sessionStorage
      sessionStorage.setItem('calculationResults', JSON.stringify({
        enhancedData,
        cardsData,
        formData
      }))

      // Wait for 5 seconds then redirect
      setTimeout(() => {
        router.push('/?showResults=true')
      }, 5000)

    } catch (error) {
      console.error('Error during calculation:', error)
      // Redirect to home on error
      setTimeout(() => {
        router.push('/')
      }, 5000)
    }
  }

  const getCardImageUrl = (card: Card) => {
    if (card.imageUrl) return card.imageUrl
    // Fallback to placeholder with bank name
    return `https://placehold.co/400x252/1e293b/06b6d4?text=${encodeURIComponent(card.bank)}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0B0F] p-4">
      {/* Subtle background glow */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Compact card */}
      <div className="w-full max-w-md">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm">
          {/* Card Carousel */}
          <div className="flex justify-center mb-6">
            <div className="relative w-56 h-36">
              {cards.length > 0 ? (
                // Show card carousel
                <div className="relative w-full h-full overflow-hidden">
                  {cards.map((card, index) => (
                    <div
                      key={card.id}
                      className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                        index === currentCardIndex
                          ? 'opacity-100 scale-100 z-10'
                          : 'opacity-0 scale-95 z-0'
                      }`}
                    >
                      <div className="relative w-full h-full rounded-xl overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                        <Image
                          src={getCardImageUrl(card)}
                          alt={card.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Show Sparkles icon while loading
                <div className="flex items-center justify-center w-full h-full">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-cyan-400 rounded-full blur-xl opacity-50 animate-pulse" />
                    <div className="relative w-16 h-16 bg-gradient-to-r from-primary to-cyan-400 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#0A0B0F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              Finding Your Best Card{dots}
            </h1>
            <p className="text-sm text-gray-400">
              Analyzing 38+ Canadian credit cards
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
              <span>Comparing cards</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
