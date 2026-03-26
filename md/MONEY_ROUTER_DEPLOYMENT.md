# 🚀 Money Router - Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Changes
- [x] Created `app/api/go/[slug]/route.ts`
- [x] Updated `prisma/schema.prisma` with clickCount field
- [x] Modified `components/card-comparison.tsx` to use Money Router
- [x] Updated `components/admin-dashboard.tsx` to display clicks
- [x] Modified `app/actions/admin.actions.ts` to include clickCount
- [x] Updated `components/structured-data.tsx` for SEO

### ✅ Documentation
- [x] Created `MONEY_ROUTER_README.md` - Overview and quick start
- [x] Created `MONEY_ROUTER_IMPLEMENTATION.md` - Technical details
- [x] Created `MONEY_ROUTER_FLOW.md` - Visual diagrams
- [x] Created `MONEY_ROUTER_EXAMPLES.md` - Usage examples
- [x] Created `MONEY_ROUTER_DEPLOYMENT.md` - This file

### ⚠️ Required Actions Before Deployment

#### 1. Database Migration
```bash
# Development
npx prisma migrate dev --name add_click_count_to_cards

# Production (when ready)
npx prisma migrate deploy
```

#### 2. Regenerate Prisma Client
```bash
npx prisma generate
```

#### 3. Environment Variables
Ensure these are set in production:
```bash
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

#### 4. Test Locally First
```bash
# Start dev server
npm run dev

# Test these URLs:
# 1. http://localhost:3000/api/go/amex-cobalt-card
# 2. http://localhost:3000/compare/amex-cobalt-vs-td-aeroplan
# 3. http://localhost:3000/admin

# Verify:
# - Redirects work
# - Click counts increment
# - Admin dashboard shows data
```

## Deployment Steps

### Step 1: Backup Database
```bash
# Create backup before migration
pg_dump $DATABASE_URL > backup_before_money_router.sql
```

### Step 2: Deploy Code
```bash
# Commit changes
git add .
git commit -m "feat: Add Money Router for affiliate link tracking"
git push origin main

# Or deploy via your platform (Vercel, etc.)
```

### Step 3: Run Production Migration
```bash
# On production environment
npx prisma migrate deploy
```

### Step 4: Verify Deployment
```bash
# Test production URLs
curl -I https://yourdomain.com/api/go/amex-cobalt-card

# Should return:
# HTTP/2 307
# location: https://affiliate-url.com
```

### Step 5: Monitor Logs
```bash
# Watch for errors in first 24 hours
# Check for:
# - Failed redirects
# - Database errors
# - Slow response times
```

## Post-Deployment Verification

### ✅ Functional Tests

#### Test 1: Basic Redirect
```bash
Visit: https://yourdomain.com/api/go/amex-cobalt-card
Expected: Redirects to affiliate URL
Status: [ ]
```

#### Test 2: Click Tracking
```bash
1. Note click count in admin dashboard
2. Click "Apply Now" on comparison page
3. Refresh admin dashboard
Expected: Click count increased by 1
Status: [ ]
```

#### Test 3: Error Handling
```bash
Visit: https://yourdomain.com/api/go/non-existent-card
Expected: Redirects to /compare
Status: [ ]
```

#### Test 4: Admin Dashboard
```bash
Visit: https://yourdomain.com/admin
Expected: See "Clicks" column with data
Status: [ ]
```

#### Test 5: SEO Structured Data
```bash
1. Visit comparison page
2. View page source
3. Search for "application/ld+json"
Expected: URLs use /api/go/[slug] format
Status: [ ]
```

### ✅ Performance Tests

#### Test 6: Redirect Speed
```bash
# Measure redirect time
time curl -I https://yourdomain.com/api/go/amex-cobalt-card
Expected: < 200ms
Status: [ ]
```

#### Test 7: Database Load
```bash
# Check database query performance
# Monitor slow query logs
Expected: No slow queries from Money Router
Status: [ ]
```

#### Test 8: Concurrent Clicks
```bash
# Simulate multiple users clicking simultaneously
# Use load testing tool (k6, Artillery, etc.)
Expected: All redirects succeed, all clicks counted
Status: [ ]
```

### ✅ Analytics Tests

#### Test 9: PostHog Integration
```bash
1. Click "Apply Now" button
2. Check PostHog dashboard
Expected: affiliate_link_clicked event fires
Status: [ ]
```

#### Test 10: Click Count Accuracy
```bash
1. Reset a card's click count to 0
2. Click 10 times
3. Check database
Expected: clickCount = 10
Status: [ ]
```

## Rollback Plan

If issues occur, follow this rollback procedure:

### Option 1: Quick Rollback (Revert Code Only)
```bash
# Revert to previous deployment
git revert HEAD
git push origin main

