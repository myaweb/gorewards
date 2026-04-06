import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { AdminDashboard } from '@/components/admin-dashboard'
import { isAdmin } from '@/lib/auth/adminAuth'

export const metadata = {
  title: 'Admin Dashboard - GoRewards',
  description: 'Manage credit cards, affiliate links, and view user metrics',
  robots: 'noindex, nofollow',
}

export default async function AdminPage() {
  // Authentication check
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in?redirect=/admin')
  }

  // Authorization check
  const adminAccess = await isAdmin()
  
  if (!adminAccess) {
    redirect('/admin/unauthorized')
  }

  return <AdminDashboard />
}

