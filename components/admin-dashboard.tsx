'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Users,
  Target,
  Crown,
  CreditCard,
  Edit,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
  TrendingUp,
  MousePointerClick,
  Database,
  RefreshCw,
  Mail,
  AlertTriangle,
} from 'lucide-react'
import { getAdminMetrics, getAllCards, updateCardAffiliateLink, getAllUsers, updateUserPlan, getAffiliateAnalytics, getAllCardsWithDetails } from '@/app/actions/admin.actions'
import { CardDataUpdatePanel } from '@/components/admin/card-data-update-panel'
import { PendingUpdatesPanel } from '@/components/admin/pending-updates-panel'
import { WaitlistPanel } from '@/components/admin/waitlist-panel'

interface Metrics {
  totalUsers: number
  totalStrategies: number
  totalPremiumUsers: number
  totalCards: number
  totalBonuses: number
  totalMultipliers: number
}

interface CardData {
  id: string
  name: string
  bank: string
  annualFee: number
  affiliateLink: string | null
  imageUrl: string | null
  isActive: boolean
  network: string
  clickCount: number
  createdAt: Date
}

interface UserData {
  id: string
  clerkUserId: string
  email: string
  isPremium: boolean
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  createdAt: Date
  updatedAt: Date
  _count: {
    savedStrategies: number
    linkedAccounts: number
  }
}

interface AffiliateAnalytics {
  id: string
  name: string
  bank: string
  clickCount: number
  affiliateLink: string | null
}

