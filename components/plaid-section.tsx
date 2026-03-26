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
    <div className="space-y-4">
      {/* List of Connected Banks */}
      {hasAccounts && (
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Connected Accounts ({linkedAccounts.length})
          </h3>
          {linkedAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20 hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{account.institutionName}</p>
                <p className="text-sm text-muted-foreground">
                  Connected {new Date(account.createdAt).toLocaleDateString()}
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          ))}
          
          {/* Status Message */}
          <div className="p-3 rounded-lg bg-muted/50 border border-white/10">
            <p className="text-sm text-muted-foreground">
              ✓ Bank connected successfully. Transaction sync and automatic insights will be enabled in a future update.
            </p>
          </div>
        </div>
      )}

      {/* Connect Button - Always Visible */}
      <div className={hasAccounts ? "pt-2" : "text-center py-8"}>
        {!hasAccounts && (
          <>
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No bank accounts connected yet</p>
            <p className="text-sm text-muted-foreground/70 mb-6">
              Connect your bank to prepare for automatic transaction tracking (coming soon)
            </p>
          </>
        )}
        <div className="flex justify-center">
          <PlaidConnectButton 
            onSuccess={handleSuccess} 
            hasExistingAccounts={hasAccounts}
          />
        </div>
      </div>
    </div>
  )
}
