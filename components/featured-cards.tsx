"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { CardImage } from "@/components/card-image"
import { ArrowRight, ArrowLeft, Gift, Star } from "lucide-react"

interface FeaturedCard {
  id: string
  name: string
  bank: string
  network: string
  annualFee: number
  slug: string
  imageUrl: string | null
  bonuses: { pointType: string; bonusPoints: number; estimatedValue: number | null }[]
  multipliers: { category: string; multiplierValue: number }[]
}

export function FeaturedCards() {
  const [cards, setCards] = useState<FeaturedCard[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/cards")
      .then(r => r.ok ? r.json() : { data: [] })
      .then(data => {
        const all: FeaturedCard[] = data.data || []
        // Sort by welcome bonus estimated value, take top 6
        const sorted = all
          .filter(c => c.bonuses.length > 0 && c.bonuses[0].estimatedValue)
          .sort((a, b) => (b.bonuses[0]?.estimatedValue || 0) - (a.bonuses[0]?.estimatedValue || 0))
          .slice(0, 6)
        setCards(sorted)
      })
      .catch(() => {})
  }, [])

  if (!cards.length) return null

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    const cardWidth = scrollRef.current.offsetWidth / 4 + 16
    scrollRef.current.scrollBy({ left: dir === "right" ? cardWidth : -cardWidth, behavior: "smooth" })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-3.5 w-3.5 text-cyan-500 fill-cyan-500" />
            <span className="text-xs font-bold text-cyan-500 uppercase tracking-wider">Top Picks</span>
          </div>
          <h2 className="text-lg font-bold text-white">Best Welcome Bonuses Right Now</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scroll("left")}
              className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-gray-500 hover:border-cyan-500/40 hover:text-cyan-400 transition-all"
              aria-label="Previous"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-gray-500 hover:border-cyan-500/40 hover:text-cyan-400 transition-all"
              aria-label="Next"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <Link
            href="/cards"
            className="text-xs font-semibold text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            See all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {cards.map((card) => {
          const bonus = card.bonuses[0]
          const bestMult = card.multipliers.length
            ? Math.max(...card.multipliers.map(m => m.multiplierValue))
            : 0

          return (
            <Link
              key={card.id}
              href={`/cards/${card.slug}`}
              className="group flex-shrink-0 w-[85vw] sm:w-[calc(25%-10px)] flex flex-col bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all"
              style={{ scrollSnapAlign: "start" }}
            >
              {/* Card visual */}
              <div className="p-3 pb-0">
                <CardImage
                  name={card.name}
                  bank={card.bank}
                  network={card.network}
                  imageUrl={card.imageUrl}
                  className="w-full h-28 rounded-lg"
                />
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col gap-2 flex-1">
                <div>
                  <p className="text-[10px] text-gray-500">{card.bank}</p>
                  <h3 className="text-xs font-semibold text-white leading-snug group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {card.name}
                  </h3>
                </div>

                {/* Welcome bonus */}
                {bonus?.estimatedValue && (
                  <div className="flex items-center gap-1.5 bg-cyan-500/8 border border-cyan-500/15 rounded-lg px-2.5 py-1.5">
                    <Gift className="h-3 w-3 text-cyan-500 flex-shrink-0" />
                    <div>
                      <p className="text-[9px] text-gray-500 leading-none">Welcome Bonus</p>
                      <p className="text-sm font-bold text-cyan-400 leading-tight">${bonus.estimatedValue}</p>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                  <div>
                    <p className="text-[9px] text-gray-600">Annual Fee</p>
                    <p className="text-xs font-semibold text-white">
                      {card.annualFee === 0 ? "Free" : `$${card.annualFee}`}
                    </p>
                  </div>
                  {bestMult > 0 && (
                    <div className="text-right">
                      <p className="text-[9px] text-gray-600">Best Rate</p>
                      <p className="text-xs font-semibold text-cyan-400">{(bestMult * 100).toFixed(0)}x</p>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

