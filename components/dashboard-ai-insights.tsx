'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, AlertCircle, Target, TrendingUp, Loader2 } from 'lucide-react'

interface DashboardInsight {
  type: 'warning' | 'success' | 'info' | 'tip'
  icon: 'alert' | 'sparkles' | 'target' | 'trending'
  title: string
  message: string
  priority: number
}

const ICON_MAP = {
  alert: AlertCircle,
  sparkles: Sparkles,
  target: Target,
  trending: TrendingUp
}

const TYPE_STYLES = {
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400'
  },
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    iconColor: 'text-green-400'
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400'
  },
  tip: {
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    iconColor: 'text-primary'
  }
}

export function DashboardAIInsights() {
  const [insights, setInsights] = useState<DashboardInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/ai/dashboard-insights')
      const data = await response.json()
      
      if (data.success) {
        setInsights(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      console.error('Failed to load insights:', err)
      setError('Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="glass-premium border-purple-400/40 bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-cyan-900/20">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
        </CardContent>
      </Card>
    )
  }

  if (error || insights.length === 0) {
    return null // Don't show card if no insights
  }

  return (
    <Card className="glass-premium border-purple-400/40 bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-cyan-900/20 mb-6 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 -z-0">
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <CardHeader className="relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Sparkles className="h-5 w-5 text-purple-300" />
          </div>
          <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300">
            AI Insights
          </CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Personalized recommendations based on your portfolio
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3 relative z-10">
        {insights.map((insight, index) => {
          const IconComponent = ICON_MAP[insight.icon]
          const styles = TYPE_STYLES[insight.type]
          
          return (
            <div 
              key={index}
              className={`flex gap-3 p-3 ${styles.bg} border ${styles.border} rounded-lg backdrop-blur-sm`}
            >
              <IconComponent className={`h-5 w-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{insight.title}</p>
                <p className="text-xs text-gray-300 mt-1">{insight.message}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
