import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up - GoRewards',
  description: 'Create your free GoRewards account and start optimizing your credit card rewards today.',
  robots: 'noindex, nofollow', // Don't index auth pages
}

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
