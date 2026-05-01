import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - GoRewards',
  description: 'Sign in to your GoRewards account to access personalized credit card recommendations.',
  robots: 'noindex, nofollow', // Don't index auth pages
}

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
