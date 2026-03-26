# Analytics Quick Start Guide

## 🚀 Get PostHog Running in 5 Minutes

### Step 1: Create PostHog Account
1. Go to https://app.posthog.com/signup
2. Create a free account (no credit card required)
3. Create a new project
4. Copy your Project API Key from Settings

### Step 2: Add Environment Variables
Add to your `.env.local` file:
```env
NEXT_PUBLIC_POSTHOG_KEY="phc_your_actual_key_here"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

### Step 3: Restart Development Server
```bash
npm run dev
```

### Step 4: Test Events
1. Open your app: `http://localhost:3000`
2. Navigate to a comparison page: `/compare/american-express-cobalt-vs-td-aeroplan`
3. Click an "Apply Now" button
4. Check PostHog dashboard → Events → Live Events

You should see:
- ✅ `$pageview` events
- ✅ `affiliate_link_clicked` events

### Step 5: View Analytics
Go to PostHog dashboard and explore:
- **Events**: See all tracked events in real-time
- **Insights**: Create custom charts and graphs
- **Dashboards**: Build custom analytics dashboards
- **Session Recordings**: Watch user sessions (optional)

## 📊 Key Events to Monitor

### 1. Affiliate Link Clicks
**Dashboard**: Events → Filter by `affiliate_link_clicked`

**Key Metrics**:
- Total clicks
- Clicks by card
- Clicks by position
- Click-through rate

**Example Query**:
```
Event: affiliate_link_clicked
Group by: properties.cardName
Chart type: Bar chart
```

### 2. Pageviews
**Dashboard**: Events → Filter by `$pageview`

**Key Metrics**:
- Total pageviews
- Unique visitors
- Top pages
- Bounce rate

**Example Query**:
```
Event: $pageview
Group by: properties.$current_url
Chart type: Line chart
```

### 3. Checkout Started
**Dashboard**: Events → Filter by `checkout_started`

**Key Metrics**:
- Total checkouts started
- Conversion rate
- Revenue potential
- Drop-off points

**Example Query**:
```
Event: checkout_started
Group by: properties.source
Chart type: Funnel
```

## 🎯 Create Your First Dashboard

### Affiliate Performance Dashboard

1. Go to PostHog → Dashboards → New Dashboard
2. Name it "Affiliate Performance"
3. Add these insights:

**Insight 1: Total Affiliate Clicks**
- Event: `affiliate_link_clicked`
- Visualization: Number
- Time range: Last 30 days

**Insight 2: Clicks by Card**
- Event: `affiliate_link_clicked`
- Group by: `properties.cardName`
- Visualization: Bar chart
- Time range: Last 30 days

**Insight 3: Clicks by Position**
- Event: `affiliate_link_clicked`
- Group by: `properties.position`
- Visualization: Pie chart
- Time range: Last 30 days

**Insight 4: Click Trend**
- Event: `affiliate_link_clicked`
- Visualization: Line chart
- Time range: Last 30 days
- Interval: Daily

**Insight 5: Top Comparison Pages**
- Event: `affiliate_link_clicked`
- Group by: `properties.pageSlug`
- Visualization: Table
- Time range: Last 30 days
- Sort by: Count (descending)

### Conversion Funnel Dashboard

1. Create new dashboard: "Conversion Funnel"
2. Add funnel insight:

**Steps**:
1. Pageview (comparison page)
2. `affiliate_link_clicked`
3. `checkout_started`

**Filters**:
- URL contains: `/compare/`

**Visualization**: Funnel
**Time range**: Last 30 days

## 🔔 Set Up Alerts

### Alert 1: High Affiliate Activity
**Trigger**: When `affiliate_link_clicked` count > 100 in 1 hour
**Action**: Send email notification
**Use case**: Detect viral traffic or successful campaigns

### Alert 2: Checkout Errors
**Trigger**: When `checkout_error` count > 5 in 1 hour
**Action**: Send Slack notification
**Use case**: Quickly fix payment issues

