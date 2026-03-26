/**
 * Card Mapping Modal
 * 
 * STEP 8 FIX: Beta User Flow - Plaid Account → Card Mapping
 * 
 * Allows users to map their Plaid-connected bank accounts to specific credit cards
 * in their portfolio for accurate transaction categorization.
 */

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Building2, Check, AlertCircle } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'

interface LinkedAccount {
  id: string
  institutionName: string
  plaidItemId: string
  createdAt: Date
}

interface UserCard {
  id: string
  cardId: string
  card: {
    name: string
    bank: string
    network: string
  }
}

interface CardMapping {
  accountId: string
  cardId: string
}

interface CardMappingModalProps {
  open: boolean
  onClose: () => void
  linkedAccounts: LinkedAccount[]
  userCards: UserCard[]
}

export function CardMappingModal({ open, onClose, linkedAccounts, userCards }: CardMappingModalProps) {
  const [mappings, setMappings] = useState<CardMapping[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const posthog = usePostHog()

  useEffect(() => {
    if (open) {
      loadExistingMappings()
    }
  }, [open])

  const loadExistingMappings = async () => {
    try {
      const response = await fetch('/api/profile/card-mappings')
      if (response.ok) {
        const data = await response.json()
        setMappings(data.mappings || [])
      }
    } catch (err) {
      console.error('Failed to load mappings:', err)
    }
  }

  const handleMappingChange = (accountId: string, cardId: string) => {
    setMappings(prev => {
      const existing = prev.find(m => m.accountId === accountId)
      if (existing) {
        return prev.map(m => m.accountId === accountId ? { accountId, cardId } : m)
      } else {
        return [...prev, { accountId, cardId }]
      }
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/profile/card-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mappings })
      })

      if (!response.ok) {
        throw new Error('Failed to save mappings')
      }

      // Track analytics event
      posthog?.capture('card_mapping_completed', {
        mappings_count: mappings.length,
        accounts_count: linkedAccounts.length,
        cards_count: userCards.length
      })

      onClose()
    } catch (err) {
      setError('Failed to save card mappings. Please try again.')
      console.error('Save error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const getMappedCard = (accountId: string) => {
    const mapping = mappings.find(m => m.accountId === accountId)
    return mapping ? userCards.find(c => c.id === mapping.cardId) : null
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Map Bank Accounts to Cards</DialogTitle>
          <DialogDescription className="text-base">
            Connect your Plaid bank accounts to the credit cards in your portfolio for accurate transaction tracking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {linkedAccounts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No bank accounts connected yet</p>
              </CardContent>
            </Card>
          ) : (
            linkedAccounts.map(account => {
              const mappedCard = getMappedCard(account.id)
              
              return (
                <Card key={account.id} className="border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="font-semibold">{account.institutionName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Connected {new Date(account.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Which card is this account for?
                          </label>
                          <Select
                            value={mappings.find(m => m.accountId === account.id)?.cardId || ''}
                            onValueChange={(value) => handleMappingChange(account.id, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a card..." />
                            </SelectTrigger>
                            <SelectContent>
                              {userCards.map(userCard => (
                                <SelectItem key={userCard.id} value={userCard.id}>
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    <span>{userCard.card.name}</span>
                                    <Badge variant="outline" className="ml-2">
                                      {userCard.card.bank}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {mappedCard && (
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <Check className="h-4 w-4" />
                            <span>Mapped to {mappedCard.card.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}

          {userCards.length === 0 && linkedAccounts.length > 0 && (
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-500">No cards in portfolio</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add cards to your portfolio first before mapping bank accounts.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-500">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-primary to-cyan-400"
            disabled={isSaving || mappings.length === 0}
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Mappings
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
