'use client'

import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export function UpgradeButton() {
  return (
    <Button
      size="lg"
      variant="outline"
      className="border-primary/30 hover:bg-primary/10"
      asChild
    >
      <Link href="/donate">
        <Heart className="mr-2 h-5 w-5" />
        Support CreditRich
      </Link>
    </Button>
  )
}
