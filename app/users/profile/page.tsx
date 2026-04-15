'use client'

import { useUser } from '@clerk/nextjs'
import { UserProfileForm } from '@/components/user-profile-form'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ChevronRight, CreditCard, TrendingUp } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useUser()

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <p>Please sign in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/users" className="hover:text-white transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-white font-medium">Spending Profile</span>
      </div>

      {/* Profile Form */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Spending Profile</h1>
        <p className="text-muted-foreground mb-6">
          Tell us about your monthly spending to get personalized card recommendations
        </p>
        <UserProfileForm />
      </div>
      
      {/* Quick Links to Other Features */}
      <div className="pt-6 border-t border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Next Steps</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/users/cards">
            <Card className="glass-premium border-primary/20 hover:border-primary/40 transition-all cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">Manage Your Cards</h3>
                    <p className="text-xs text-muted-foreground">
                      Track your portfolio, bonuses, and annual fees
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/users/optimization">
            <Card className="glass-premium border-primary/20 hover:border-primary/40 transition-all cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">View Optimization</h3>
                    <p className="text-xs text-muted-foreground">
                      See which card to use for each category
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
