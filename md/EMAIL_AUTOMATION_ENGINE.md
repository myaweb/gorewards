# Email Automation Engine Documentation

## Overview

The Email Automation Engine brings users back to their Dashboard to complete their roadmap steps through strategic email reminders and onboarding sequences. Built with Resend and React Email, it maintains our premium dark theme (#090A0F) with glowing teal accents.

## Architecture

### Components

1. **Email Templates** (`emails/`)
   - `WelcomeEmail.tsx` - Sent when new users register
   - `StepReminderEmail.tsx` - Sent to remind users about incomplete strategies

2. **Cron Job** (`app/api/cron/reminders/route.ts`)
   - Runs periodically (recommended: daily)
   - Queries incomplete SavedStrategy records
   - Sends reminders to users inactive for 7+ days

3. **Clerk Webhook** (`app/api/webhooks/clerk/route.ts`)
   - Listens for `user.created` events
   - Creates user in database
   - Sends welcome email automatically

## Email Templates

### Welcome Email

**Trigger**: New user registration via Clerk webhook

**Content**:
- Warm welcome message
- Feature highlights (Smart Optimization, Track Progress, Maximize Bonuses)
- 4-step getting started guide
- Pro tips for success
- CTA button to dashboard

**Design**: Premium fintech layout with gradient header, feature cards, and step-by-step instructions

### Step Reminder Email

**Trigger**: Cron job (users inactive for 7+ days with incomplete strategies)

**Content**:
- Personalized greeting with goal name
- Next step details (month, action, card name)
- Progress bar showing completion percentage
- CTA button to dashboard
- Pro tips for card applications

**Design**: Action-focused layout with prominent next step card and visual progress indicator

## Setup Instructions

### 1. Install Dependencies

Already installed:
```bash
npm install resend @react-email/components @react-email/render
```

### 2. Configure Resend

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add to `.env.local`:
```env
RESEND_API_KEY="re_your_api_key_here"
```

4. **Important**: Update the `from` address in both email routes:
   - `app/api/cron/reminders/route.ts`
   - `app/api/webhooks/clerk/route.ts`
   
   Change from:
   ```typescript
   from: 'Rewards Roadmap <onboarding@resend.dev>'
   ```
   
   To your verified domain:
   ```typescript
   from: 'Rewards Roadmap <noreply@yourdomain.com>'
   ```

### 3. Configure Clerk Webhook

1. Go to Clerk Dashboard → Webhooks
2. Create new webhook endpoint
3. Set URL: `https://yourdomain.com/api/webhooks/clerk`
4. Subscribe to event: `user.created`
5. Copy the webhook secret
6. Add to `.env.local`:
```env
CLERK_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

7. Install Svix for webhook verification:
```bash
npm install svix
```

### 4. Configure Vercel Cron Job

Add to `vercel.json`:
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

Or use external cron service (cron-job.org, EasyCron):
```bash
curl -X POST https://yourdomain.com/api/cron/reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Security

### Cron Job Authentication

Both cron routes are secured with `CRON_SECRET`:

```typescript
Authorization: Bearer YOUR_CRON_SECRET
```

Unauthorized requests return 401.

### Webhook Verification

Clerk webhook uses Svix for signature verification:
- Validates `svix-id`, `svix-timestamp`, `svix-signature` headers
- Prevents replay attacks
- Ensures webhook authenticity

## Email Logic

### Welcome Email Logic

```typescript
// Triggered by: user.created webhook
// Sent to: New user's primary email
// Timing: Immediately upon registration
// Content: Personalized with user's first name or username
```

### Reminder Email Logic

```typescript
// Triggered by: Cron job
// Sent to: Users with incomplete strategies
// Timing: If no activity for 7+ days
// Content: Next step details and progress
// Throttling: Updates strategy.updatedAt to prevent duplicates
```

### Reminder Criteria

A reminder is sent if:
1. Strategy `isCompleted` is `false`
2. Strategy `updatedAt` is 7+ days ago
3. Roadmap has at least one step

## Testing

### Test Welcome Email

1. Register a new user through Clerk
2. Check webhook logs in Clerk Dashboard
3. Verify email delivery in Resend Dashboard
4. Check user created in database

### Test Reminder Email

Manual trigger:
```bash
curl -X POST http://localhost:3000/api/cron/reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Or use Vercel CLI:
```bash
vercel env pull .env.local
npm run dev
# Then trigger manually
```

### Preview Emails Locally

Create `emails/preview.tsx`:
```typescript
import WelcomeEmail from './WelcomeEmail'
import StepReminderEmail from './StepReminderEmail'

export default function Preview() {
  return (
    <div>
      <WelcomeEmail
        userName="John Doe"
        userEmail="john@example.com"
        dashboardUrl="http://localhost:3000/dashboard"
      />
      <StepReminderEmail
        userName="John Doe"
        goalName="Aeroplan Points"
        nextStepMonth={2}
        nextStepAction="APPLY"
        nextStepCardName="TD Aeroplan Visa Infinite"
        totalProgress={33}
        dashboardUrl="http://localhost:3000/dashboard"
      />
    </div>
  )
}
```

Run React Email dev server:
```bash
npx email dev
```

## Monitoring

### Cron Job Response

```json
{
  "success": true,
  "message": "Reminder emails processed successfully",
  "results": {
    "totalStrategies": 10,
    "remindersSent": 3,
    "errors": 0
  },
  "duration": "1234ms",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### Webhook Response

```json
{
  "success": true,
  "message": "User created and welcome email sent",
  "userId": "clxxx123456"
}
```

### Check Resend Dashboard

- Email delivery status
- Open rates
- Click rates
- Bounce rates

## Customization

### Adjust Reminder Frequency

In `app/api/cron/reminders/route.ts`:

```typescript
// Change from 7 days to 3 days
const daysSinceUpdate = Math.floor(
  (Date.now() - new Date(strategy.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
)

return daysSinceUpdate >= 3 // Changed from 7
```

### Add More Email Types

1. Create new template in `emails/`
2. Add trigger logic in cron job or webhook
3. Use same styling patterns for consistency

### Customize Email Content

All styles are inline for email client compatibility. Colors match our brand:
- Background: `#090A0F`
- Content: `#0F1117`
- Primary: `#00FFFF` (teal)
- Text: `#FFFFFF` / `#A0AEC0`

## Troubleshooting

### Emails Not Sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify domain is verified in Resend
3. Check Resend dashboard for errors
4. Review server logs for error messages

### Webhook Not Triggering

1. Verify webhook URL is correct in Clerk
2. Check `CLERK_WEBHOOK_SECRET` matches
3. Review Clerk webhook logs
4. Test with Clerk webhook testing tool

### Duplicate Emails

- Cron job updates `strategy.updatedAt` after sending
- This prevents sending multiple reminders within 7 days
- Check cron job isn't running too frequently

## Future Enhancements

1. **Track Completed Steps**: Store which steps are checked off to send more targeted reminders
2. **Email Preferences**: Let users choose reminder frequency
3. **A/B Testing**: Test different subject lines and content
4. **Milestone Emails**: Celebrate when users complete strategies
5. **Re-engagement Campaign**: Multi-step email sequence for inactive users
6. **Card Application Reminders**: Remind about minimum spend deadlines

## Environment Variables Summary

```env
# Required
RESEND_API_KEY="re_your_api_key"
CLERK_WEBHOOK_SECRET="whsec_your_secret"
CRON_SECRET="your_cron_secret"

# Optional
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

## API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/cron/reminders` | GET/POST | Bearer Token | Send reminder emails |
| `/api/webhooks/clerk` | POST | Svix Signature | Handle Clerk events |

## Dependencies

```json
{
  "resend": "^3.0.0",
  "@react-email/components": "^0.0.14",
  "@react-email/render": "^0.0.12",
  "svix": "^1.15.0"
}
```

## Support

For issues or questions:
1. Check Resend documentation: https://resend.com/docs
2. Check Clerk webhook docs: https://clerk.com/docs/webhooks
3. Review server logs for detailed error messages
4. Test with manual triggers before deploying cron jobs
