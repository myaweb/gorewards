import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, Search } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <Card className="glass-premium border-primary/20">
          <CardContent className="py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-cyan-400/30 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-primary" />
            </div>
            
            <h1 className="text-4xl font-bold mb-4 text-gradient">
              Card Not Found
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              We couldn't find the credit card you're looking for. It may have been removed or the URL might be incorrect.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-12 px-6" asChild>
                <Link href="/compare">
                  <Search className="mr-2 h-4 w-4" />
                  Browse All Cards
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="h-12 px-6" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
