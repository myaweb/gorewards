# 💰 The Money Router

> A server-side affiliate link tracking system that monitors credit card application clicks before redirecting users to banks.

## 🎯 What It Does

The Money Router intercepts clicks on "Apply Now" buttons, logs analytics data to your database, and then seamlessly redirects users to the actual bank application pages. Think of it as a smart middleman that tracks conversions without slowing down the user experience.

## ✨ Key Features

- **Click Tracking**: Every affiliate link click is logged in the database
- **Non-Blocking**: Analytics updates don't slow down redirects
- **Fallback Handling**: Gracefully handles missing cards or broken links
- **Admin Dashboard**: View click counts for all cards in one place
- **SEO Friendly**: Proper structured data with trackable URLs
- **PostHog Integration**: Works alongside existing analytics

## 🚀 Quick Start

### 1. Run Database Migration
```bash
npx prisma migrate dev --name add_click_count_to_cards
npx prisma generate
```

### 2. Test It Out
```bash
# Start your dev server
npm run dev

# Visit a comparison page
http://localhost:3000/compare/amex-cobalt-vs-td-aeroplan

# Click "Apply Now" - you'll be redirected and the click will be tracked!
```

### 3. View Analytics
```bash
# Visit admin dashboard
http://localhost:3000/admin

# See click counts for each card
```

## 📊 How It Works

```
User clicks "Apply Now"
    ↓
/api/go/amex-cobalt-card
    ↓
Database: clickCount++
    ↓
Redirect to bank's affiliate URL
    ↓
User lands on bank application page
```

## 📁 Files Changed

### Created
- `app/api/go/[slug]/route.ts` - The router API endpoint
- `MONEY_ROUTER_*.md` - Documentation files

### Modified
- `prisma/schema.prisma` - Added clickCount field
- `components/card-comparison.tsx` - Updated affiliate URLs
- `components/admin-dashboard.tsx` - Added click count display
- `app/actions/admin.actions.ts` - Added clickCount to queries
- `components/structured-data.tsx` - Updated SEO URLs

## 🔗 URL Structure

### Before (Direct Links)
```
href="https://americanexpress.com/apply/cobalt"
```

### After (Tracked Links)
```
href="/api/go/amex-cobalt-card"
```

The slug is automatically generated from the card name:
- "American Express Cobalt Card" → `amex-cobalt-card`
- "TD Aeroplan Visa Infinite" → `td-aeroplan-visa-infinite`

## 📈 Admin Dashboard

View click analytics for all cards:

| Card Name | Bank | Clicks | Affiliate Link |
|-----------|------|--------|----------------|
| American Express Cobalt Card | Amex | 42 | ✓ Set |
| TD Aeroplan Visa Infinite | TD | 18 | ✓ Set |
| CIBC Aeroplan Visa Infinite | CIBC | 7 | ✓ Set |

## 🧪 Testing

### Test Direct Router Access
```bash
curl -I http://localhost:3000/api/go/amex-cobalt-card
# Should return 307 redirect to affiliate URL
```

### Test Click Tracking
1. Note current click count in admin dashboard
2. Click "Apply Now" on any comparison page
3. Refresh admin dashboard
4. Click count should increase by 1

### Test Error Handling
```bash
# Non-existent card
http://localhost:3000/api/go/fake-card
# Should redirect to /compare (fallback)
```

## 🎨 Integration Points

### Card Comparison Pages
All "Apply Now" buttons automatically use the Money Router:
- Side-by-side comparison cards
- Verdict section primary CTA
- Verdict section secondary CTA

### Structured Data (SEO)
Schema.org markup includes trackable URLs for search engines.

### PostHog Analytics
Dual tracking system:
- PostHog: Rich event data with user context
- Money Router: Simple click counter in database

## 🔒 Security & Privacy

- No personal user data is stored
- Only card ID and click count are tracked
- Complies with affiliate disclosure requirements
- Transparent redirect (users see the URL change)

## 📊 Analytics Queries

### View Top Performing Cards
```sql
SELECT name, bank, "clickCount"
FROM "Card"
ORDER BY "clickCount" DESC
LIMIT 10;
```

### View Cards Without Affiliate Links
```sql
SELECT name, bank
FROM "Card"
WHERE "affiliateLink" IS NULL;
```

### Reset Click Counts (Testing)
```sql
UPDATE "Card" SET "clickCount" = 0;
```

## 🚧 Future Enhancements

Consider adding:
- [ ] Click timestamps for time-series analysis
- [ ] User tracking (which users clicked which cards)
- [ ] A/B testing support (multiple URLs per card)
- [ ] Conversion tracking (application completion)
- [ ] Geographic tracking (where clicks come from)
- [ ] Referrer tracking (which page generated the click)
- [ ] Revenue tracking (commission per click)

## 📚 Documentation

- `MONEY_ROUTER_IMPLEMENTATION.md` - Detailed implementation guide
- `MONEY_ROUTER_FLOW.md` - Visual flow diagrams
- `MONEY_ROUTER_EXAMPLES.md` - Usage examples and testing

## 🐛 Troubleshooting

### Clicks Not Incrementing
- Check if card has `affiliateLink` set in database
- Verify Prisma client is regenerated after migration
- Check server logs for errors

### Wrong Redirect URL
- Verify slug generation matches card name
- Check database for correct `affiliateLink` value
- Test router URL directly in browser

### 404 on Router
- Ensure file is at `app/api/go/[slug]/route.ts`
- Restart dev server after creating new routes
- Check Next.js routing configuration

## 💡 Pro Tips

1. **Test in Incognito**: Avoid cached redirects during testing
2. **Use Admin Dashboard**: Monitor click patterns to optimize card placement
3. **Check Logs**: Server logs show all router activity
4. **Database Backups**: Click counts are valuable data - back them up!
5. **Monitor Performance**: Track redirect latency in production

## 🤝 Contributing

When adding new cards:
1. Set the `affiliateLink` in the database
2. The Money Router automatically handles the rest
3. No code changes needed!

When modifying the router:
1. Update tests in `MONEY_ROUTER_EXAMPLES.md`
2. Run full test suite before deploying
3. Monitor error rates after deployment

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Test with a known working card first
4. Verify database migration completed successfully

---

Built with ❤️ for tracking affiliate conversions and optimizing credit card recommendations.
