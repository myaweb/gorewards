'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Save, 
  RefreshCw, 
  TrendingUp, 
  CreditCard,
  Gift,
  Percent,
  Tag,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { SpendingCategory, PointType } from '@prisma/client'
import { UpdateStatistics } from '@/lib/types/cardDataUpdate'

interface CardDataUpdatePanelProps {
  onUpdateComplete?: () => void
}

export function CardDataUpdatePanel({ onUpdateComplete }: CardDataUpdatePanelProps) {
  const [loading, setLoading] = useState(false)
  const [statistics, setStatistics] = useState<UpdateStatistics | null>(null)
  const [selectedCard, setSelectedCard] = useState('')
  const [availableCards, setAvailableCards] = useState<any[]>([])

  // Form states for different update types
  const [bonusForm, setBonusForm] = useState({
    bonusPoints: '',
    pointType: '',
    minimumSpendAmount: '',
    spendPeriodMonths: '3',
    description: '',
    validFrom: '',
    validUntil: '',
    estimatedValue: '',
    replaceExisting: false
  })

  const [multiplierForm, setMultiplierForm] = useState({
    category: '',
    multiplierValue: '',
    description: '',
    monthlyLimit: '',
    annualLimit: '',
    validFrom: '',
    validUntil: '',
    replaceExisting: false
  })

  const [offerForm, setOfferForm] = useState({
    offerType: 'WELCOME_BONUS',
    title: '',
    description: '',
    bonusPoints: '',
    pointType: '',
    cashValue: '',
    minimumSpend: '',
    timeframe: '',
    validFrom: '',
    validUntil: '',
    terms: ''
  })

  const [cardInfoForm, setCardInfoForm] = useState({
    name: '',
    annualFee: '',
    baseRewardRate: '',
    imageUrl: '',
    affiliateLink: '',
    description: '',
    isActive: true
  })

  useEffect(() => {
    loadStatistics()
    loadAvailableCards()
  }, [])

  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/admin/card-updates')
      const data = await response.json()
      
      if (data.success) {
        setStatistics(data.data)
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
    }
  }

  const loadAvailableCards = async () => {
    try {
      const response = await fetch('/api/cards')
      const data = await response.json()
      
      if (data.success && data.data) {
        setAvailableCards(data.data)
      }
    } catch (error) {
      console.error('Error loading cards:', error)
    }
  }

  const handleUpdateSubmit = async (updateType: string, formData: any) => {
    if (!selectedCard) {
      alert('Please select a card first')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/card-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateType,
          cardId: selectedCard,
          ...formData
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`${updateType} updated successfully!`)
        onUpdateComplete?.()
        loadStatistics()
        
        // Reset form
        switch (updateType) {
          case 'BONUS':
            setBonusForm({
              bonusPoints: '',
              pointType: '',
              minimumSpendAmount: '',
              spendPeriodMonths: '3',
              description: '',
              validFrom: '',
              validUntil: '',
              estimatedValue: '',
              replaceExisting: false
            })
            break
          case 'MULTIPLIER':
            setMultiplierForm({
              category: '',
              multiplierValue: '',
              description: '',
              monthlyLimit: '',
              annualLimit: '',
              validFrom: '',
              validUntil: '',
              replaceExisting: false
            })
            break
          case 'OFFER':
            setOfferForm({
              offerType: 'WELCOME_BONUS',
              title: '',
              description: '',
              bonusPoints: '',
              pointType: '',
              cashValue: '',
              minimumSpend: '',
              timeframe: '',
              validFrom: '',
              validUntil: '',
              terms: ''
            })
            break
          case 'CARD_INFO':
            setCardInfoForm({
              name: '',
              annualFee: '',
              baseRewardRate: '',
              imageUrl: '',
              affiliateLink: '',
              description: '',
              isActive: true
            })
            break
        }
      } else {
        alert(`Failed to update ${updateType}: ${data.error}`)
      }
    } catch (error) {
      console.error('Error updating card:', error)
      alert('Failed to update card data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{(statistics as any).total ?? statistics.totalUpdates ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Total Updates</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{(statistics as any).completed ?? statistics.completedUpdates ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <div>
                  <div className="text-2xl font-bold">{(statistics as any).failed ?? statistics.failedUpdates ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{(statistics as any).pending ?? statistics.pendingUpdates ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Card Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Card to Update</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCard} onValueChange={setSelectedCard}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a card to update" />
            </SelectTrigger>
            <SelectContent>
              {availableCards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.name} - {card.bank}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Update Forms */}
      {selectedCard && (
        <Card>
          <CardHeader>
            <CardTitle>Update Card Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="bonus">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="bonus" className="flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Bonus
                </TabsTrigger>
                <TabsTrigger value="multiplier" className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Multiplier
                </TabsTrigger>
                <TabsTrigger value="offer" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Offer
                </TabsTrigger>
                <TabsTrigger value="info" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Card Info
                </TabsTrigger>
              </TabsList>

              {/* Bonus Update Form */}
              <TabsContent value="bonus" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bonusPoints">Bonus Points *</Label>
                    <Input
                      id="bonusPoints"
                      type="number"
                      value={bonusForm.bonusPoints}
                      onChange={(e) => setBonusForm({...bonusForm, bonusPoints: e.target.value})}
                      placeholder="45000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pointType">Point Type *</Label>
                    <Select value={bonusForm.pointType} onValueChange={(value) => setBonusForm({...bonusForm, pointType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select point type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PointType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="minimumSpend">Minimum Spend *</Label>
                    <Input
                      id="minimumSpend"
                      type="number"
                      value={bonusForm.minimumSpendAmount}
                      onChange={(e) => setBonusForm({...bonusForm, minimumSpendAmount: e.target.value})}
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="spendPeriod">Spend Period (months) *</Label>
                    <Input
                      id="spendPeriod"
                      type="number"
                      value={bonusForm.spendPeriodMonths}
                      onChange={(e) => setBonusForm({...bonusForm, spendPeriodMonths: e.target.value})}
                      placeholder="3"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bonusDescription">Description</Label>
                  <Textarea
                    id="bonusDescription"
                    value={bonusForm.description}
                    onChange={(e) => setBonusForm({...bonusForm, description: e.target.value})}
                    placeholder="Welcome bonus description..."
                  />
                </div>
                
                <Button 
                  onClick={() => handleUpdateSubmit('BONUS', bonusForm)}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Updating...' : 'Update Bonus'}
                </Button>
              </TabsContent>

              {/* Multiplier Update Form */}
              <TabsContent value="multiplier" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={multiplierForm.category} onValueChange={(value) => setMultiplierForm({...multiplierForm, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(SpendingCategory).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="multiplierValue">Multiplier Value *</Label>
                    <Input
                      id="multiplierValue"
                      type="number"
                      step="0.1"
                      value={multiplierForm.multiplierValue}
                      onChange={(e) => setMultiplierForm({...multiplierForm, multiplierValue: e.target.value})}
                      placeholder="5.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyLimit">Monthly Limit</Label>
                    <Input
                      id="monthlyLimit"
                      type="number"
                      value={multiplierForm.monthlyLimit}
                      onChange={(e) => setMultiplierForm({...multiplierForm, monthlyLimit: e.target.value})}
                      placeholder="2500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="annualLimit">Annual Limit</Label>
                    <Input
                      id="annualLimit"
                      type="number"
                      value={multiplierForm.annualLimit}
                      onChange={(e) => setMultiplierForm({...multiplierForm, annualLimit: e.target.value})}
                      placeholder="30000"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleUpdateSubmit('MULTIPLIER', multiplierForm)}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Updating...' : 'Update Multiplier'}
                </Button>
              </TabsContent>

              {/* Offer Update Form */}
              <TabsContent value="offer" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="offerTitle">Title *</Label>
                    <Input
                      id="offerTitle"
                      value={offerForm.title}
                      onChange={(e) => setOfferForm({...offerForm, title: e.target.value})}
                      placeholder="Welcome Bonus Offer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="offerType">Offer Type *</Label>
                    <Select value={offerForm.offerType} onValueChange={(value) => setOfferForm({...offerForm, offerType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select offer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WELCOME_BONUS">Welcome Bonus</SelectItem>
                        <SelectItem value="LIMITED_TIME">Limited Time</SelectItem>
                        <SelectItem value="ANNUAL_FEE_WAIVER">Annual Fee Waiver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="offerBonusPoints">Bonus Points</Label>
                    <Input
                      id="offerBonusPoints"
                      type="number"
                      value={offerForm.bonusPoints}
                      onChange={(e) => setOfferForm({...offerForm, bonusPoints: e.target.value})}
                      placeholder="45000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="offerPointType">Point Type</Label>
                    <Select value={offerForm.pointType} onValueChange={(value) => setOfferForm({...offerForm, pointType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select point type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PointType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="offerValidFrom">Valid From *</Label>
                    <Input
                      id="offerValidFrom"
                      type="datetime-local"
                      value={offerForm.validFrom}
                      onChange={(e) => setOfferForm({...offerForm, validFrom: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="offerValidUntil">Valid Until *</Label>
                    <Input
                      id="offerValidUntil"
                      type="datetime-local"
                      value={offerForm.validUntil}
                      onChange={(e) => setOfferForm({...offerForm, validUntil: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="offerDescription">Description *</Label>
                    <Textarea
                      id="offerDescription"
                      value={offerForm.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOfferForm({...offerForm, description: e.target.value})}
                      placeholder="Detailed offer description..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="offerTerms">Terms & Conditions</Label>
                    <Textarea
                      id="offerTerms"
                      value={offerForm.terms}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOfferForm({...offerForm, terms: e.target.value})}
                      placeholder="Terms and conditions..."
                    />
                  </div>
                  
                  <Button 
                    onClick={() => handleUpdateSubmit('OFFER', offerForm)}
                    disabled={loading}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Updating...' : 'Create Offer'}
                  </Button>
                </TabsContent>

                {/* Card Info Update Form */}
                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardName">Card Name</Label>
                      <Input
                        id="cardName"
                        value={cardInfoForm.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardInfoForm({...cardInfoForm, name: e.target.value})}
                        placeholder="Card name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardAnnualFee">Annual Fee</Label>
                      <Input
                        id="cardAnnualFee"
                        type="number"
                        step="0.01"
                        value={cardInfoForm.annualFee}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardInfoForm({...cardInfoForm, annualFee: e.target.value})}
                        placeholder="120.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardBaseRate">Base Reward Rate</Label>
                      <Input
                        id="cardBaseRate"
                        type="number"
                        step="0.0001"
                        value={cardInfoForm.baseRewardRate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardInfoForm({...cardInfoForm, baseRewardRate: e.target.value})}
                        placeholder="0.01"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardImageUrl">Image URL</Label>
                      <Input
                        id="cardImageUrl"
                        type="url"
                        value={cardInfoForm.imageUrl}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardInfoForm({...cardInfoForm, imageUrl: e.target.value})}
                        placeholder="https://example.com/card.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardAffiliateLink">Affiliate Link</Label>
                      <Input
                        id="cardAffiliateLink"
                        type="url"
                        value={cardInfoForm.affiliateLink}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardInfoForm({...cardInfoForm, affiliateLink: e.target.value})}
                        placeholder="https://example.com/apply"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="cardDescription">Description</Label>
                    <Textarea
                      id="cardDescription"
                      value={cardInfoForm.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCardInfoForm({...cardInfoForm, description: e.target.value})}
                      placeholder="Card description..."
                    />
                  </div>
                  
                  <Button 
                    onClick={() => handleUpdateSubmit('CARD_INFO', cardInfoForm)}
                    disabled={loading}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Updating...' : 'Update Card Info'}
                  </Button>
                </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Recent Updates */}
      {statistics && statistics.recentUpdates && statistics.recentUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {statistics.recentUpdates.slice(0, 5).map((update) => (
                <div key={update.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">{(update as any).cardName || update.cardId}</div>
                    <div className="text-sm text-muted-foreground">
                      {update.errorMessage || `${update.updateType} updated`}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={update.status === 'COMPLETED' ? 'default' : update.status === 'FAILED' ? 'destructive' : 'secondary'}>
                      {update.updateType}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(update.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
