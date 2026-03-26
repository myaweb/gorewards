'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { CreditScoreRange } from '@/lib/types/userProfile'

interface UserProfileFormProps {
  onProfileSaved?: () => void
  showTitle?: boolean
}

type RewardType = 'NO_PREFERENCE' | 'TRAVEL_POINTS' | 'CASHBACK' | 'AIRLINE_MILES' | 'HOTEL_POINTS' | 'FLEXIBLE_POINTS'

export function UserProfileForm({ onProfileSaved, showTitle = true }: UserProfileFormProps) {
  const { user } = useUser()
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    creditScoreRange: '',
    annualIncome: '',
    preferredRewardType: 'NO_PREFERENCE' as RewardType,
    monthlyGrocery: '',
    monthlyGas: '',
    monthlyDining: '',
    monthlyBills: '',
    monthlyTravel: '',
    monthlyShopping: '',
    monthlyOther: '',
    maxAnnualFee: '',
    prioritizeSignupBonus: true,
    timeHorizon: 'LONG_TERM'
  })

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()
      
      if (data.success && data.data.profile) {
        const p = data.data.profile
        setProfile({
          creditScoreRange: p.creditScoreRange || '',
          annualIncome: p.annualIncome?.toString() || '',
          preferredRewardType: (p.preferredRewardType || 'NO_PREFERENCE') as RewardType,
          monthlyGrocery: p.monthlyGrocery?.toString() || '',
          monthlyGas: p.monthlyGas?.toString() || '',
          monthlyDining: p.monthlyDining?.toString() || '',
          monthlyBills: p.monthlyBills?.toString() || '',
          monthlyTravel: p.monthlyTravel?.toString() || '',
          monthlyShopping: p.monthlyShopping?.toString() || '',
          monthlyOther: p.monthlyOther?.toString() || '',
          maxAnnualFee: p.maxAnnualFee?.toString() || '',
          prioritizeSignupBonus: p.prioritizeSignupBonus,
          timeHorizon: p.timeHorizon || 'LONG_TERM'
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      // Show user-friendly error message
      alert('Failed to load profile. Please try again.')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const profileData = {
        creditScoreRange: profile.creditScoreRange || undefined,
        annualIncome: profile.annualIncome ? parseFloat(profile.annualIncome) : undefined,
        preferredRewardType: profile.preferredRewardType,
        monthlyGrocery: parseFloat(profile.monthlyGrocery) || 0,
        monthlyGas: parseFloat(profile.monthlyGas) || 0,
        monthlyDining: parseFloat(profile.monthlyDining) || 0,
        monthlyBills: parseFloat(profile.monthlyBills) || 0,
        monthlyTravel: parseFloat(profile.monthlyTravel) || 0,
        monthlyShopping: parseFloat(profile.monthlyShopping) || 0,
        monthlyOther: parseFloat(profile.monthlyOther) || 0,
        maxAnnualFee: profile.maxAnnualFee ? parseFloat(profile.maxAnnualFee) : undefined,
        prioritizeSignupBonus: profile.prioritizeSignupBonus,
        timeHorizon: profile.timeHorizon
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()
      
      if (data.success) {
        onProfileSaved?.()
        alert('Profile saved successfully!')
      } else {
        console.error('Error saving profile:', data.error)
        alert('Failed to save profile. Please try again.')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Please sign in to save your financial profile</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle>Financial Profile</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        {/* Credit Profile */}
        <div className="space-y-4">
          <h3 className="font-semibold">Credit Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="creditScore">Credit Score Range</Label>
              <Select value={profile.creditScoreRange} onValueChange={(value) => setProfile({...profile, creditScoreRange: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CreditScoreRange.EXCELLENT}>Excellent (750+)</SelectItem>
                  <SelectItem value={CreditScoreRange.GOOD}>Good (650-749)</SelectItem>
                  <SelectItem value={CreditScoreRange.FAIR}>Fair (550-649)</SelectItem>
                  <SelectItem value={CreditScoreRange.POOR}>Poor (&lt;550)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="annualIncome">Annual Income (optional)</Label>
              <Input
                id="annualIncome"
                type="number"
                placeholder="75000"
                value={profile.annualIncome}
                onChange={(e) => setProfile({...profile, annualIncome: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Monthly Spending */}
        <div className="space-y-4">
          <h3 className="font-semibold">Monthly Spending</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="grocery">Grocery</Label>
              <Input
                id="grocery"
                type="number"
                placeholder="500"
                value={profile.monthlyGrocery}
                onChange={(e) => setProfile({...profile, monthlyGrocery: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="gas">Gas</Label>
              <Input
                id="gas"
                type="number"
                placeholder="200"
                value={profile.monthlyGas}
                onChange={(e) => setProfile({...profile, monthlyGas: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="dining">Dining</Label>
              <Input
                id="dining"
                type="number"
                placeholder="300"
                value={profile.monthlyDining}
                onChange={(e) => setProfile({...profile, monthlyDining: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="bills">Bills</Label>
              <Input
                id="bills"
                type="number"
                placeholder="150"
                value={profile.monthlyBills}
                onChange={(e) => setProfile({...profile, monthlyBills: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-4">
          <h3 className="font-semibold">Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rewardType">Preferred Reward Type</Label>
              <Select value={profile.preferredRewardType} onValueChange={(value) => setProfile({...profile, preferredRewardType: value as RewardType})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NO_PREFERENCE">No Preference</SelectItem>
                  <SelectItem value="TRAVEL_POINTS">Travel Points</SelectItem>
                  <SelectItem value="CASHBACK">Cashback</SelectItem>
                  <SelectItem value="AIRLINE_MILES">Airline Miles</SelectItem>
                  <SelectItem value="HOTEL_POINTS">Hotel Points</SelectItem>
                  <SelectItem value="FLEXIBLE_POINTS">Flexible Points</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxFee">Max Annual Fee</Label>
              <Input
                id="maxFee"
                type="number"
                placeholder="200"
                value={profile.maxAnnualFee}
                onChange={(e) => setProfile({...profile, maxAnnualFee: e.target.value})}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="prioritizeBonus"
              checked={profile.prioritizeSignupBonus}
              onCheckedChange={(checked) => setProfile({...profile, prioritizeSignupBonus: !!checked})}
            />
            <Label htmlFor="prioritizeBonus">Prioritize signup bonuses</Label>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </CardContent>
    </Card>
  )
}