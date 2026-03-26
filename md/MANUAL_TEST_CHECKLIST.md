# Manual Test Checklist - BonusGo Beta Launch

## 🔐 Admin Panel Security Tests

### Test 1: Unauthorized Access Block
- [ ] Log out completely
- [ ] Navigate to `/admin`
- [ ] **Expected**: Redirect to sign-in page
- [ ] Sign in with non-admin email
- [ ] Navigate to `/admin`
- [ ] **Expected**: Redirect to home with error

### Test 2: Authorized Admin Access
- [ ] Add your email to ADMIN_EMAILS in .env
- [ ] Restart dev server
- [ ] Sign in with admin email
- [ ] Navigate to `/admin`
- [ ] **Expected**: Admin dashboard loads successfully
- [ ] Verify all tabs load (Cards, Updates, Users, Waitlist)

### Test 3: Admin Actions Authorization
- [ ] In admin panel, try to edit a card
- [ ] **Expected**: Edit succeeds
- [ ] Log out, sign in as non-admin
- [ ] Try to call admin action directly (via browser console)
- [ ] **Expected**: "Unauthorized" error

## 💳 Billing & Trial Flow Tests

### Test 4: Free User Billing Page
- [ ] Sign in as free user
- [ ] Navigate to `/dashboard/billing`
- [ ] **Expected**: Shows "Free plan" with upgrade button
- [ ] Click upgrade button
- [ ] **Expected**: Redirects to Stripe checkout with 7-day trial

### Test 5: Trial User Billing Page
- [ ] Complete Stripe checkout (use test card: 4242 4242 4242 4242)
- [ ] Wait for webhook to process (check logs)
- [ ] Navigate to `/dashboard/billing`
- [ ] **Expected**: Shows "Free Trial Active" banner
- [ ] **Expected**: Shows trial end date
- [ ] **Expected**: Shows first charge date
- [ ] **Expected**: Shows "Cancel anytime" warning

### Test 6: Stripe API Error Handling
- [ ] Temporarily break Stripe API (invalid key or disconnect internet)
- [ ] Navigate to `/dashboard/billing` as premium user
- [ ] **Expected**: Shows amber warning about stale data
- [ ] **Expected**: Shows "Premium Active" status from database
- [ ] **Expected**: Page doesn't crash
- [ ] Restore Stripe connection
- [ ] Refresh page
- [ ] **Expected**: Warning disappears, full details load

### Test 7: Subscription Management
- [ ] As premium user, click "Manage Subscription"
- [ ] **Expected**: Redirects to Stripe portal
- [ ] In portal, try to cancel subscription
- [ ] **Expected**: Cancellation flow works
- [ ] Return to billing page
- [ ] **Expected**: Status updates after webhook

## 🎯 Dashboard & User Experience Tests

### Test 8: New User Dashboard
- [ ] Create brand new account
- [ ] **Expected**: Dashboard loads (user auto-created)
- [ ] **Expected**: Shows empty state with "No Strategies Yet"
- [ ] **Expected**: Shows actionable CTAs
- [ ] **Expected**: All cards clickable and functional

### Test 9: Dashboard Error Handling
- [ ] Force an error in dashboard (temporarily break database query)
- [ ] Navigate to `/dashboard`
- [ ] **Expected**: Global error boundary catches it
- [ ] **Expected**: Shows friendly error message
- [ ] **Expected**: "Try Again" and "Go Home" buttons work

### Test 10: Loading States
- [ ] Clear browser cache
- [ ] Navigate to `/dashboard`
- [ ] **Expected**: Loading skeleton shows briefly
- [ ] Navigate to `/dashboard/billing`
- [ ] **Expected**: Loading state shows
- [ ] Navigate to `/admin`
- [ ] **Expected**: Loading skeleton shows

## 📝 Waitlist Tests

### Test 11: Waitlist Submission
- [ ] Log out
- [ ] Go to homepage
- [ ] Fill waitlist form (email + name)
- [ ] Submit
- [ ] **Expected**: Success message shows
- [ ] Try same email again
- [ ] **Expected**: "Already on waitlist" message

### Test 12: Waitlist Admin View
- [ ] Sign in as admin
- [ ] Go to `/admin`
- [ ] Click "Waitlist" tab
- [ ] **Expected**: See submitted waitlist entries
- [ ] Click refresh button
- [ ] **Expected**: Data refreshes
- [ ] Verify email and name display correctly

## 🚨 Error Boundary Tests

### Test 13: Global Error Boundary
- [ ] Add this to any page component: `throw new Error('Test error')`
- [ ] Navigate to that page
- [ ] **Expected**: Error boundary catches it
- [ ] **Expected**: Shows error UI with "Try Again" button
- [ ] Click "Try Again"
- [ ] **Expected**: Page attempts to reload

