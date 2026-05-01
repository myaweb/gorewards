import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preparing Comparison - GoRewards',
  description: 'Preparing your credit card comparison.',
  robots: 'noindex, nofollow', // Don't index loading/processing pages
}

export default function PreparingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
