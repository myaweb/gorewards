'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStandalone = pathname?.startsWith('/go/')

  if (isStandalone) {
    return <main>{children}</main>
  }

  return (
    <>
      <Navigation />
      <main>{children}</main>
      <Footer />
    </>
  )
}
