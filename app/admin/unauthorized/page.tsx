import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Home, Mail } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Access Denied - CreditRich',
  description: 'Admin access required',
  robots: 'noindex, nofollow',
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#090A0F] flex items-center justify-center p-4">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      <Card className="glass-premium border-yellow-500/30 max-w-lg w-full">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">Access Denied</CardTitle>
              <CardDescription className="text-base">
                You don't have permission to access the admin dashboard
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
            <p className="text-sm text-muted-foreground leading-relaxed">
              This area is restricted to authorized administrators only. If you believe you should have access, 
              please contact support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 h-12 bg-gradient-to-r from-primary to-cyan-400 hover:from-primary/90 hover:to-cyan-400/90"
              asChild
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-12 border-primary/30"
              asChild
            >
              <a href="mailto:support@CreditRich.ca">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
