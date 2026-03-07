import Link from "next/link"
import { CreditCard } from "lucide-react"

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] glass">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-colors" />
              <div className="relative bg-gradient-to-br from-primary to-blue-400 p-2 rounded-lg">
                <CreditCard className="h-5 w-5 text-background" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-gradient">
                RewardsOptimizer
              </span>
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase">
                Maximize Your Points
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/cards"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cards
            </Link>
            <Link
              href="/optimize"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Optimize
            </Link>
            <Link
              href="/goals"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Goals
            </Link>
          </div>

          {/* CTA */}
          <div className="flex items-center space-x-4">
            <Link
              href="/optimize"
              className="hidden sm:inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
