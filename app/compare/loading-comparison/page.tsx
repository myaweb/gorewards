'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Sparkles, TrendingUp, Award, DollarSign, Calculator, CreditCard } from 'lucide-react'

export default function LoadingComparisonPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const [currentTip, setCurrentTip] = useState(0)
  const [progress, setProgress] = useState(0)
  const [cardNames, setCardNames] = useState<string[]>(['Credit Card', 'Credit Card'])

  // Extract card names from URL
  useEffect(() => {
    const targetUrl = searchParams.get('url')
    if (targetUrl) {
      const match = targetUrl.match(/\/compare\/(.+)/)
      if (match) {
        const slug = match[1]
        const slugs = slug.split('-vs-')
        const names = slugs.map(s => 
          s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        )
        setCardNames(names)
      }
    }
  }, [searchParams])

  const tips = [
    { icon: <DollarSign className="h-6 w-6" />, text: "Analyzing annual fees and welcome bonuses", color: "from-green-400 to-emerald-500" },
    { icon: <Calculator className="h-6 w-6" />, text: "Calculating category multipliers", color: "from-blue-400 to-cyan-500" },
    { icon: <TrendingUp className="h-6 w-6" />, text: "Computing first-year value", color: "from-purple-400 to-pink-500" },
    { icon: <Award className="h-6 w-6" />, text: "Evaluating rewards programs", color: "from-orange-400 to-red-500" },
    { icon: <Sparkles className="h-6 w-6" />, text: "Generating AI expert analysis", color: "from-cyan-400 to-blue-500" },
  ]

  useEffect(() => {
    const targetUrl = searchParams.get('url')
    if (!targetUrl) {
      router.push('/compare')
      return
    }

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Tip rotation (every 1 second)
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % tips.length)
    }, 1000)

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100
        return prev + (100 / 50) // 50 steps over 5 seconds
      })
    }, 100)

    // Navigate after 5 seconds
    const navigationTimeout = setTimeout(() => {
      clearInterval(countdownInterval)
      clearInterval(tipInterval)
      clearInterval(progressInterval)
      window.location.href = targetUrl
    }, 5000)

    return () => {
      clearInterval(countdownInterval)
      clearInterval(tipInterval)
      clearInterval(progressInterval)
      clearTimeout(navigationTimeout)
    }
  }, [searchParams, router, tips.length])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#090A0F] via-[#0A0B10] to-[#0B0C11] overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '0.5s' }} />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl w-full mx-4">
        <div className="relative">
          {/* Glow effect behind card */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-cyan-400/30 to-purple-500/30 rounded-3xl blur-3xl" />
          
          <div className="relative glass-premium border border-primary/40 rounded-3xl p-12 text-center space-y-8 backdrop-blur-xl">
            {/* Two Cards with VS */}
            <div className="flex justify-center items-center mb-8 gap-6">
              {/* First Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-cyan-400/30 rounded-2xl blur-xl animate-pulse" />
                <div className="relative w-52 h-32 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-primary/40 p-4 flex flex-col justify-between shadow-2xl transform hover:scale-105 transition-transform">
                  <div className="flex justify-between items-start">
                    <CreditCard className="h-8 w-8 text-primary" />
                    <div className="w-10 h-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded opacity-80" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white/90 line-clamp-2">{cardNames[0]}</div>
                    <div className="flex gap-1">
                      <div className="w-8 h-1 bg-white/40 rounded" />
                      <div className="w-8 h-1 bg-white/40 rounded" />
                      <div className="w-8 h-1 bg-white/40 rounded" />
                    </div>
                  </div>
                </div>
              </div>

              {/* VS Badge */}
              <div className="relative z-10">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-full blur-xl animate-pulse" />
                <div className="relative px-6 py-3 bg-gradient-to-r from-primary via-cyan-400 to-purple-500 rounded-full font-bold text-white text-xl shadow-2xl animate-scale-pulse">
                  VS
                </div>
              </div>

              {/* Second Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="relative w-52 h-32 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-purple-500/40 p-4 flex flex-col justify-between shadow-2xl transform hover:scale-105 transition-transform">
                  <div className="flex justify-between items-start">
                    <CreditCard className="h-8 w-8 text-purple-400" />
                    <div className="w-10 h-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded opacity-80" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white/90 line-clamp-2">{cardNames[1]}</div>
                    <div className="flex gap-1">
                      <div className="w-8 h-1 bg-white/40 rounded" />
                      <div className="w-8 h-1 bg-white/40 rounded" />
                      <div className="w-8 h-1 bg-white/40 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Title with gradient */}
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-purple-400 animate-gradient">
                Preparing Comparison
              </h1>
              <p className="text-muted-foreground text-base">
                Analyzing cards with AI-powered insights
              </p>
            </div>

            {/* Countdown - smaller and subtle */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">{countdown}s</span>
            </div>

            {/* Rotating tips with smooth transition */}
            <div className="min-h-[80px] flex items-center justify-center">
              <div 
                key={currentTip}
                className="flex flex-col items-center gap-4 animate-slide-up"
              >
                <div className="flex items-center gap-4 text-lg text-foreground font-medium">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${tips[currentTip].color} shadow-lg`}>
                    {tips[currentTip].icon}
                  </div>
                  <span>{tips[currentTip].text}</span>
                </div>
              </div>
            </div>

            {/* Enhanced progress bar */}
            <div className="space-y-3">
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden relative">
                {/* Background shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                
                {/* Progress fill */}
                <div 
                  className="h-full bg-gradient-to-r from-primary via-cyan-400 to-purple-500 rounded-full transition-all duration-100 ease-linear relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Processing...</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {['AI Analysis', 'Real-time Data', 'Detailed Insights'].map((badge, i) => (
                <div
                  key={badge}
                  className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium animate-fade-in"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