interface CardWithDetails {
  id: string
  name: string
  bank: string
  network: string
  annualFee: number
  baseRewardRate: number
  affiliateLink: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  bonuses: Array<{
    id: string
    bonusPoints: number
    pointType: string
    minimumSpendAmount: number
    spendPeriodMonths: number
    estimatedValue: number | null
    description: string | null
  }>
  multipliers: Array<{
    id: string
    category: string
    multiplierValue: number
    description: string | null
  }>
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [cards, setCards] = useState<CardData[]>([])
  const [cardsWithDetails, setCardsWithDetails] = useState<CardWithDetails[]>([])
  const [users, setUsers] = useState<UserData[]>([])
  const [analytics, setAnalytics] = useState<AffiliateAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCard, setEditingCard] = useState<CardData | null>(null)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [affiliateUrl, setAffiliateUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [userPremiumStatus, setUserPremiumStatus] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [detailsSearchQuery, setDetailsSearchQuery] = useState('')
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'cards' | 'users' | 'updates' | 'analytics' | 'details' | 'waitlist'>('cards')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [metricsResult, cardsResult, cardsWithDetailsResult, usersResult, analyticsResult] = await Promise.all([
        getAdminMetrics(),
        getAllCards(),
        getAllCardsWithDetails(),
        getAllUsers(),
        getAffiliateAnalytics(),
      ])

      if (metricsResult.success && metricsResult.metrics) {
        setMetrics(metricsResult.metrics)
      }

      if (cardsResult.success) {
        setCards(cardsResult.cards as CardData[])
      }

      if (cardsWithDetailsResult.success) {
        setCardsWithDetails(cardsWithDetailsResult.cards as CardWithDetails[])
      }

      if (usersResult.success) {
        setUsers(usersResult.users as UserData[])
      }

      if (analyticsResult.success) {
        setAnalytics(analyticsResult.analytics as AffiliateAnalytics[])
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleEditClick(card: CardData) {
    setEditingCard(card)
    setAffiliateUrl(card.affiliateLink || '')
    setImageUrl(card.imageUrl || '')
  }

  function handleCloseDialog() {
    setEditingCard(null)
    setAffiliateUrl('')
    setImageUrl('')
  }

  async function handleSaveAffiliateLink() {
    if (!editingCard) return

    setSaving(true)
    try {
      const result = await updateCardAffiliateLink(editingCard.id, affiliateUrl, imageUrl)

      if (result.success) {
        // Update local state
        setCards(cards.map(card =>
          card.id === editingCard.id
            ? { ...card, affiliateLink: affiliateUrl || null, imageUrl: imageUrl || null }
            : card
        ))
        handleCloseDialog()
      } else {
        alert(result.error || 'Failed to update card')
      }
    } catch (error) {
      console.error('Error saving card:', error)
      alert('Failed to update card')
    } finally {
      setSaving(false)
    }
  }

  function handleEditUserClick(user: UserData) {
    setEditingUser(user)
    setUserPremiumStatus(user.isPremium)
  }

  function handleCloseUserDialog() {
    setEditingUser(null)
    setUserPremiumStatus(false)
  }

  async function handleSaveUserPlan() {
    if (!editingUser) return

    setSaving(true)
    try {
      const result = await updateUserPlan(editingUser.id, userPremiumStatus)

      if (result.success) {
        // Update local state
        setUsers(users.map(user =>
          user.id === editingUser.id
            ? { ...user, isPremium: userPremiumStatus }
            : user
        ))
        handleCloseUserDialog()
        
        // Reload metrics to update premium user count
        const metricsResult = await getAdminMetrics()
        if (metricsResult.success && metricsResult.metrics) {
          setMetrics(metricsResult.metrics)
        }
      } else {
        alert(result.error || 'Failed to update user plan')
      }
    } catch (error) {
      console.error('Error saving user plan:', error)
      alert('Failed to update user plan')
    } finally {
      setSaving(false)
    }
  }

  async function handleSyncCards() {
    setIsSyncing(true)
    setSyncResult(null)

    try {
      const response = await fetch('/api/admin/sync-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setSyncResult(data)
        // Reload data to reflect changes
        await loadData()
        
        // Show success message
        alert(
          `✅ Successfully synced ${data.stats.totalInDatabase} cards!\n\n` +
          `Created: ${data.stats.created}\n` +
          `Updated: ${data.stats.updated}\n` +
          `Errors: ${data.stats.errors}`
        )
      } else {
        alert(`❌ Sync failed: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error syncing cards:', error)
      alert('❌ Failed to sync cards. Please try again.')
    } finally {
      setIsSyncing(false)
    }
  }

  const filteredCards = cards.filter(card =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.bank.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCardsWithDetails = cardsWithDetails.filter(card =>
    card.name.toLowerCase().includes(detailsSearchQuery.toLowerCase()) ||
    card.bank.toLowerCase().includes(detailsSearchQuery.toLowerCase())
  )

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090A0F] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#090A0F] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage credit cards, affiliate links, and monitor platform metrics
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass-premium border-primary/20 hover:border-primary/40 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-primary">
                    {metrics?.totalUsers || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-premium border-primary/20 hover:border-primary/40 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Saved Strategies</p>
                  <p className="text-3xl font-bold text-primary">
                    {metrics?.totalStrategies || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-premium border-primary/20 hover:border-primary/40 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Supporters</p>
                  <p className="text-3xl font-bold text-primary">
                    {metrics?.totalPremiumUsers || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-premium border-primary/20 hover:border-primary/40 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Cards</p>
                  <p className="text-3xl font-bold text-primary">
                    {metrics?.totalCards || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'cards'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CreditCard className="h-4 w-4 inline mr-2" />
            Cards Management ({cardsWithDetails.length})
            {activeTab === 'cards' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'updates'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
            Card Updates
            {activeTab === 'updates' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'users'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Users Management
            {activeTab === 'users' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('waitlist')}
            className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'waitlist'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mail className="h-4 w-4 inline mr-2" />
            Waitlist
            {activeTab === 'waitlist' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Money Router Performance Analytics */}
        {activeTab === 'analytics' && (
          <Card className="glass-premium border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <MousePointerClick className="h-6 w-6 text-primary" />
                    Money Router Performance
                  </CardTitle>
                  <CardDescription>
                    Real-time affiliate link click tracking - highest converting cards at the top
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadData}
                  className="hover:bg-primary/10 hover:text-primary"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto overflow-x-auto relative shadow-md sm:rounded-lg custom-scrollbar">
                <table className="w-full">
                  <thead className="sticky top-0 bg-[#090A0F] z-10">
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Rank
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Card Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Bank
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Total Clicks
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Affiliate Link
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.map((card, index) => (
                      <tr
                        key={card.id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <span className="text-sm font-bold text-primary">
                              #{index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium">{card.name}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-muted-foreground">{card.bank}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <MousePointerClick className="h-4 w-4 text-primary" />
                            <span className="text-2xl font-bold text-primary">
                              {card.clickCount.toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {card.affiliateLink && (
                            <a
                              href={card.affiliateLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              View Link
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {analytics.length === 0 && (
                  <div className="text-center py-12">
                    <MousePointerClick className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No affiliate link clicks tracked yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-2">
                      Clicks will appear here once users start using the Money Router
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card Details Table (Normalized Card Model) */}
        {activeTab === 'details' && (
          <Card className="glass-premium border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Database className="h-6 w-6 text-primary" />
                    Card Details
                  </CardTitle>
                  <CardDescription>
                    All {cardsWithDetails.length} cards with bonuses and multipliers from the normalized database
                  </CardDescription>
                </div>
                <div className="w-64">
                  <Input
                    placeholder="Search cards..."
                    value={detailsSearchQuery}
                    onChange={(e) => setDetailsSearchQuery(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto overflow-x-auto relative shadow-md sm:rounded-lg custom-scrollbar">
                <table className="w-full">
                  <thead className="sticky top-0 bg-[#090A0F] z-10">
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Bank
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Card Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Network
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Annual Fee
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Bonuses
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Multipliers
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCardsWithDetails.map((card) => (
                      <tr
                        key={card.id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4 px-4 text-sm font-medium text-primary">
                          {card.bank}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium">{card.name}</div>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-sm">
                          {card.network}
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-sm">
                          ${card.annualFee}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {card.bonuses.length > 0 ? (
                            card.bonuses.map(bonus => (
                              <div key={bonus.id} className="mb-1">
                                {bonus.bonusPoints.toLocaleString()} {bonus.pointType.replace('_', ' ')} pts
                              </div>
                            ))
                          ) : (
                            <span className="text-muted-foreground">No bonuses</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {card.multipliers.length > 0 ? (
                            card.multipliers.map(multiplier => (
                              <div key={multiplier.id} className="mb-1">
                                {multiplier.multiplierValue}x {multiplier.category.toLowerCase()}
                              </div>
                            ))
                          ) : (
                            <span className="text-muted-foreground">No multipliers</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredCardsWithDetails.length === 0 && (
                  <div className="text-center py-12">
                    <Database className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No cards found matching your search.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legacy Credit Cards Section - Commented Out */}
        {/* {activeTab === 'creditcards' && (
          <Card className="glass-premium border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Database className="h-6 w-6 text-primary" />
                    Synced Credit Cards
                  </CardTitle>
                  <CardDescription>
                    All {creditCards.length} cards synced from the master list - used by the recommendation engine
                  </CardDescription>
                </div>
                <div className="w-64">
                  <Input
                    placeholder="Search cards..."
                    value={creditCardSearchQuery}
                    onChange={(e) => setCreditCardSearchQuery(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto overflow-x-auto relative shadow-md sm:rounded-lg custom-scrollbar">
                <table className="w-full">
                  <thead className="sticky top-0 bg-[#090A0F] z-10">
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Bank
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Card Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Network
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Annual Fee
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Welcome Bonus
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Grocery
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Gas
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Dining
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Bills
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                        Apply Link
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCreditCards.map((card) => (
                      <tr
                        key={card.id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4 px-4">
                          <span className="font-medium">{card.bank}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm">{card.name}</span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="text-xs">
                            {card.network}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-semibold">${card.annualFee}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-primary font-semibold">${card.welcomeBonusValue}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs text-muted-foreground">
                            {(card.groceryMultiplier * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs text-muted-foreground">
                            {(card.gasMultiplier * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs text-muted-foreground">
                            {(card.diningMultiplier * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs text-muted-foreground">
                            {(card.billsMultiplier * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <a
                            href={card.applyLink}
                            className="text-xs text-primary hover:underline flex items-center justify-end gap-1"
                          >
                            View
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredCreditCards.length === 0 && (
                  <div className="text-center py-12">
                    <Database className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No credit cards found</p>
                    <p className="text-sm text-muted-foreground/70 mt-2">
                      Click "Sync 50+ Cards Database" to populate the database
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card Data Updates */}
        {activeTab === 'updates' && (
          <div className="space-y-6">
            {/* AI Pipeline Pending Updates */}
            <PendingUpdatesPanel onUpdateComplete={loadData} />

            {/* Manual Card Updates */}
            <CardDataUpdatePanel onUpdateComplete={loadData} />
            
            {/* Database Management Section */}
            <Card className="glass-premium border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Database className="h-6 w-6 text-amber-500" />
                      Database Management
                    </CardTitle>
                    <CardDescription>
                      Sync and update the credit card database from the master list
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 text-amber-500" />
                      Card Database Sync
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      <strong>Optional:</strong> Import cards from reference file (cardData.ts). 
                      <br />
                      <span className="text-xs">💡 Database is the source of truth. Use this only for initial setup or bulk import. For regular updates, edit cards directly above.</span>
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span>32 cards in master list</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>{metrics?.totalCards || 0} cards • {metrics?.totalBonuses || 0} bonuses • {metrics?.totalMultipliers || 0} multipliers</span>
                      </div>
                    </div>
                    {(metrics?.totalCards || 0) > 32 && (
                      <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                        <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-400">
                          <strong>Warning:</strong> Database has {metrics?.totalCards} cards but master list only has 32. Syncing will overwrite {(metrics?.totalCards || 0) - 32} cards that exist in DB but not in the master list. Only use sync for initial setup.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={handleSyncCards}
                    disabled={isSyncing}
                    size="lg"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Syncing Database...
                      </>
                    ) : (
                      <>
                        <Database className="h-5 w-5 mr-2" />
                        Sync 50+ Cards Database
                      </>
                    )}
                  </Button>
                </div>

                {syncResult && (
                  <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/30">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-2">Sync Completed Successfully</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-2 rounded bg-white/5">
                            <div className="text-muted-foreground mb-1">Total Cards</div>
                            <div className="text-lg font-bold text-primary">{syncResult.stats.totalInDatabase}</div>
                          </div>
                          <div className="p-2 rounded bg-white/5">
                            <div className="text-muted-foreground mb-1">Created</div>
                            <div className="text-lg font-bold text-green-500">{syncResult.stats.created}</div>
                          </div>
                          <div className="p-2 rounded bg-white/5">
                            <div className="text-muted-foreground mb-1">Updated</div>
                            <div className="text-lg font-bold text-blue-500">{syncResult.stats.updated}</div>
                          </div>
                          <div className="p-2 rounded bg-white/5">
                            <div className="text-muted-foreground mb-1">Errors</div>
                            <div className="text-lg font-bold text-red-500">{syncResult.stats.errors}</div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          Last synced: {new Date(syncResult.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Management Table */}
        {activeTab === 'users' && (
          <Card className="glass-premium border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Users Management</CardTitle>
                  <CardDescription>
                    Manage user accounts and premium status
                  </CardDescription>
                </div>
                <div className="w-64">
                  <Input
                    placeholder="Search by email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Plan
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Strategies
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Linked Accounts
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Joined
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{user.email}</span>
                            <span className="text-xs text-muted-foreground">
                              ID: {user.id.slice(0, 8)}...
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {user.isPremium ? (
                            <Badge className="bg-gradient-to-r from-primary to-cyan-400 text-[#090A0F] border-0">
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          ) : (
                            <Badge variant="outline">Free</Badge>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm">{user._count.savedStrategies}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm">{user._count.linkedAccounts}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditUserClick(user)}
                            className="hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Plan
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Waitlist Management */}
        {activeTab === 'waitlist' && (
          <WaitlistPanel />
        )}

        {/* Cards Management Table */}
        {activeTab === 'cards' && (
          <Card className="glass-premium border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Cards Management</CardTitle>
                  <CardDescription>
                    Manage all {cards.length} credit cards - Edit affiliate links, images, bonuses and multipliers
                  </CardDescription>
                </div>
                <div className="w-64">
                  <Input
                    placeholder="Search cards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
            <div className="max-h-[600px] overflow-y-auto overflow-x-auto relative shadow-md sm:rounded-lg custom-scrollbar">
              <table className="w-full">
                <thead className="sticky top-0 bg-[#090A0F] z-10">
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                      Bank
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                      Card Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                      Annual Fee
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                      Image URL
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                      Affiliate Link
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                      Clicks
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground bg-[#090A0F]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCards.map((card) => (
                    <tr
                      key={card.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="font-medium">{card.bank}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm">{card.name}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm">${card.annualFee}</span>
                      </td>
                      <td className="py-4 px-4">
                        {card.imageUrl ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span className="text-xs text-muted-foreground">Set</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Not set</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {card.affiliateLink ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <a
                              href={card.affiliateLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              View Link
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Not set</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <MousePointerClick className="h-4 w-4 text-primary" />
                          <span className="text-lg font-bold text-primary">
                            {card.clickCount || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {card.isActive ? (
                          <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(card)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCards.length === 0 && (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No cards found matching your search</p>
                  <p className="text-sm text-muted-foreground/70 mt-2">
                    Try adjusting your search or click "Sync 50+ Cards Database" above
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        )}
      </div>

      {/* Edit User Plan Dialog */}
      <Dialog open={!!editingUser} onOpenChange={handleCloseUserDialog}>
        <DialogContent className="bg-[#0F1117] border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Edit User Plan
            </DialogTitle>
            <DialogDescription>
              Update the premium status for {editingUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userEmail" className="text-sm text-muted-foreground">
                Email
              </Label>
              <Input
                id="userEmail"
                value={editingUser?.email || ''}
                disabled
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId" className="text-sm text-muted-foreground">
                User ID
              </Label>
              <Input
                id="userId"
                value={editingUser?.id || ''}
                disabled
                className="bg-white/5 border-white/10 font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategies" className="text-sm text-muted-foreground">
                Saved Strategies
              </Label>
              <Input
                id="strategies"
                value={editingUser?._count.savedStrategies || 0}
                disabled
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <Label className="text-sm font-semibold">Premium Status</Label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setUserPremiumStatus(false)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    !userPremiumStatus
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold mb-1">Free</div>
                    <div className="text-xs text-muted-foreground">Basic features</div>
                  </div>
                </button>
                <button
                  onClick={() => setUserPremiumStatus(true)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    userPremiumStatus
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Crown className="h-4 w-4 text-primary" />
                      <span className="text-lg font-semibold">Premium</span>
                    </div>
                    <div className="text-xs text-muted-foreground">All features</div>
                  </div>
                </button>
              </div>
            </div>

            {editingUser?.stripeCustomerId && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-primary">
                  ⚠️ This user has a Stripe customer ID. Manual changes may conflict with subscription status.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={handleCloseUserDialog}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveUserPlan}
              disabled={saving || userPremiumStatus === editingUser?.isPremium}
              className="bg-gradient-to-r from-primary to-cyan-400"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Affiliate Link Dialog */}
      <Dialog open={!!editingCard} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-[#0F1117] border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Card</DialogTitle>
            <DialogDescription>
              Update the affiliate link and image URL for {editingCard?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bank" className="text-sm text-muted-foreground">
                Bank
              </Label>
              <Input
                id="bank"
                value={editingCard?.bank || ''}
                disabled
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardName" className="text-sm text-muted-foreground">
                Card Name
              </Label>
              <Input
                id="cardName"
                value={editingCard?.name || ''}
                disabled
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="affiliateUrl" className="text-sm">
                Affiliate URL
              </Label>
              <Input
                id="affiliateUrl"
                type="url"
                placeholder="https://example.com/affiliate-link"
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to remove the affiliate link
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-sm">
                Direct Image URL
              </Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/card-image.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to remove the image URL
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={handleCloseDialog}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAffiliateLink}
              disabled={saving}
              className="bg-gradient-to-r from-primary to-cyan-400"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

