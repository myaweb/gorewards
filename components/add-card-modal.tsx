'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Card {
  id: string
  name: string
  bank: string
  network: string
  annualFee: number
  slug: string
}

interface AddCardModalProps {
  isOpen: boolean
  onClose: () => void
  onCardAdded: () => void
}

export function AddCardModal({ isOpen, onClose, onCardAdded }: AddCardModalProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [availableCards, setAvailableCards] = useState<Card[]>([])
  const [formData, setFormData] = useState({
    cardId: '',
    openDate: '',
    annualFeeDate: '',
    notes: ''
  })

  useEffect(() => {
    if (isOpen) {
      loadAvailableCards()
    }
  }, [isOpen])

  const loadAvailableCards = async () => {
    setLoading(true)
    try {
      // Fetch all active cards from the database
      const response = await fetch('/api/cards')
      const data = await response.json()
      
      if (data.success && data.data) {
        setAvailableCards(data.data)
      } else {
        console.error('Error loading cards:', data.error)
      }
    } catch (error) {
      console.error('Error loading available cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.cardId || !formData.openDate || !formData.annualFeeDate) {
      alert('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/profile/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: formData.cardId,
          openDate: new Date(formData.openDate).toISOString(),
          annualFeeDate: new Date(formData.annualFeeDate).toISOString(),
          notes: formData.notes || undefined
        })
      })

      const data = await response.json()
      
      if (data.success) {
        onCardAdded()
        onClose()
        setFormData({ cardId: '', openDate: '', annualFeeDate: '', notes: '' })
        alert('Card added successfully!')
      } else {
        console.error('Error adding card:', data.error)
        alert('Failed to add card. Please try again.')
      }
    } catch (error) {
      console.error('Error adding card:', error)
      alert('Failed to add card. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Credit Card</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <p>Loading available cards...</p>
          ) : (
            <>
              <div>
                <Label htmlFor="card">Credit Card *</Label>
                <Select value={formData.cardId} onValueChange={(value) => setFormData({...formData, cardId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a card" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCards.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.name} - {card.bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="openDate">Open Date *</Label>
                <Input
                  id="openDate"
                  type="date"
                  value={formData.openDate}
                  onChange={(e) => setFormData({...formData, openDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="annualFeeDate">Annual Fee Date *</Label>
                <Input
                  id="annualFeeDate"
                  type="date"
                  value={formData.annualFeeDate}
                  onChange={(e) => setFormData({...formData, annualFeeDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="Any notes about this card..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Adding...' : 'Add Card'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}