# Admin Dashboard - Quick Start Guide

Get your admin dashboard running in 3 minutes.

## Step 1: Get Your Clerk User ID (1 minute)

### Option A: From Clerk Dashboard
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Click "Users" in sidebar
3. Find and click your user account
4. Copy the User ID (looks like `user_2abc123xyz`)

### Option B: From Browser Console
1. Log into your app
2. Open browser console (F12)
3. Paste: `console.log(window.Clerk.user.id)`
4. Copy the ID that appears

## Step 2: Add to Environment Variables (30 seconds)

**Local Development:**

Edit `.env.local`:
```env
ADMIN_CLERK_ID="user_your_actual_id_here"
```

**Production (Vercel):**
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add: `ADMIN_CLERK_ID` = `user_your_id`
5. Redeploy

## Step 3: Access Dashboard (30 seconds)

**Development:**
```bash
npm run dev
```
Visit: `http://localhost:3000/admin`

**Production:**
Visit: `https://bonus-cyan.vercel.app/admin`

## Step 4: Add Your First Affiliate Link (1 minute)

1. Find a card in the table
2. Click "Edit" button
3. Paste your affiliate URL:
   ```
   https://partner.com/card?ref=yoursite
   ```
4. Click "Save Changes"
5. ✓ Checkmark appears!

## Step 5: Test It Works (30 seconds)

1. Go to a compare page with that card
2. Click "Apply Now" button
3. Should open your affiliate URL
4. Check PostHog for tracking event

## That's It! 🎉

Your admin dashboard is ready. You can now:
- ✅ View platform metrics
- ✅ Manage affiliate links
- ✅ Track user growth
- ✅ Monitor strategies

## Quick Tips

### Finding Your Best Cards
Sort by:
- Highest annual fees (premium cards)
- Most popular banks (TD, CIBC, Amex)
- Cards with welcome bonuses

### Affiliate Link Format
```
https://partner.com/apply?
  product=card-name
  &ref=yoursite
  &source=compare
  &utm_campaign=rewards
```

### Testing Links
Before saving:
1. Open in new tab
2. Verify redirect works
3. Check tracking parameters appear

### Security
- Never share your `ADMIN_CLERK_ID`
- Don't commit `.env.local` to git
- Use different ID for staging

## Common Issues

### Can't Access /admin
- Check `ADMIN_CLERK_ID` is set correctly
- Restart dev server: `npm run dev`
- Clear browser cache
- Verify you're logged in with correct account

### Metrics Show 0
- Check database connection
- Verify Prisma is configured
- Look for errors in console

### Affiliate Links Not Working
- Verify URL format (must start with https://)
- Check link is saved (✓ appears)
- Clear Next.js cache: `rm -rf .next`

## Next Steps

1. **Add All Your Affiliate Links**
   - Start with top 10 cards
   - Test each link
   - Monitor click rates

2. **Set Up Tracking**
   - Check PostHog dashboard
   - Monitor affiliate clicks
   - Track conversions

3. **Optimize Performance**
   - A/B test different partners
   - Update underperforming links
   - Focus on high-traffic cards

## Need Help?

- Full docs: `ADMIN_DASHBOARD.md`
- Check Vercel logs for errors
- Test in development first
- Verify environment variables

---

**Your admin dashboard is ready to manage affiliate links and grow revenue!** 💰
