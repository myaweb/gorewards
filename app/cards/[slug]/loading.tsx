import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section Skeleton */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="glass-premium border-primary/20 rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Card Image Skeleton */}
              <div className="flex justify-center">
                <Skeleton className="w-full max-w-[400px] h-64 rounded-2xl" />
              </div>

              {/* Card Info Skeleton */}
              <div>
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-6 w-32 mb-6" />

                {/* Quick Stats Skeleton */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Skeleton className="h-24 rounded-xl" />
                  <Skeleton className="h-24 rounded-xl" />
                </div>

                {/* CTA Button Skeleton */}
                <Skeleton className="h-14 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Bonus Section Skeleton */}
        <div className="max-w-5xl mx-auto mb-12">
          <Card className="glass-card">
            <CardHeader>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>

        {/* Earning Rates Section Skeleton */}
        <div className="max-w-5xl mx-auto mb-12">
          <Card className="glass-card">
            <CardHeader>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card Details Section Skeleton */}
        <div className="max-w-5xl mx-auto mb-12">
          <Card className="glass-card">
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
