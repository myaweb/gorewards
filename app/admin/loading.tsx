import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#090A0F] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 bg-white/5" />
          <Skeleton className="h-4 w-96 bg-white/5" />
        </div>

        {/* Metrics Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass-premium border-primary/20">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2 bg-white/5" />
                <Skeleton className="h-8 w-16 bg-white/5" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card className="glass-premium border-primary/20">
          <CardContent className="p-6">
            <Skeleton className="h-8 w-48 mb-4 bg-white/5" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full bg-white/5" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
