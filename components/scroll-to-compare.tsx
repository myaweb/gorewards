'use client'

import { ChevronDown } from 'lucide-react'

export function ScrollToCompare() {
  return (
    <div className="flex justify-center my-6">
      <button
        onClick={() => {
          document.getElementById('compare-tool')?.scrollIntoView({ behavior: 'smooth' })
        }}
        className="group flex flex-col items-center gap-2"
      >
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/40 bg-primary/10 hover:bg-primary/20 hover:border-primary/70 transition-all text-primary font-semibold text-sm shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]">
          <ChevronDown className="h-4 w-4 animate-bounce" />
          Start Comparing
        </div>
      </button>
    </div>
  )
}
