import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analyzing Your Spending - GoRewards',
  description: 'Analyzing your spending patterns to find the best credit card recommendations.',
  robots: 'noindex, nofollow', // Don't index loading/processing pages
}

export default function AnalyzeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
