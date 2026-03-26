'use client'

import { useUser } from '@clerk/nextjs'
import { UserProfileForm } from '@/components/user-profile-form'
import { UserCardPortfolio } from '@/components/user-card-portfolio'
import { CardOptimizationDisplay } from '@/components/card-optimization-display'

export default function TestUserProfilePage() {
  const { user } = useUser()

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">User Profile Test</h1>
        <p>Please sign in to test the user profile functionality.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold">User Profile & Card Optimization</h1>
      
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