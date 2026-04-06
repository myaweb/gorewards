'use client'

import { PlaidConnectButton } from '@/components/plaid-connect-button'
import { Building2, CheckCircle2 } from 'lucide-react'

interface LinkedAccount {
  id: string
  institutionName: string
  createdAt: Date
}

interface PlaidSectionProps {
  linkedAccounts: LinkedAccount[]
}

export function PlaidSection({ linkedAccounts }: PlaidSectionProps) {
  const handleSuccess = () => {
    window.location.reload()
  }

  const hasAccounts = linkedAccounts.length > 0

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {hasAccounts && linkedAccounts.map((account) => (
        <div
          key={account.id}
          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs"
        >
          <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0" />
          <span className="text-gray-300 truncate max-w-[100px]">{account.institutionName}</span>
        </div>
      ))}
      <PlaidConnectButton
        onSuccess={handleSuccess}
        hasExistingAccounts={hasAccounts}
        compact
      />
    </div>
  )
}

