import Link from "next/link"
import { ChevronRight, Home, Gift, DollarSign, TrendingUp, ArrowRight, ChevronDown } from "lucide-react"
import { CardImage } from "@/components/card-image"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_BOTTOM_CONTENT } from "@/lib/config/categoryContent"

interface CardData {
  id: string
  name: string
  slug: string
  bank: string
  network: string
  annualFee: any
  imageUrl: string | null
  affiliateLink: string | null
  categoryMultiplier: number
  bonusValue?: number
  bonuses: Array<{
    pointType: string
    bonusPoints: number
    estimatedValue: any
    minimumSpendAmount?: any
    spendPeriodMonths?: number
  }>
  multipliers: Array<{
    category: string
    multiplierValue: any
  }>
}

interface Breadcrumb {
  name: string
  url: string
}

interface SeoContent {
  intro: string
  howWeRanked: string
  expertTip: string
}

interface CardCategoryPageProps {
  title: string
  description: string
  cards: CardData[]
  breadcrumbs: Breadcrumb[]
  filterLabel: string
  highlightCategory?: string
  showBonusValue?: boolean
  seoContent?: SeoContent | null
  categoryKey?: string
}

function getBestMultiplier(multipliers: CardData["multipliers"], category?: string) {
  if (!multipliers.length) return null
  if (category) {
    const m = multipliers.find((m) => m.category === category)
    if (m) return { category: m.category, value: Number(m.multiplierValue) }
  }
  const best = multipliers.reduce((max, curr) =>
    Number(curr.multiplierValue) > Number(max.multiplierValue) ? curr : max
  )
  return { category: best.category, value: Number(best.multiplierValue) }
}

