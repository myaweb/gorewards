import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Coffee, Sparkles, Check } from 'lucide-react'
import { DonateButton } from '@/components/donate-button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support GoRewards - Help Keep Us Free',
  description: 'Support GoRewards and help us keep the platform free for all Canadians. Your contribution helps us maintain and improve our credit card optimization tools.',
  robots: 'noindex, nofollow', // Don't index donation page
}

export default async function BillingPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen pt-2 pb-16">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-3">Support GoRewards</h1>
          <p className="text-base text-gray-400">All features are free. If GoRewards helps you, consider supporting us.</p>
        </div>

        <div className="space-y-8">
          {/* Main Message */}
          <Card className="glass-premium border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-cyan-400/30 flex items-center justify-center flex-shrink-0">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    GoRewards is free for everyone
                  </h2>
                  <p className="text-base text-gray-400 leading-relaxed">
                    We believe every Canadian should have access to smart credit card tools without paywalls. 
                    Your donations help us keep the servers running, update card data, and build new features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Donate Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="glass-premium border-white/[0.08] hover:border-primary/30 transition-all">
              <CardContent className="p-6 text-center">
                <Coffee className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-1">Buy us a coffee</h3>
                <p className="text-3xl font-bold text-primary mb-2">$5</p>
                <p className="text-xs text-gray-500 mb-4">One-time</p>
                <DonateButton amount={5} variant="outline" />
              </CardContent>
            </Card>

            <Card className="glass-premium border-primary/30 hover:border-primary/50 transition-all relative">
              <div className="absolute -top-2 right-4">
                <Badge className="bg-primary text-[#090A0F]">Popular</Badge>
              </div>
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-1">Support the project</h3>
                <p className="text-3xl font-bold text-primary mb-2">$15</p>
                <p className="text-xs text-gray-500 mb-4">One-time</p>
                <DonateButton amount={15} variant="primary" />
              </CardContent>
            </Card>

            <Card className="glass-premium border-white/[0.08] hover:border-primary/30 transition-all">
              <CardContent className="p-6 text-center">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-1">Champion supporter</h3>
                <p className="text-3xl font-bold text-primary mb-2">$50</p>
                <p className="text-xs text-gray-500 mb-4">One-time</p>
                <DonateButton amount={50} variant="outline" />
              </CardContent>
            </Card>
          </div>

          {/* What You Get */}
          <Card className="glass-premium border-white/[0.08]">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl">What every user gets — for free</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {[
                  'Personalized card recommendations based on your spending',
                  'Unlimited saved strategies and roadmaps',
                  'Card comparisons with AI-powered analysis',
                  'Card portfolio tracking and bonus progress',
                  'Category-based spending optimization',
                  'Bank connection via Plaid (beta)',
                  'Access to all current and future features',
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-gray-300 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

