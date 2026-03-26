# Email Automation Setup Checklist

Use this checklist to get your email automation fully operational.

## ✅ Pre-Setup (Already Done)

- [x] Install dependencies (resend, @react-email/*, svix)
- [x] Create email templates (WelcomeEmail, StepReminderEmail)
- [x] Build cron job route (/api/cron/reminders)
- [x] Build webhook route (/api/webhooks/clerk)
- [x] Update environment variable files
- [x] Create vercel.json for cron jobs
- [x] Write comprehensive documentation

## 🔧 Configuration Steps (Your Action Required)

### Step 1: Get Resend API Key ⏱️ 2 minutes

- [ ] Go to [resend.com](https://resend.com)
- [ ] Sign up or log in
- [ ] Navigate to "API Keys" in sidebar
- [ ] Click "Create API Key"
- [ ] Copy the key (starts with `re_`)
- [ ] Add to `.env.local`:
  ```env
  RESEND_API_KEY="re_your_actual_key_here"
  ```

### Step 2: Configure Clerk Webhook ⏱️ 3 minutes

- [ ] Go to [Clerk Dashboard](https://dashboard.clerk.com)
- [ ] Select your application
- [ ] Click "Webhooks" in sidebar
- [ ] Click "Add Endpoint"
- [ ] Enter endpoint URL:
  ```
  https://bonus-cyan.vercel.app/api/webhooks/clerk
  ```
- [ ] Subscribe to event: `user.created`
- [ ] Click "Create"
- [ ] Copy the "Signing Secret" (starts with `whsec_`)
- [ ] Add to `.env.local`:
  ```env
  CLERK_WEBHOOK_SECRET="whsec_your_actual_secret_here"
  ```

### Step 3: Update Email Sender Addresses ⏱️ 2 minutes

**For Development (Quick Test)**:
- [ ] Keep default `onboarding@resend.dev` in both files
- [ ] This works immediately for testing

**For Production (Required)**:
- [ ] Verify your domain in Resend dashboard
- [ ] Update `app/api/cron/reminders/route.ts` line ~80:
  ```typescript
  from: 'Rewards Roadmap <noreply@yourdomain.com>'
  ```
- [ ] Update `app/api/webhooks/clerk/route.ts` line ~40:
  ```typescript
  from: 'Rewards Roadmap <noreply@yourdomain.com>'
  ```

### Step 4: Deploy Environment Variables ⏱️ 1 minute

**If using Vercel**:
- [ ] Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- [ ] Add `RESEND_API_KEY`
- [ ] Add `CLERK_WEBHOOK_SECRET`
- [ ] Redeploy your application

**If using other hosting**:
- [ ] Add environment variables to your hosting platform
- [ ] Ensure they're available in production environment

## 🧪 Testing Steps

### Test 1: Welcome Email ⏱️ 3 minutes

- [ ] Start dev server: `npm run dev`
- [ ] Register a new test user through your app
- [ ] Check Clerk Dashboard → Webhooks → Logs
  - Should show 200 response
- [ ] Check Resend Dashboard → Emails
  - Should show email sent
- [ ] Check test user's email inbox
  - Should receive welcome email
  - Verify dark theme displays correctly
  - Click dashboard button to test link

**Expected Result**: Beautiful welcome email with teal gradient header and working dashboard link

### Test 2: Reminder Email (Manual Trigger) ⏱️ 2 minutes

- [ ] Ensure you have at least one incomplete saved strategy in database
- [ ] Update strategy's `updatedAt` to 8+ days ago (optional, for testing)
- [ ] Run manual trigger:
  ```bash
  curl -X POST http://localhost:3000/api/cron/reminders \
    -H "Authorization: Bearer YOUR_CRON_SECRET"
  ```
- [ ] Check response JSON:
  ```json
  {
    "success": true,
    "results": {
      "totalStrategies": X,
      "remindersSent": Y,
      "errors": 0
    }
  }
  ```
- [ ] Check Resend Dashboard for sent emails
- [ ] Check user's inbox for reminder email

**Expected Result**: Reminder email with next step details and progress bar

### Test 3: Email Preview (Optional) ⏱️ 2 minutes

- [ ] Run React Email dev server:
  ```bash
  npx email dev
  ```
- [ ] Open browser to `http://localhost:3000`
- [ ] Preview both email templates
- [ ] Verify styling and content

## 🚀 Production Deployment

### Deploy to Vercel ⏱️ 5 minutes

- [ ] Commit all changes:
  ```bash
  git add .
  git commit -m "Add email automation engine"
  git push
  ```
- [ ] Vercel auto-deploys (if connected to GitHub)
- [ ] Or manually deploy:
  ```bash
  vercel --prod
  ```
- [ ] Verify cron jobs are configured:
  - Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
  - Should see two cron jobs listed
- [ ] Update Clerk webhook URL to production:
  ```
  https://bonus-cyan.vercel.app/api/webhooks/clerk
  ```

### Verify Production ⏱️ 3 minutes

- [ ] Register a new user on production site
- [ ] Check Clerk webhook logs (should show 200)
- [ ] Check Resend dashboard (should show email sent)
- [ ] Verify email received
- [ ] Wait for cron job to run (or trigger manually)
- [ ] Verify reminder emails work in production

## 📊 Monitoring Setup

### Resend Dashboard

- [ ] Bookmark Resend Dashboard
- [ ] Check daily for:
  - Email delivery rates
  - Bounce rates
  - Open rates (if tracking enabled)
  - Error logs

### Clerk Webhook Logs

- [ ] Bookmark Clerk Webhooks page
- [ ] Monitor for:
  - Failed webhook deliveries
  - Response times
  - Error messages

### Vercel Logs

- [ ] Check Vercel Function Logs for:
  - Cron job execution
  - Error messages
  - Performance metrics

## 🔍 Verification Checklist

### Welcome Email Flow
- [ ] New user registers → User created in database
- [ ] Clerk webhook fires → /api/webhooks/clerk receives event
- [ ] Welcome email sent → User receives email
- [ ] Email displays correctly → Dark theme with teal accents
- [ ] Dashboard link works → Redirects to /dashboard

### Reminder Email Flow
- [ ] Cron job runs daily → /api/cron/reminders executes
- [ ] Queries incomplete strategies → Finds users inactive 7+ days
- [ ] Sends reminder emails → Users receive emails
- [ ] Email displays correctly → Shows next step and progress
- [ ] Dashboard link works → Redirects to /dashboard

## 🐛 Troubleshooting

### Issue: "RESEND_API_KEY not configured"
- [ ] Check `.env.local` has the key
- [ ] Restart dev server
- [ ] For production, check Vercel environment variables

### Issue: "Invalid signature" (Clerk webhook)
- [ ] Verify `CLERK_WEBHOOK_SECRET` matches Clerk dashboard
- [ ] Check webhook URL is correct
- [ ] Review Clerk webhook logs for details

### Issue: Emails not arriving
- [ ] Check spam folder
- [ ] Verify sender address (use `onboarding@resend.dev` for testing)
- [ ] Check Resend dashboard for delivery status
- [ ] For production, verify domain in Resend

### Issue: Cron job not running
- [ ] Check `vercel.json` is committed
- [ ] Verify cron jobs in Vercel dashboard
- [ ] Check Vercel function logs
- [ ] Test with manual trigger first

## 📚 Documentation Reference

- **Quick Start**: `EMAIL_QUICKSTART.md` - 5-minute setup guide
- **Full Documentation**: `EMAIL_AUTOMATION_ENGINE.md` - Complete technical docs
- **Implementation Summary**: `EMAIL_IMPLEMENTATION_SUMMARY.md` - What was built
- **This Checklist**: `EMAIL_SETUP_CHECKLIST.md` - Step-by-step setup

## 🎯 Success Criteria

Your email automation is fully operational when:

✅ New users receive welcome emails within seconds of registration
✅ Inactive users receive reminder emails daily (if criteria met)
✅ Emails display correctly with dark theme and teal accents
✅ All links work and redirect to correct pages
✅ No errors in Resend, Clerk, or Vercel logs
✅ Email delivery rate is >95%
✅ Cron jobs run successfully every day

## 🎉 Next Steps After Setup

1. **Monitor Performance**
   - Check Resend dashboard weekly
   - Review open/click rates
   - Adjust content based on engagement

2. **Optimize Content**
   - A/B test subject lines
   - Experiment with send times
   - Personalize content further

3. **Expand Automation**
   - Add milestone celebration emails
   - Create multi-step drip campaigns
   - Send deadline reminders for minimum spend

4. **Gather Feedback**
   - Survey users about email frequency
   - Ask what content is most helpful
   - Iterate based on responses

---

## 📞 Need Help?

- Check documentation files listed above
- Review Resend docs: https://resend.com/docs
- Review Clerk webhook docs: https://clerk.com/docs/webhooks
- Check server logs for detailed error messages

**Good luck! Your email automation will significantly boost user engagement and retention.** 🚀
