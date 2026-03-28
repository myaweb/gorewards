'use client'

import { useUser } from '@clerk/nextjs'
import { UserProfileForm } from '@/components/user-profile-form'
import { UserCardPortfolio } from '@/components/user-card-portfolio'
import { CardOptimizationDisplay } from '@/components/card-optimization-display'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function TestUserProfilePage() {
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
        <span className="text-white font-medium">Profile</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Financial Profile</h2>
          <UserProfileForm />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Card Portfolio</h2>
          <UserCardPortfolio />
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Card Usage Optimization</h2>
        <CardOptimizationDisplay />
      </div>
    </div>
  )
}