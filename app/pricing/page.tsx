import { redirect } from 'next/navigation'

// Pricing page removed — all features are free.
// Redirect to donate page.
export default function PricingPage() {
  redirect('/donate')
}
