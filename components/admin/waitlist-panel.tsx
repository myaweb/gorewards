'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Users, RefreshCw, Loader2 } from 'lucide-react'

interface WaitlistEntry {
  id: string
  email: string
  name: string | null
  source: string
  status: string
  createdAt: string
}

export function WaitlistPanel() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWaitlist = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/waitlist?limit=100')
      const data = await response.json()
      
      if (data.success) {
        setEntries(data.data)
        setTotal(data.total)
      } else {
        setError('Failed to fetch waitlist')
      }
    } catch (err) {
      setError('Failed to fetch waitlist')
      console.error('Waitlist fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWaitlist()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">Pending</Badge>
      case 'contacted':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">Contacted</Badge>
      case 'accepted':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">Accepted</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card className="glass-premium border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Waitlist Entries
            </CardTitle>
            <CardDescription>
              Manage closed beta waitlist signups
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{total}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchWaitlist}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-red-400 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No waitlist entries yet
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-muted-foreground border-b border-white/10">
              <div className="col-span-4">Email</div>
              <div className="col-span-2">Name</div>
              <div className="col-span-2">Source</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Joined</div>
            </div>
            
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg border border-white/[0.05] transition-colors"
              >
                <div className="col-span-4 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{entry.email}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-muted-foreground truncate">
                    {entry.name || '-'}
                  </span>
                </div>
                <div className="col-span-2 flex items-center">
                  <Badge variant="outline" className="text-xs">
                    {entry.source}
                  </Badge>
                </div>
                <div className="col-span-2 flex items-center">
                  {getStatusBadge(entry.status)}
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
