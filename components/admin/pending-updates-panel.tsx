'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react'

interface PendingUpdate {
  id: string
  updateType: string
  oldData: Record<string, any> | null
  newData: Record<string, any>
  changeReason: string | null
  createdAt: string
  card: { name: string; bank: string }
  batch: { name: string; description: string | null; createdBy: string }
}

interface PendingUpdatesPanelProps {
  onUpdateComplete?: () => void
}

const FIELD_LABELS: Record<string, string> = {
  annualFee: 'Annual Fee',
  baseRewardRate: 'Base Rate',
  welcomeBonusValue: 'Welcome Bonus',
  groceryMultiplier: 'Grocery',
  gasMultiplier: 'Gas',
  diningMultiplier: 'Dining',
  billsMultiplier: 'Bills/Recurring',
  status: 'Status',
}

function formatValue(field: string, value: any): string {
  if (value === null || value === undefined) return '—'
  if (field === 'annualFee' || field === 'welcomeBonusValue') return `$${Number(value).toFixed(0)}`
  if (field.includes('Multiplier') || field === 'baseRewardRate') {
    return `${(Number(value) * 100).toFixed(1)}%`
  }
  return String(value)
}

export function PendingUpdatesPanel({ onUpdateComplete }: PendingUpdatesPanelProps) {
  const [updates, setUpdates] = useState<PendingUpdate[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const loadUpdates = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/card-updates?view=pending')
      const data = await res.json()
      if (data.success) {
        setUpdates(data.data)
        setSelected(new Set())
      }
    } catch (error) {
      console.error('Failed to load pending updates:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUpdates() }, [loadUpdates])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === updates.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(updates.map(u => u.id)))
    }
  }

  const handleApprove = async (ids: string[]) => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/card-updates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateIds: ids }),
      })
      const data = await res.json()
      if (data.success) {
        await loadUpdates()
        onUpdateComplete?.()
      }
    } catch (error) {
      console.error('Failed to approve:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (ids: string[]) => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/card-updates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateIds: ids }),
      })
      const data = await res.json()
      if (data.success) {
        await loadUpdates()
        onUpdateComplete?.()
      }
    } catch (error) {
      console.error('Failed to reject:', error)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
          Loading pending updates...
        </CardContent>
      </Card>
    )
  }

  if (updates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
          No pending updates. All card data is up to date.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Pending Updates
              <Badge variant="secondary">{updates.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadUpdates} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {selected.size > 0 && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(Array.from(selected))}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve ({selected.size})
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(Array.from(selected))}
                    disabled={actionLoading}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject ({selected.size})
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Select All */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <Checkbox
              checked={selected.size === updates.length}
              onCheckedChange={toggleSelectAll}
              aria-label="Select all updates"
            />
            <span className="text-sm text-muted-foreground">Select All</span>
          </div>

          {/* Update List */}
          <div className="space-y-3">
            {updates.map(update => (
              <div
                key={update.id}
                className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-white/5"
              >
                <Checkbox
                  checked={selected.has(update.id)}
                  onCheckedChange={() => toggleSelect(update.id)}
                  aria-label={`Select update for ${update.card.name}`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{update.card.name}</span>
                    <Badge variant="outline" className="text-xs">{update.card.bank}</Badge>
                  </div>

                  {/* Diff Table */}
                  <div className="rounded border border-white/10 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left px-3 py-1.5 font-medium text-muted-foreground">Field</th>
                          <th className="text-left px-3 py-1.5 font-medium text-muted-foreground">Current</th>
                          <th className="text-left px-3 py-1.5 font-medium text-muted-foreground"></th>
                          <th className="text-left px-3 py-1.5 font-medium text-muted-foreground">New</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(update.newData).map(([field, newVal]) => {
                          const oldVal = update.oldData?.[field]
                          return (
                            <tr key={field} className="border-t border-white/5">
                              <td className="px-3 py-1.5 text-muted-foreground">
                                {FIELD_LABELS[field] || field}
                              </td>
                              <td className="px-3 py-1.5 text-red-400">
                                {formatValue(field, oldVal)}
                              </td>
                              <td className="px-1 py-1.5">
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              </td>
                              <td className="px-3 py-1.5 text-green-400">
                                {formatValue(field, newVal)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Source: {update.batch.createdBy}</span>
                    <span>{new Date(update.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Per-item actions */}
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                    onClick={() => handleApprove([update.id])}
                    disabled={actionLoading}
                    aria-label={`Approve update for ${update.card.name}`}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => handleReject([update.id])}
                    disabled={actionLoading}
                    aria-label={`Reject update for ${update.card.name}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