# Database changes are backward compatible
# Old code will work with new schema (clickCount field is optional)
```

### Option 2: Full Rollback (Code + Database)
```bash
# Revert code
git revert HEAD
git push origin main

# Revert database migration
npx prisma migrate resolve --rolled-back add_click_count_to_cards

# Or manually:
ALTER TABLE "Card" DROP COLUMN "clickCount";
```

### Option 3: Disable Router (Keep Code)
```bash
# Update all affiliate URLs to direct links temporarily
# In components/card-comparison.tsx:
const card1AffiliateUrl = card1.affiliateLink || getBankWebsite(card1.bank)
# (Remove the /api/go/ routing)
```

## Monitoring & Alerts

### Key Metrics to Track

#### 1. Error Rate
```
Alert if: Error rate > 1% of requests
Monitor: Server logs, error tracking service
```

#### 2. Redirect Latency
```
Alert if: Average redirect time > 500ms
Monitor: Application performance monitoring
```

#### 3. Click Count Anomalies
```
Alert if: Sudden spike or drop in clicks
Monitor: Daily click count comparison
```

#### 4. Database Performance
```
Alert if: Query time > 100ms
Monitor: Database monitoring tools
```

### Monitoring Queries

#### Daily Click Summary
```sql
SELECT 
  DATE("updatedAt") as date,
  SUM("clickCount") as total_clicks
FROM "Card"
WHERE "updatedAt" >= NOW() - INTERVAL '7 days'
GROUP BY DATE("updatedAt")
ORDER BY date DESC;
```

#### Top Performing Cards
```sql
SELECT 
  name,
  bank,
  "clickCount",
  "affiliateLink"
FROM "Card"
WHERE "clickCount" > 0
ORDER BY "clickCount" DESC
LIMIT 10;
```

#### Cards Without Affiliate Links
```sql
SELECT 
  name,
  bank,
  "isActive"
FROM "Card"
WHERE "affiliateLink" IS NULL
AND "isActive" = true;
```

## Common Issues & Solutions

### Issue 1: Migration Fails
```
Error: Migration failed to apply
Solution:
1. Check database connection
2. Verify user has ALTER TABLE permissions
3. Check for conflicting migrations
4. Review migration file for syntax errors
```

### Issue 2: Clicks Not Incrementing
```
Error: Click count stays at 0
Solution:
1. Check server logs for database errors
2. Verify Prisma client is regenerated
3. Test database connection
4. Check if affiliateLink is set
```

### Issue 3: Slow Redirects
```
Error: Redirects take > 1 second
Solution:
1. Check database query performance
2. Add index on Card.name if needed
3. Consider caching card lookups
4. Review server resources
```

### Issue 4: 404 Errors
```
Error: /api/go/[slug] returns 404
Solution:
1. Verify file location: app/api/go/[slug]/route.ts
2. Restart Next.js server
3. Check build output for route registration
4. Verify deployment includes new files
```

## Success Criteria

Deployment is successful when:

- [x] All functional tests pass
- [x] All performance tests pass
- [x] All analytics tests pass
- [x] No errors in logs for 24 hours
- [x] Click counts are accurate
- [x] Redirects work consistently
- [x] Admin dashboard displays correctly
- [x] SEO structured data is correct
- [x] PostHog events still fire
- [x] No performance degradation

## Timeline

### Day 1: Deployment
- Deploy code to production
- Run database migration
- Monitor logs closely
- Test all functionality

### Day 2-7: Monitoring
- Check daily click counts
- Review error logs
- Monitor performance metrics
- Gather user feedback

### Week 2: Optimization
- Analyze click patterns
- Optimize slow queries if needed
- Add additional monitoring if needed
- Document any issues encountered

## Support Contacts

### Technical Issues
- Check server logs first
- Review this deployment guide
- Consult MONEY_ROUTER_EXAMPLES.md for testing

### Database Issues
- Verify migration status: `npx prisma migrate status`
- Check database logs
- Review connection settings

### Performance Issues
- Check application monitoring dashboard
- Review database query performance
- Analyze server resource usage

## Next Steps After Deployment

1. **Monitor for 1 week** - Watch for any issues
2. **Analyze data** - Review click patterns and top cards
3. **Optimize** - Improve based on real-world usage
4. **Enhance** - Consider future features from roadmap
5. **Document** - Update docs with any learnings

---

## Final Checklist Before Going Live

- [ ] All code changes committed and pushed
- [ ] Database backup created
- [ ] Migration tested in staging environment
- [ ] All tests pass locally
- [ ] Environment variables configured
- [ ] Monitoring and alerts set up
- [ ] Rollback plan reviewed and understood
- [ ] Team notified of deployment
- [ ] Documentation reviewed and complete
- [ ] Ready to deploy! 🚀

---

**Deployment Date:** _____________

**Deployed By:** _____________

**Production URL:** _____________

**Notes:** _____________________________________________
