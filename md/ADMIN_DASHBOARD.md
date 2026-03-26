# Admin Dashboard Documentation

## Overview

A secure, premium admin dashboard for managing credit cards, affiliate links, and monitoring platform metrics. Built with strict authentication controls and a beautiful dark theme matching the brand (#090A0F with teal accents).

## Features

### 1. Secure Access Control
- Protected by Clerk authentication
- Only accessible to admin user (via `ADMIN_CLERK_ID`)
- Unauthorized users redirected to home page
- No search engine indexing (`noindex, nofollow`)

### 2. Platform Metrics
Four real-time metric cards showing:
- **Total Users**: Count of all registered users
- **Saved Strategies**: Total optimization strategies saved
- **Premium Users**: Users with active Stripe subscriptions
- **Active Cards**: Number of active credit cards in database

### 3. Card Management Table
Comprehensive data table with:
- Bank name
- Card name
- Annual fee
- Affiliate link status (set/not set)
- Active/Inactive status
- Edit action button

Features:
- Search functionality (by card name or bank)
- Visual indicators for affiliate link status
- Sortable columns
- Responsive design

### 4. Affiliate Link Editor
Modal dialog for editing affiliate links:
- Shows card details (bank, name)
- URL input with validation
- Save/Cancel actions
- Real-time updates
- Error handling

### 5. Dynamic Affiliate Links
Compare pages automatically use:
- Admin-set affiliate links (if available)
- Fallback to bank's official website
- Proper tracking with PostHog analytics

## Architecture

### Files Created

```
app/
├── admin/
│   └── page.tsx                    # Admin dashboard page
├── actions/
│   └── admin.actions.ts            # Server actions for admin operations
components/
├── admin-dashboard.tsx             # Main admin dashboard component
└── ui/
    └── dialog.tsx                  # Shadcn dialog component
middleware.ts                       # Updated with admin route protection
prisma/
└── schema.prisma                   # Updated with affiliateLink field
```

### Database Changes

Added to `Card` model:
```prisma
affiliateLink String?  // Optional affiliate URL
```

## Setup Instructions

### 1. Get Your Clerk User ID

**Method 1: From Clerk Dashboard**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to Users
3. Click on your user account
4. Copy the User ID (starts with `user_`)

**Method 2: From Your App**
1. Log into your app
2. Open browser console
3. Run: `console.log(window.Clerk.user.id)`
4. Copy the ID

### 2. Configure Environment Variables

Add to `.env.local`:
```env
ADMIN_CLERK_ID="user_your_actual_clerk_id_here"
```

Add to Vercel (Production):
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add `ADMIN_CLERK_ID` with your Clerk user ID
3. Redeploy

### 3. Database Migration

Already done! The schema was updated and pushed:
```bash
npx prisma db push
```

### 4. Access the Dashboard

Development:
```
http://localhost:3000/admin
```

Production:
```
https://bonus-cyan.vercel.app/admin
```

## Usage Guide

### Viewing Metrics

The dashboard automatically loads and displays:
- User counts from Prisma
- Strategy statistics
- Premium user count
- Active card count

Metrics refresh on page load.

### Managing Affiliate Links

1. **Find a Card**
   - Use the search box to filter by card name or bank
   - Scroll through the table

2. **Edit Affiliate Link**
   - Click "Edit" button on any card row
   - Modal dialog opens with card details
   - Paste your affiliate URL
   - Click "Save Changes"

3. **Remove Affiliate Link**
   - Click "Edit" on the card
   - Clear the URL field
   - Click "Save Changes"

4. **Verify Changes**
   - Check mark (✓) appears when link is set
   - X mark appears when no link
   - Click "View Link" to test the URL

### How Affiliate Links Work

**On Compare Pages:**
```typescript
// Priority order:
1. Use card.affiliateLink (if set by admin)
2. Fallback to bank's official website
3. Fallback to Google search
```

**Example:**
- Admin sets: `https://partner.com/td-aeroplan?ref=123`
- User clicks "Apply Now" on compare page
- PostHog tracks the click
- User redirected to affiliate URL
- Commission tracked by affiliate network

## Security Features

### Middleware Protection

```typescript
// middleware.ts
const isAdminRoute = createRouteMatcher(['/admin(.*)'])

if (isAdminRoute(req)) {
  if (userId !== process.env.ADMIN_CLERK_ID) {
    return Response.redirect(new URL('/', req.url))
  }
}
```

### Server Action Validation

```typescript
// app/actions/admin.actions.ts
function isAdmin(userId: string | null): boolean {
  return userId === process.env.ADMIN_CLERK_ID
}

// Every action checks:
if (!isAdmin(userId)) {
  return { success: false, error: 'Unauthorized' }
}
```

### URL Validation

```typescript
// Validates affiliate URLs before saving
try {
  new URL(affiliateLink)
} catch {
  return { error: 'Invalid URL format' }
}
```

## API Reference

### Server Actions

#### `getAdminMetrics()`
Fetches platform metrics.

**Returns:**
```typescript
{
  success: boolean
  metrics: {
    totalUsers: number
    totalStrategies: number
    totalPremiumUsers: number
    totalCards: number
  } | null
  error?: string
}
```

#### `getAllCards()`
Fetches all cards for management.

**Returns:**
```typescript
{
  success: boolean
  cards: Array<{
    id: string
    name: string
    bank: string
    annualFee: number
    affiliateLink: string | null
    isActive: boolean
    network: string
    createdAt: Date
  }>
  error?: string
}
```

#### `updateCardAffiliateLink(cardId, affiliateLink)`
Updates affiliate link for a card.

**Parameters:**
- `cardId`: string - Card ID
- `affiliateLink`: string - Affiliate URL (or empty to remove)

**Returns:**
```typescript
{
  success: boolean
  message?: string
  error?: string
}
```

## Styling

### Theme Colors
- Background: `#090A0F`
- Content: `#0F1117`
- Primary: `#00FFFF` (teal)
- Gradient: `from-primary to-cyan-400`
- Borders: `border-primary/20`

### Components
- Glassmorphic cards with `glass-premium` class
- Glowing effects with `glow-teal` class
- Hover states with smooth transitions
- Responsive grid layouts

## Testing

### Test Admin Access

1. **With Admin ID:**
```bash
# Set your Clerk ID in .env.local
ADMIN_CLERK_ID="user_your_id"

# Start dev server
npm run dev

# Visit http://localhost:3000/admin
# Should see dashboard
```

2. **Without Admin ID:**
```bash
# Log in as different user
# Visit http://localhost:3000/admin
# Should redirect to home page
```

### Test Affiliate Link Update

1. Go to `/admin`
2. Click "Edit" on any card
3. Paste test URL: `https://example.com/test`
4. Click "Save Changes"
5. Verify checkmark appears
6. Go to compare page with that card
7. Click "Apply Now"
8. Should open test URL

### Test Fallback Behavior

1. Edit a card and remove affiliate link
2. Go to compare page with that card
3. Click "Apply Now"
4. Should open bank's official website

## Monitoring

### Check Admin Activity

**Vercel Logs:**
- Function invocations for admin actions
- Error messages
- Performance metrics

**PostHog Analytics:**
- Track affiliate link clicks
- Monitor conversion rates
- A/B test different affiliate partners

**Database:**
```sql
-- Check which cards have affiliate links
SELECT name, bank, affiliateLink 
FROM Card 
WHERE affiliateLink IS NOT NULL;

-- Count cards with/without links
SELECT 
  COUNT(*) FILTER (WHERE affiliateLink IS NOT NULL) as with_links,
  COUNT(*) FILTER (WHERE affiliateLink IS NULL) as without_links
FROM Card;
```

## Troubleshooting

### "Unauthorized" Error

**Problem:** Can't access `/admin`

**Solutions:**
1. Check `ADMIN_CLERK_ID` is set in `.env.local`
2. Verify it matches your Clerk user ID exactly
3. Restart dev server after changing env vars
4. Clear browser cache and cookies
5. Check middleware.ts is not cached

### Metrics Not Loading

**Problem:** Dashboard shows 0 for all metrics

**Solutions:**
1. Check database connection (DATABASE_URL)
2. Verify Prisma client is generated
3. Check server logs for errors
4. Ensure user has admin permissions

### Affiliate Links Not Working

**Problem:** Compare pages don't use affiliate links

**Solutions:**
1. Verify link is saved in database
2. Check URL format is valid (starts with https://)
3. Clear Next.js cache: `rm -rf .next`
4. Rebuild: `npm run build`
5. Check card-comparison.tsx is using updated code

### Dialog Not Opening

**Problem:** Edit button doesn't open modal

**Solutions:**
1. Check @radix-ui/react-dialog is installed
2. Verify no JavaScript errors in console
3. Check dialog.tsx component exists
4. Ensure proper z-index (dialog uses z-50)

## Best Practices

### Affiliate Link Management

1. **Use Tracking Parameters**
   ```
   https://partner.com/card?ref=yoursite&source=compare
   ```

2. **Test Links Before Saving**
   - Open in new tab
   - Verify redirect works
   - Check tracking parameters

3. **Document Your Links**
   - Keep spreadsheet of affiliate partners
   - Track commission rates
   - Monitor performance

4. **Update Regularly**
   - Check for expired links monthly
   - Update to better offers
   - Remove non-performing links

### Security

1. **Never Share Admin ID**
   - Keep ADMIN_CLERK_ID secret
   - Don't commit to git
   - Use different ID for staging/production

2. **Monitor Access Logs**
   - Check Vercel logs weekly
   - Look for unauthorized attempts
   - Set up alerts for admin route access

3. **Backup Database**
   - Regular Neon backups
   - Export affiliate links separately
   - Document recovery procedures

## Future Enhancements

### Planned Features

1. **Bulk Edit**
   - Upload CSV of affiliate links
   - Update multiple cards at once
   - Import from affiliate network

2. **Analytics Dashboard**
   - Click-through rates per card
   - Conversion tracking
   - Revenue attribution

3. **A/B Testing**
   - Test different affiliate partners
   - Compare conversion rates
   - Automatic optimization

4. **Link Validation**
   - Automatic link checking
   - Alert on broken links
   - Suggest replacements

5. **Multi-Admin Support**
   - Role-based access control
   - Activity logging
   - Approval workflows

## Support

### Common Questions

**Q: Can I have multiple admins?**
A: Currently supports one admin. For multiple admins, modify middleware to check array of IDs or use Clerk metadata.

**Q: How do I track affiliate commissions?**
A: Use PostHog events + affiliate network dashboard. Match click timestamps with conversions.

**Q: Can I use different links for different pages?**
A: Currently one link per card. For page-specific links, extend the Card model with additional fields.

**Q: What if affiliate link expires?**
A: System falls back to bank website automatically. Update link in admin dashboard when you get new one.

## Environment Variables Summary

```env
# Required for admin access
ADMIN_CLERK_ID="user_your_clerk_user_id"

# Already configured
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
```

## Quick Reference

| Action | URL | Auth Required |
|--------|-----|---------------|
| View Dashboard | `/admin` | Admin only |
| Edit Affiliate Link | Click "Edit" in table | Admin only |
| View Metrics | Automatic on page load | Admin only |
| Test Affiliate Link | Click "View Link" | Admin only |

---

**Admin Dashboard is ready to manage your affiliate links and monitor platform growth!** 🚀
