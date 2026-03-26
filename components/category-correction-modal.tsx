/**
 * Category Correction Modal
 * 
 * STEP 8 FIX: Beta User Flow - Category Correction UI
 * 
 * Allows users to correct transaction categories when the AI gets it wrong.
 * Feeds back into the confidence scoring system for improved accuracy.
 */

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Check, TrendingUp } from 'lucide-react'
import { SpendingCategory } from '@prisma/client'
import { usePostHog } from 'posthog-js/react'

interface Transaction {
  id: string
  merchantName: string
  amount: number
  date: string
  category: SpendingCategory
  confidence: number
}

interface CategoryCorrectionModalProps {
  open: boolean
  onClose: () => void
  transaction: Transaction | null
  onCorrect: () => void
}

const CATEGORY_LABELS: Record<SpendingCategory, string> = {
  GROCERY: 'Grocery',
  GAS: 'Gas',
  DINING: 'Dining',
  RECURRING: 'Bills & Subscriptions',
  TRAVEL: 'Travel',
  SHOPPING: 'Shopping',
  ENTERTAINMENT: 'Entertainment',
  UTILITIES: 'Utilities',
  OTHER: 'Other'
}

const CATEGORY_ICONS: Record<SpendingCategory, string> = {
  GROCERY: '🛒',
  GAS: '⛽',
  DINING: '🍽️',
  RECURRING: '📄',
  TRAVEL: '✈️',
  SHOPPING: '🛍️',
  ENTERTAINMENT: '🎬',
  UTILITIES: '💡',
  OTHER: '📦'
}

export function CategoryCorrectionModal({ 
  open, 
  onClose, 
  transaction, 
  onCorrect 
}: CategoryCorrectionModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<SpendingCategory | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const posthog = usePostHog()

  const handleCorrect = async () => {
    if (!transaction || !selectedCategory) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/transactions/correct-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction.id,
          originalCategory: transaction.category,
          correctedCategory: selectedCategory,
          merchantName: transaction.merchantName,
          amount: transaction.amount
        })
      })

      if (!response.ok) {
        throw new Error('Failed to correct category')
      }

      // Track analytics event
      posthog?.capture('category_corrected', {
        original_category: transaction.category,
        corrected_category: selectedCategory,
        merchant: transaction.merchantName,
        confidence: transaction.confidence
      })

      onCorrect()
      onClose()
    } catch (err) {
      setError('Failed to save correction. Please try again.')
      console.error('Correction error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (!transaction) return null

  const confidenceColor = transaction.confidence >= 0.8 
    ? 'text-green-500' 
    : transaction.confidence >= 0.6 
    ? 'text-yellow-500' 
    : 'text-red-500'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Correct Transaction Category</DialogTitle>
          <DialogDescription className="text-base">
            Help us improve by correcting this transaction's category
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Transaction Details */}
          <Card className="border-primary/20">
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Merchant</p>
                <p className="font-semibold text-lg">{transaction.merchantName}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold">${transaction.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Category</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-base py-1 px-3">
                    {CATEGORY_ICONS[transaction.category]} {CATEGORY_LABELS[transaction.category]}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${confidenceColor}`}>
                      {(transaction.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs text-muted-foreground">confidence</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              What should this category be?
            </label>
            <Select
              value={selectedCategory || ''}
              onValueChange={(value) => setSelectedCategory(value as SpendingCategory)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select correct category..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span>{CATEGORY_ICONS[key as SpendingCategory]}</span>
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Learning Notice */}
          <Card className="border-cyan-500/30 bg-cyan-500/5">
            <CardContent className="p-4 flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-cyan-500 text-sm">AI Learning</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your correction helps improve future categorization accuracy for similar merchants.
                </p>
              </div>
            </CardContent>
          </Card>

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
            onClick={handleCorrect}
            className="flex-1 bg-gradient-to-r from-primary to-cyan-400"
            disabled={isSaving || !selectedCategory}
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Correct Category
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