export function CardCategoryPage({
  title,
  description,
  cards,
  breadcrumbs,
  filterLabel,
  highlightCategory,
  showBonusValue,
  seoContent,
  categoryKey,
}: CardCategoryPageProps) {
  const bottomContent = categoryKey ? CATEGORY_BOTTOM_CONTENT[categoryKey] : null
  return (
    <div className="min-h-screen pt-2 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8 text-muted-foreground flex-wrap">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.url} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
              {i === breadcrumbs.length - 1 ? (
                <span className="text-white font-medium">{crumb.name}</span>
              ) : (
                <Link href={crumb.url} className="flex items-center gap-1 hover:text-primary transition-colors">
                  {i === 0 && <Home className="h-4 w-4" />}
                  {i > 0 && crumb.name}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="text-white">{title.split(" ").slice(0, 3).join(" ")} </span>
            <span className="text-cyan-500">{title.split(" ").slice(3).join(" ")}</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">{description}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {cards.length} card{cards.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* AI-generated intro content */}
        {seoContent && (
          <div className="mb-10 space-y-4 max-w-3xl">
            <p className="text-gray-300 leading-relaxed">{seoContent.intro}</p>
            <div className="flex items-start gap-3 p-4 glass rounded-xl border border-primary/10">
              <span className="text-primary text-lg flex-shrink-0">💡</span>
              <p className="text-sm text-gray-300 leading-relaxed"><span className="font-semibold text-white">Expert tip: </span>{seoContent.expertTip}</p>
            </div>
            <p className="text-xs text-muted-foreground">{seoContent.howWeRanked}</p>
          </div>
        )}

        {/* Cards */}
        {cards.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-4">No cards found for this filter.</p>
            <Link href="/cards" className="text-primary hover:underline">Browse all cards</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card, index) => {
              const bonus = card.bonuses[0]
              const bestMult = getBestMultiplier(card.multipliers, highlightCategory)
              const annualFee = Number(card.annualFee)
              const bonusVal = card.bonusValue ?? Number(bonus?.estimatedValue || 0)

              return (
                <div
                  key={card.id}
                  className="glass-premium border border-white/5 hover:border-primary/30 rounded-2xl p-5 md:p-6 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.08)]"
                >
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {/* Rank */}
                    <div className="hidden sm:flex w-8 h-8 rounded-full bg-primary/10 items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>

                    {/* Card image */}
                    <div className="w-full sm:w-32 flex-shrink-0">
                      <CardImage
                        name={card.name}
                        bank={card.bank}
                        network={card.network}
                        imageUrl={card.imageUrl}
                        className="w-full h-20 sm:h-20 rounded-xl"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-xs text-muted-foreground">{card.bank}</p>
                          <h2 className="text-lg font-bold text-white leading-tight">{card.name}</h2>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px] border-white/10 text-gray-400">
                            {card.network}
                          </Badge>
                          {bonus && (
                            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                              {bonus.pointType.replace(/_/g, " ")}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                        <div className="glass rounded-lg p-2.5">
                          <div className="flex items-center gap-1 mb-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Annual Fee</span>
                          </div>
                          <p className="text-sm font-bold">
                            {annualFee === 0 ? <span className="text-emerald-400">Free</span> : `$${annualFee}`}
                          </p>
                        </div>

                        {bonusVal > 0 && (
                          <div className="glass rounded-lg p-2.5">
                            <div className="flex items-center gap-1 mb-1">
                              <Gift className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Welcome Bonus</span>
                            </div>
                            <p className="text-sm font-bold text-primary">${bonusVal.toLocaleString()}</p>
                          </div>
                        )}

                        {bestMult && (
                          <div className="glass rounded-lg p-2.5">
                            <div className="flex items-center gap-1 mb-1">
                              <TrendingUp className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                {highlightCategory ? filterLabel : bestMult.category.replace(/_/g, " ")} Rate
                              </span>
                            </div>
                            <p className="text-sm font-bold text-primary">
                              {(() => {
                                const val = bestMult.value
                                const pct = val < 1 ? val * 100 : val
                                return `${pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1)}% back`
                              })()}
                            </p>
                          </div>
                        )}

                        {bonus && bonus.minimumSpendAmount && (
                          <div className="glass rounded-lg p-2.5">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Spend Req.</span>
                            </div>
                            <p className="text-sm font-bold">
                              ${Number(bonus.minimumSpendAmount).toLocaleString()}
                              <span className="text-xs text-muted-foreground font-normal"> / {bonus.spendPeriodMonths}mo</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto flex-shrink-0">
                      {card.affiliateLink && (
                        <Link
                          href={`/go/${card.slug}`}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 h-10 px-4 text-sm font-bold bg-gradient-to-r from-primary to-cyan-400 text-[#090A0F] rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                          <Gift className="h-3.5 w-3.5" />
                          Apply Now
                        </Link>
                      )}
                      <Link
                        href={`/cards/${card.slug}`}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 h-10 px-4 text-sm font-medium border border-white/10 rounded-lg hover:border-primary/40 hover:text-primary transition-all whitespace-nowrap"
                      >
                        Details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom SEO Content */}
        {bottomContent && (
          <div className="mt-16 space-y-12">

            {/* How to Choose */}
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-white mb-5">{bottomContent.howToChoose.heading}</h2>
              <div className="space-y-4">
                {bottomContent.howToChoose.paragraphs.map((p, i) => (
                  <p key={i} className="text-gray-400 leading-relaxed">{p}</p>
                ))}
              </div>
            </div>

            {/* Things to Consider */}
            <div className="max-w-3xl">
              <h2 className="text-xl font-bold text-white mb-5">Things to Consider</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bottomContent.thingsToConsider.map((item, i) => (
                  <div key={i} className="glass rounded-xl p-4 border border-white/5">
                    <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="max-w-3xl">
              <h2 className="text-xl font-bold text-white mb-5">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {bottomContent.faq.map((item, i) => (
                  <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 bg-white/[0.02]">
                      <h3 className="text-sm font-semibold text-white">{item.q}</h3>
                    </div>
                    <div className="px-5 py-4">
                      <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Internal links to related pages */}
        <div className="mt-16 pt-8 border-t border-white/5">
          <h2 className="text-lg font-semibold mb-4 text-white">Explore More</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/cards" className="text-sm text-muted-foreground hover:text-primary transition-colors border border-white/10 rounded-lg px-3 py-1.5 hover:border-primary/30">All Cards</Link>
            <Link href="/cards/no-annual-fee" className="text-sm text-muted-foreground hover:text-primary transition-colors border border-white/10 rounded-lg px-3 py-1.5 hover:border-primary/30">No Annual Fee</Link>
            <Link href="/cards/best-for/travel" className="text-sm text-muted-foreground hover:text-primary transition-colors border border-white/10 rounded-lg px-3 py-1.5 hover:border-primary/30">Best for Travel</Link>
            <Link href="/cards/best-for/groceries" className="text-sm text-muted-foreground hover:text-primary transition-colors border border-white/10 rounded-lg px-3 py-1.5 hover:border-primary/30">Best for Groceries</Link>
            <Link href="/cards/by-program/aeroplan" className="text-sm text-muted-foreground hover:text-primary transition-colors border border-white/10 rounded-lg px-3 py-1.5 hover:border-primary/30">Aeroplan Cards</Link>
            <Link href="/cards/by-program/cashback" className="text-sm text-muted-foreground hover:text-primary transition-colors border border-white/10 rounded-lg px-3 py-1.5 hover:border-primary/30">Cash Back Cards</Link>
            <Link href="/compare" className="text-sm text-muted-foreground hover:text-primary transition-colors border border-white/10 rounded-lg px-3 py-1.5 hover:border-primary/30">Compare Cards</Link>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-600 mt-8 leading-relaxed">
          We may earn a commission if you apply through our links. All information is accurate as of the date of publication. Please verify current offers on the issuer&apos;s website.
        </p>
      </div>
    </div>
  )
}

