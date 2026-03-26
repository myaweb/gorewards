# Email Automation - Quick Start Guide

Get your email automation running in 5 minutes.

## Step 1: Install Svix (1 min)

```bash
npm install svix
```

## Step 2: Get Resend API Key (2 min)

1. Go to [resend.com](https://resend.com) and sign up
2. Click "API Keys" in sidebar
3. Create new API key
4. Copy the key (starts with `re_`)

Add to `.env.local`:
```env
RESEND_API_KEY="re_your_actual_api_key_here"
```

## Step 3: Configure Clerk Webhook (2 min)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to "Webhooks" in sidebar
4. Click "Add Endpoint"
5. Enter URL: `https://your-domain.vercel.app/api/webhooks/clerk`
6. Subscribe to event: `user.created`
7. Click "Create"
8. Copy the "Signing Secret" (starts with `whsec_`)

Add to `.env.local`:
```env
CLERK_WEBHOOK_SECRET="whsec_your_actual_secret_here"
```

## Step 4: Update Email Sender Address

In both files, change the `from` address:

**File 1**: `app/api/cron/reminders/route.ts`
```typescript
// Line ~80
from: 'Rewards Roadmap <noreply@yourdomain.com>', // Change this
```

**File 2**: `app/api/webhooks/clerk/route.ts`
```typescript
// Line ~40
from: 'Rewards Roadmap <noreply@yourdomain.com>', // Change this
```

**Note**: For development, you can use `onboarding@resend.dev` (Resend's test address)

## Step 5: Test Welcome Email

1. Deploy to Vercel or run locally:
```bash
npm run dev
```

2. Register a new user through your app

3. Check:
   - Clerk webhook logs (should show 200 response)
   - Resend dashboard (should show email sent)
   - User's inbox (should receive welcome email)

## Step 6: Test Reminder Email (Optional)

Manually trigger the cron job:

```bash
curl -X POST http://localhost:3000/api/cron/reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Replace `YOUR_CRON_SECRET` with the value from `.env.local`

## Step 7: Setup Vercel Cron (Production)

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 10 * * *"
    }
  ]
}
```

This runs daily at 10:00 AM UTC.

Deploy:
```bash
vercel --prod
```

## Verify Everything Works

### ✅ Welcome Email Checklist
- [ ] New user registers
- [ ] User created in database
- [ ] Welcome email received
- [ ] Email displays correctly (dark theme, teal buttons)
- [ ] Dashboard link works

### ✅ Reminder Email Checklist
- [ ] Cron job runs successfully
- [ ] Finds incomplete strategies
- [ ] Sends reminder emails
- [ ] Email displays correctly
- [ ] Dashboard link works

## Common Issues

### "RESEND_API_KEY not configured"
- Make sure `.env.local` has the key
- Restart dev server after adding env vars
- For Vercel, add to Environment Variables in dashboard

### "Invalid signature" (Clerk webhook)
- Double-check `CLERK_WEBHOOK_SECRET` matches Clerk dashboard
- Make sure webhook URL is correct
- Check Clerk webhook logs for details

### Emails not arriving
- Check spam folder
- Verify domain in Resend (for production)
- Use `onboarding@resend.dev` for testing
- Check Resend dashboard for delivery status

## Next Steps

1. **Verify Domain**: Add your domain in Resend for production emails
2. **Customize Content**: Edit email templates in `emails/` folder
3. **Monitor Performance**: Check Resend dashboard for open/click rates
4. **Adjust Timing**: Change reminder frequency in cron job logic

## Quick Reference

### Environment Variables
```env
RESEND_API_KEY="re_..."
CLERK_WEBHOOK_SECRET="whsec_..."
CRON_SECRET="your_secret"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### API Endpoints
- Welcome Email: `POST /api/webhooks/clerk` (triggered by Clerk)
- Reminder Email: `POST /api/cron/reminders` (triggered by cron)

### Files Created
```
emails/
  ├── WelcomeEmail.tsx
  └── StepReminderEmail.tsx
app/api/
  ├── cron/reminders/route.ts
  └── webhooks/clerk/route.ts
```

## Support

Need help? Check:
- Full documentation: `EMAIL_AUTOMATION_ENGINE.md`
- Resend docs: https://resend.com/docs
- Clerk webhook docs: https://clerk.com/docs/webhooks

---

**That's it!** Your email automation is ready to bring users back and boost engagement. 🚀
