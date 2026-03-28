"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { CardImage } from "@/components/card-image"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal, X, ArrowRight } from "lucide-react"

interface Card {
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

interface CardsListProps {
  cards: Card[]
}

const NETWORKS = ["All", "VISA", "MASTERCARD", "AMEX"]
const FEE_FILTERS = [
  { label: "All", min: 0, max: Infinity },
  { label: "No Fee", min: 0, max: 0 },
  { label: "Under $150", min: 1, max: 149 },
  { label: "$150+", min: 150, max: Infinity },
]

const POINT_TYPES = ["All", "AEROPLAN", "CASHBACK", "MEMBERSHIP_REWARDS", "SCENE_PLUS", "AVION", "MARRIOTT_BONVOY"]

function getBestMultiplier(multipliers: Card["multipliers"]) {
  if (!multipliers.length) return 0
  return Math.max(...multipliers.map((m) => m.multiplierValue))
}

export function CardsList({ cards }: CardsListProps) {
  const [search, setSearch] = useState("")
  const [network, setNetwork] = useState("All")
  const [feeFilter, setFeeFilter] = useState(0) // index into FEE_FILTERS
  const [pointType, setPointType] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    const fee = FEE_FILTERS[feeFilter]
    return cards.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
          !c.bank.toLowerCase().includes(search.toLowerCase())) return false
      if (network !== "All" && c.network !== network) return false
      if (c.annualFee < fee.min || c.annualFee > fee.max) return false
      if (pointType !== "All" && !c.bonuses.some((b) => b.pointType === pointType)) return false
      return true
    })
  }, [cards, search, network, feeFilter, pointType])

  const activeFilters = (network !== "All" ? 1 : 0) + (feeFilter !== 0 ? 1 : 0) + (pointType !== "All" ? 1 : 0)

  function resetFilters() {
    setNetwork("All")
    setFeeFilter(0)
    setPointType("All")
    setSearch("")
  }

  return (
    <div>
      {/* Search + Filter bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cards or banks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 focus:border-primary/50"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
            showFilters || activeFilters > 0
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilters > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-[#090A0F] text-xs font-bold flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filter panels */}
      {showFilters && (
        <div className="glass-premium border border-white/10 rounded-xl p-4 mb-6 space-y-4">
          {/* Network */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Network</p>
            <div className="flex flex-wrap gap-2">
              {NETWORKS.map((n) => (
                <button
                  key={n}
                  onClick={() => setNetwork(n)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    network === n
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Annual Fee */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Annual Fee</p>
            <div className="flex flex-wrap gap-2">
              {FEE_FILTERS.map((f, i) => (
                <button
                  key={f.label}
                  onClick={() => setFeeFilter(i)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    feeFilter === i
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rewards Program */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Rewards Program</p>
            <div className="flex flex-wrap gap-2">
              {POINT_TYPES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPointType(p)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    pointType === p
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {p === "All" ? "All" : p.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {activeFilters > 0 && (
            <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
              <X className="h-3 w-3" /> Reset all filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        {filtered.length} card{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((card) => {
          const topBonus = card.bonuses[0]
          const bestMult = getBestMultiplier(card.multipliers)

          return (
            <Link
              key={card.id}
              href={`/cards/${card.slug}`}
              className="glass-premium border border-white/5 hover:border-primary/30 rounded-2xl p-4 flex flex-col gap-4 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] group"
            >
              {/* Card visual */}
              <CardImage
                name={card.name}
                bank={card.bank}
                network={card.network}
                imageUrl={card.imageUrl}
                className="w-full h-36 rounded-xl"
              />

              {/* Info */}
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">{card.bank}</p>
                  <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                    {card.name}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px] border-white/10 text-gray-400">
                    {card.network}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] ${card.annualFee === 0 ? "border-emerald-500/30 text-emerald-400" : "border-white/10 text-gray-400"}`}>
                    {card.annualFee === 0 ? "No Fee" : `$${card.annualFee}/yr`}
                  </Badge>
                  {topBonus && (
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                      {topBonus.pointType.replace(/_/g, " ")}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <div>
                  <p className="text-[10px] text-muted-foreground">Welcome Bonus</p>
                  <p className="text-sm font-bold text-primary">
                    {topBonus?.estimatedValue ? `$${topBonus.estimatedValue}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Best Rate</p>
                  <p className="text-sm font-bold text-primary">
                    {bestMult > 0 ? `${(bestMult * 100).toFixed(0)}x` : "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                View details <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-2">No cards match your filters</p>
          <button onClick={resetFilters} className="text-primary hover:underline text-sm">
            Reset filters
          </button>
        </div>
      )}
    </div>
  )
}
