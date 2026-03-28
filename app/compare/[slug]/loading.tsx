import { Sparkles, Zap, TrendingUp } from 'lucide-react'

export default function CompareLoading() {
  return (
    <div className="min-h-screen pt-2 pb-12 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Animated Logo/Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary to-cyan-400 blur-3xl opacity-50 animate-pulse" />
            </div>
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-2xl animate-bounce">
                <Sparkles className="h-12 w-12 text-[#090A0F]" style={{ animation: 'spin 2s linear infinite' }} />
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">Preparing Comparison...</span>
          </h2>

          {/* Animated Messages */}
          <div className="space-y-3 mb-8">
            <div 
              className="flex items-center justify-center gap-3 text-muted-foreground animate-fade-in"
              style={{ animationDelay: '0s' }}
            >
              <div className="text-primary animate-pulse">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-sm md:text-base">Analyzing card features</span>
            </div>
            
            <div 
              className="flex items-center justify-center gap-3 text-muted-foreground animate-fade-in"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="text-primary animate-pulse">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-sm md:text-base">Calculating reward rates</span>
            </div>
            
            <div 
              className="flex items-center justify-center gap-3 text-muted-foreground animate-fade-in"
              style={{ animationDelay: '1s' }}
            >
              <div className="text-primary animate-pulse">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-sm md:text-base">Generating AI-powered insights</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full animate-loading-bar" />
            </div>
          </div>

          {/* Fun Fact */}
          <p className="text-sm text-muted-foreground mt-8 animate-pulse">
            💡 Did you know? Choosing the right card can save you $500+ per year!
          </p>
        </div>
      </div>
    </div>
  )
}