### Alert 3: Zero Traffic
**Trigger**: When `$pageview` count = 0 in 1 hour
**Action**: Send email notification
**Use case**: Detect downtime or tracking issues

## 📈 Optimization Tips

### 1. Improve Click-Through Rate
**Analyze**:
- Which button positions get most clicks?
- Which card comparisons perform best?
- What time of day has highest CTR?

**Action**:
- Move high-performing CTAs higher on page
- Create more comparisons for popular cards
- Schedule content promotion at peak times

### 2. Reduce Checkout Abandonment
**Analyze**:
- How many start checkout but don't complete?
- What's the average time to checkout?
- Which sources have highest conversion?

**Action**:
- Simplify checkout flow
- Add trust signals
- Offer limited-time discounts

### 3. Increase Pageviews
**Analyze**:
- Which pages have highest bounce rate?
- What's the average session duration?
- Which pages lead to conversions?

**Action**:
- Add internal links to low-bounce pages
- Improve content on high-bounce pages
- Create content clusters around converting pages

## 🧪 A/B Testing Ideas

### Test 1: CTA Copy
**Variant A**: "Apply Now"
**Variant B**: "Get Your Bonus Now"

**Metric**: Click-through rate
**Implementation**: Use PostHog feature flags

### Test 2: Button Position
**Variant A**: CTA at top and bottom
**Variant B**: CTA only at bottom

**Metric**: Total clicks
**Implementation**: Use PostHog feature flags

### Test 3: Comparison Layout
**Variant A**: Side-by-side cards
**Variant B**: Stacked cards

**Metric**: Time on page + clicks
**Implementation**: Use PostHog feature flags

## 🔍 Debugging Events

### Check Event Properties
1. Go to PostHog → Events
2. Click on an event
3. View "Properties" tab
4. Verify all expected properties are present

### Common Issues

**Issue**: Events not showing up
**Solution**: 
- Check browser console for errors
- Verify API key is correct
- Disable ad blockers
- Check Network tab for PostHog requests

**Issue**: Wrong properties
**Solution**:
- Check event capture code
- Verify property names match
- Ensure values are correct type

**Issue**: Duplicate events
**Solution**:
- Check for multiple PostHog initializations
- Verify event handlers aren't duplicated
- Use React useEffect dependencies correctly

## 📱 Mobile Testing

### Test on Mobile Devices
1. Open app on mobile device
2. Navigate through comparison pages
3. Click affiliate links
4. Check PostHog for mobile events

### Mobile-Specific Metrics
- Screen size
- Device type
- Operating system
- Touch vs click events

## 🎓 Learn More

### PostHog Resources
- [Documentation](https://posthog.com/docs)
- [Tutorials](https://posthog.com/tutorials)
- [Community](https://posthog.com/community)
- [Blog](https://posthog.com/blog)

### Analytics Best Practices
- [Event Naming Conventions](https://posthog.com/docs/data/events)
- [Privacy & GDPR](https://posthog.com/docs/privacy)
- [Performance Optimization](https://posthog.com/docs/integrate/client/js#performance)

## ✅ Checklist

### Initial Setup
- [ ] Created PostHog account
- [ ] Added API key to `.env.local`
- [ ] Restarted dev server
- [ ] Verified events in PostHog dashboard

### Dashboard Creation
- [ ] Created Affiliate Performance dashboard
- [ ] Created Conversion Funnel dashboard
- [ ] Set up key metric alerts
- [ ] Shared dashboards with team

### Optimization
- [ ] Analyzed top-performing pages
- [ ] Identified optimization opportunities
- [ ] Implemented A/B tests
- [ ] Monitored results

### Production
- [ ] Added PostHog key to production environment
- [ ] Verified events in production
- [ ] Set up production alerts
- [ ] Created weekly reporting schedule

---

**Need Help?** Check the full documentation in `POSTHOG_ANALYTICS.md`