### Test 14: Billing Error Boundary
- [ ] Add error throw to billing page component
- [ ] Navigate to `/dashboard/billing`
- [ ] **Expected**: Billing-specific error boundary shows
- [ ] **Expected**: Shows "Back to Dashboard" button
- [ ] Click button
- [ ] **Expected**: Returns to dashboard

## 🔔 Beta Feature Messaging Tests

### Test 15: Plaid Beta Messaging
- [ ] As premium user, go to dashboard
- [ ] Scroll to "Linked Bank Accounts" section
- [ ] **Expected**: Shows "Beta" badge
- [ ] **Expected**: Shows "transaction intelligence coming soon" message
- [ ] **Expected**: Beta notice card visible

### Test 16: Card Optimization Messaging
- [ ] Navigate to `/dashboard/optimization`
- [ ] **Expected**: Shows "Manual Profile Mode" notice
- [ ] **Expected**: Clarifies it's "Based on your saved spending profile"
- [ ] **Expected**: No misleading "real-time" claims

## 📊 Admin Operations Tests

### Test 17: Card Management
- [ ] As admin, go to Cards tab
- [ ] Click edit on any card
- [ ] Update affiliate link
- [ ] Save
- [ ] **Expected**: Success message
- [ ] **Expected**: Card updates in table
- [ ] Verify click count displays

### Test 18: User Management
- [ ] As admin, go to Users tab
- [ ] Click "Edit Plan" on a user
- [ ] Toggle premium status
- [ ] Save
- [ ] **Expected**: User plan updates
- [ ] **Expected**: Metrics update
- [ ] **Expected**: Warning shows if user has Stripe ID

### Test 19: Card Database Sync
- [ ] As admin, go to Updates tab
- [ ] Click "Sync 50+ Cards Database"
- [ ] **Expected**: Shows loading state
- [ ] **Expected**: Success message with stats
- [ ] **Expected**: Cards count updates in metrics

## 🔍 Edge Cases & Stress Tests

### Test 20: Rapid Navigation
- [ ] Rapidly click between dashboard pages
- [ ] **Expected**: No crashes or race conditions
- [ ] **Expected**: Loading states handle properly

### Test 21: Stale Session
- [ ] Sign in
- [ ] Wait 1 hour (or invalidate session manually)
- [ ] Try to access protected page
- [ ] **Expected**: Redirects to sign-in
- [ ] **Expected**: No crash or infinite loop

### Test 22: Network Interruption
- [ ] Start loading a page
- [ ] Disconnect internet mid-load
- [ ] **Expected**: Graceful error handling
- [ ] Reconnect internet
- [ ] Refresh
- [ ] **Expected**: Page loads normally

## ✅ Pre-Launch Final Checks

### Test 23: Production Environment Variables
- [ ] Verify ADMIN_EMAILS is set
- [ ] Verify ADMIN_CLERK_ID is set
- [ ] Verify all Stripe keys are production keys
- [ ] Verify webhook secrets are correct
- [ ] Verify CRON_SECRET is set

### Test 24: SEO & Metadata
- [ ] Check `/admin` has `noindex, nofollow`
- [ ] Check homepage has proper meta tags
- [ ] Check OG image generates correctly

### Test 25: Mobile Responsiveness
- [ ] Test dashboard on mobile
- [ ] Test billing page on mobile
- [ ] Test admin panel on mobile (if needed)
- [ ] Test waitlist form on mobile

## 📝 Test Results Log

Date: ___________
Tester: ___________

| Test # | Status | Notes |
|--------|--------|-------|
| 1      | ⬜     |       |
| 2      | ⬜     |       |
| 3      | ⬜     |       |
| 4      | ⬜     |       |
| 5      | ⬜     |       |
| 6      | ⬜     |       |
| 7      | ⬜     |       |
| 8      | ⬜     |       |
| 9      | ⬜     |       |
| 10     | ⬜     |       |
| 11     | ⬜     |       |
| 12     | ⬜     |       |
| 13     | ⬜     |       |
| 14     | ⬜     |       |
| 15     | ⬜     |       |
| 16     | ⬜     |       |
| 17     | ⬜     |       |
| 18     | ⬜     |       |
| 19     | ⬜     |       |
| 20     | ⬜     |       |
| 21     | ⬜     |       |
| 22     | ⬜     |       |
| 23     | ⬜     |       |
| 24     | ⬜     |       |
| 25     | ⬜     |       |

**Overall Status**: ⬜ PASS / ⬜ FAIL

**Blocker Issues Found**: 

**Notes**:
