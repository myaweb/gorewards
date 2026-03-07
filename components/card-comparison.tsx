"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Gift, 
  Check, 
  X, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from "lucide-react"
import type { CardData } from "@/lib/data/cards-database"

interface CardComparisonProps {
  card1: CardData
  card2: CardData
}

export function CardComparison({ card1, card2 }: CardComparisonProps) {
  // Calculate value scores for comparison
  const card1BonusValue = card1.bonuses[0]?.points || 0
  const card2BonusValue = card2.bonuses[0]?.points || 0
  
  const card1AvgMultiplier = card1.multipliers.reduce((sum, m) => sum + m.rate, 0) / card1.multipliers.length
  const card2AvgMultiplier = card2.multipliers.reduce((sum, m) => sum + m.rate, 0) / card2.multipliers.length

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Comparison
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-gradient">{card1.name}</span>
            <span className="text-muted-foreground mx-4">vs</span>
            <span className="text-gradient">{card2.name}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Side-by-side comparison to help you choose the best credit card for your spending profile
          </p>
        </div>

        {/* Quick Stats Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Annual Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold">${card1.annualFee}</div>
                  <div className="text-xs text-muted-foreground mt-1">{card1.name.split(" ")[0]}</div>
                </div>
                <div className="text-muted-foreground">vs</div>
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold">${card2.annualFee}</div>
                  <div className="text-xs text-muted-foreground mt-1">{card2.name.split(" ")[0]}</div>
                </div>
              </div>
              {card1.annualFee < card2.annualFee && (
                <div className="text-xs text-primary text-center mt-2">
                  {card1.name.split(" ")[0]} saves ${card2.annualFee - card1.annualFee}/year
                </div>
              )}
              {card2.annualFee < card1.annualFee && (
                <div className="text-xs text-primary text-center mt-2">
                  {card2.name.split(" ")[0]} saves ${card1.annualFee - card2.annualFee}/year
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Welcome Bonus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold">{(card1BonusValue / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-muted-foreground mt-1">points</div>
                </div>
                <div className="text-muted-foreground">vs</div>
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold">{(card2BonusValue / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-muted-foreground mt-1">points</div>
                </div>
              </div>
              {card1BonusValue > card2BonusValue && (
                <div className="text-xs text-primary text-center mt-2">
                  {card1.name.split(" ")[0]} offers {((card1BonusValue - card2BonusValue) / 1000).toFixed(0)}K more
                </div>
              )}
              {card2BonusValue > card1BonusValue && (
                <div className="text-xs text-primary text-center mt-2">
                  {card2.name.split(" ")[0]} offers {((card2BonusValue - card1BonusValue) / 1000).toFixed(0)}K more
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Avg. Multiplier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold">{card1AvgMultiplier.toFixed(1)}x</div>
                  <div className="text-xs text-muted-foreground mt-1">earning rate</div>
                </div>
                <div className="text-muted-foreground">vs</div>
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold">{card2AvgMultiplier.toFixed(1)}x</div>
                  <div className="text-xs text-muted-foreground mt-1">earning rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 max-w-7xl mx-auto">
          {/* Card 1 */}
          <ComparisonCard card={card1} isWinner={card1BonusValue > card2BonusValue} />
          
          {/* Card 2 */}
          <ComparisonCard card={card2} isWinner={card2BonusValue > card1BonusValue} />
        </div>

        {/* Detailed Comparison Table */}
        <Card className="glass-card mb-12 max-w-7xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Detailed Comparison</CardTitle>
            <CardDescription>Feature-by-feature breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="text-center py-4 px-4 text-sm font-medium">{card1.name.split(" ")[0]}</th>
                    <th className="text-center py-4 px-4 text-sm font-medium">{card2.name.split(" ")[0]}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Multipliers comparison */}
                  {["Grocery", "Dining", "Gas", "Travel"].map((category) => {
                    const card1Mult = card1.multipliers.find(m => m.category === category)
                    const card2Mult = card2.multipliers.find(m => m.category === category)
                    
                    return (
                      <tr key={category} className="border-b border-white/5">
                        <td className="py-4 px-4 text-sm">{category}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={card1Mult && card2Mult && card1Mult.rate > card2Mult.rate ? "text-primary font-bold" : ""}>
                            {card1Mult?.rate || 1}x
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={card1Mult && card2Mult && card2Mult.rate > card1Mult.rate ? "text-primary font-bold" : ""}>
                            {card2Mult?.rate || 1}x
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  
                  {/* Bonus requirement */}
                  <tr className="border-b border-white/5">
                    <td className="py-4 px-4 text-sm">Bonus Requirement</td>
                    <td className="py-4 px-4 text-center text-sm">
                      ${card1.bonuses[0]?.minimumSpend.toLocaleString()} in {card1.bonuses[0]?.months} months
                    </td>
                    <td className="py-4 px-4 text-center text-sm">
                      ${card2.bonuses[0]?.minimumSpend.toLocaleString()} in {card2.bonuses[0]?.months} months
                    </td>
                  </tr>
                  
                  {/* Network */}
                  <tr className="border-b border-white/5">
                    <td className="py-4 px-4 text-sm">Network</td>
                    <td className="py-4 px-4 text-center text-sm">{card1.network}</td>
                    <td className="py-4 px-4 text-center text-sm">{card2.network}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* AI Generated Verdict */}
        <Card className="glass-card border-primary/20 mb-12 max-w-5xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">AI-Generated Verdict</CardTitle>
                <CardDescription>Personalized recommendation based on spending patterns</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Placeholder for AI-generated content */}
            <div className="prose prose-invert max-w-none">
              <p className="text-base leading-relaxed">
                After analyzing both cards across multiple dimensions, here's our recommendation:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                <div className="glass p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Choose {card1.name.split(" ")[0]} if:
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {card1.bestFor.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="glass p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Choose {card2.name.split(" ")[0]} if:
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {card2.bestFor.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="text-base leading-relaxed">
                <strong>Bottom Line:</strong> {card1BonusValue > card2BonusValue ? card1.name : card2.name} edges ahead 
                with its superior welcome bonus and {card1AvgMultiplier > card2AvgMultiplier ? "higher" : "competitive"} earning 
                rates. However, your personal spending habits should be the ultimate deciding factor.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="flex-1 h-12 text-base font-semibold"
                asChild
              >
                <a href={card1.affiliateUrl} target="_blank" rel="noopener noreferrer">
                  Apply for {card1.name.split(" ")[0]}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="flex-1 h-12 text-base font-semibold"
                asChild
              >
                <a href={card2.affiliateUrl} target="_blank" rel="noopener noreferrer">
                  Apply for {card2.name.split(" ")[0]}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        <div className="text-center max-w-3xl mx-auto">
          <Card className="glass-card border-primary/20">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-4">Still Not Sure?</h3>
              <p className="text-muted-foreground mb-6">
                Use our AI-powered optimizer to get a personalized recommendation based on your exact spending profile
              </p>
              <Button size="lg" className="h-12 px-8" asChild>
                <a href="/">
                  Get Personalized Recommendation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Individual card component for side-by-side display
function ComparisonCard({ card, isWinner }: { card: CardData; isWinner: boolean }) {
  return (
    <Card className={`glass-card ${isWinner ? "border-primary/30" : ""} relative`}>
      {isWinner && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">
            <TrendingUp className="h-3 w-3 mr-1" />
            Best Value
          </Badge>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{card.name}</CardTitle>
            <CardDescription>{card.bank}</CardDescription>
          </div>
          <Badge variant="outline">{card.network}</Badge>
        </div>
        
        {/* Annual Fee */}
        <div className="flex items-center justify-between py-3 border-y border-white/10">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Annual Fee</span>
          </div>
          <span className="text-2xl font-bold">${card.annualFee}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Welcome Bonus */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Gift className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">Welcome Bonus</h4>
          </div>
          <div className="glass p-4 rounded-lg">
            <div className="text-3xl font-bold text-primary mb-2">
              {card.bonuses[0]?.points.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {card.bonuses[0]?.pointType} points
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Spend ${card.bonuses[0]?.minimumSpend.toLocaleString()} in {card.bonuses[0]?.months} months
            </div>
          </div>
        </div>

        {/* Earning Rates */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">Earning Rates</h4>
          </div>
          <div className="space-y-2">
            {card.multipliers.slice(0, 4).map((mult, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{mult.category}</span>
                <span className="font-semibold">{mult.rate}x points</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pros */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            Pros
          </h4>
          <ul className="space-y-2">
            {card.pros.slice(0, 3).map((pro, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <X className="h-4 w-4 text-muted-foreground" />
            Cons
          </h4>
          <ul className="space-y-2">
            {card.cons.slice(0, 3).map((con, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <X className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Apply Button */}
        <Button 
          className="w-full h-12 text-base font-semibold" 
          size="lg"
          asChild
        >
          <a href={card.affiliateUrl} target="_blank" rel="noopener noreferrer">
            Apply Now
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
