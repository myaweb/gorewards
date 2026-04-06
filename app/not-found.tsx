"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Home, Search, CreditCard, BookOpen, ArrowRight } from "lucide-react"

export default function NotFound() {
  const router = useRouter()
  const [count, setCount] = useState(5)

  useEffect(() => {
    if (count === 0) { router.push("/"); return }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-lg w-full text-center">
        <div
          className="text-[9rem] font-black leading-none tracking-tighter mb-2 select-none"
          style={{
            background: "linear-gradient(135deg, #06B6D4 0%, rgba(6,182,212,0.2) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-gray-400 mb-3 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Countdown */}
        <p className="text-sm text-gray-500 mb-8">
          Redirecting to home in{" "}
          <span className="text-cyan-400 font-semibold tabular-nums">{count}</span>
          {" "}second{count !== 1 ? "s" : ""}…
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Link href="/" className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
              <Home className="h-4 w-4 text-cyan-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">Home</p>
              <p className="text-xs text-gray-500">Back to start</p>
            </div>
          </Link>

          <Link href="/cards" className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-4 w-4 text-cyan-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">Cards</p>
              <p className="text-xs text-gray-500">Browse all cards</p>
            </div>
          </Link>

          <Link href="/compare" className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
              <Search className="h-4 w-4 text-cyan-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">Compare</p>
              <p className="text-xs text-gray-500">Side-by-side</p>
            </div>
          </Link>

          <a href="https://blog.creditrich.net" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-4 w-4 text-cyan-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">Blog</p>
              <p className="text-xs text-gray-500">Tips & guides</p>
            </div>
          </a>
        </div>

        <Link
          href="/#calculator"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-[#090A0F] font-semibold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_28px_rgba(6,182,212,0.6)]"
        >
          Try the Card Calculator
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

