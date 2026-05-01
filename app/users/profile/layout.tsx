import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile - GoRewards',
  description: 'Manage your profile and spending preferences',
  robots: 'noindex, nofollow',
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
