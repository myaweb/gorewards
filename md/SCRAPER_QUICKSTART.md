# Web Scraper Quick Start Guide

## 🚀 Test the Scraper in 5 Minutes

### Step 1: Verify Installation
```bash
# Check if cheerio is installed
npm list cheerio

# If not installed, run:
npm install cheerio
```

### Step 2: Test Locally
```bash
# Start development server
npm run dev

# In another terminal, trigger the scraper
curl -X POST http://localhost:3000/api/cron/update-cards \
  -H "Authorization: Bearer sk_cron_secure_random_key_2024_production"
```

### Step 3: Check Response
You should see:
```json
{
  "success": true,
  "message": "Card database updated successfully",
  "results": {
    "totalCards": 0,
    "created": 0,
    "updated": 0,
    "errors": 0,
    "banks": []
  },
  "duration": "1234ms",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Note**: `totalCards: 0` is expected initially because the placeholder URLs won't return real data.

### Step 4: Update Scraper Configuration

Open `app/api/cron/update-cards/route.ts` and update the scraper configs with real bank URLs and selectors.

**Example for TD Bank**:
1. Visit https://www.td.com/ca/en/personal-banking/products/credit-cards
2. Open browser DevTools (F12)
3. Find the CSS selectors for:
   - Card container
   - Card name
   - Welcome bonus
   - Minimum spend
   - Annual fee

4. Update the config:
```typescript
{
  bank: 'TD',
  url: 'https://www.td.com/ca/en/personal-banking/products/credit-cards',
  selectors: {
    cardContainer: '.actual-card-selector',
    cardName: '.actual-name-selector',
    welcomeBonus: '.actual-bonus-selector',
    minimumSpend: '.actual-spend-selector',
    annualFee: '.actual-fee-selector',
  },
  parser: parseCardData,
}
```

### Step 5: Test Again
```bash
curl -X POST http://localhost:3000/api/cron/update-cards \
  -H "Authorization: Bearer sk_cron_secure_random_key_2024_production"
```

Now you should see cards being scraped and added to the database!

## 🔍 Finding CSS Selectors

### Method 1: Browser DevTools
1. Right-click on the card element → Inspect
2. Look at the HTML structure
3. Find unique classes or IDs
4. Test in console: `document.querySelectorAll('.your-selector')`

### Method 2: Cheerio Playground
```javascript
// Test your selectors
const cheerio = require('cheerio')
const $ = cheerio.load(html)

console.log($('.card-container').length) // How many cards?
console.log($('.card-name').first().text()) // First card name
```

### Method 3: Copy Selector
1. Right-click element in DevTools
2. Copy → Copy selector
3. Simplify the selector (remove unnecessary parts)

## 🎯 Common Selector Patterns

### Card Container
```css
.card-product
.product-card
.credit-card-item
[data-card-id]
```

### Card Name
```css
h2.card-title
.product-name
.card-heading
[data-card-name]
```

### Welcome Bonus
```css
.welcome-bonus
.bonus-points
.offer-amount
.promotion-text
```

### Minimum Spend
```css
.spend-requirement
.minimum-spend
.spend-threshold
.qualification-amount
```

## 🐛 Debugging Tips

### Check What's Being Scraped
Add logging to the parser:
```typescript
$(config.selectors.cardContainer).each((_, element) => {
  const cardName = $(element).find(config.selectors.cardName).text().trim()
  console.log('Found card:', cardName) // Debug log
  
  const welcomeBonusText = $(element).find(config.selectors.welcomeBonus).text().trim()
  console.log('Bonus text:', welcomeBonusText) // Debug log
})
```

### Test Number Extraction
```typescript
console.log(extractNumber('50,000 points')) // Should be 50000
console.log(extractNumber('$3,000')) // Should be 3000
console.log(extractNumber('Earn up to 25000 bonus points')) // Should be 25000
```

### Verify Database Updates
```bash
# Open Prisma Studio
npx prisma studio

# Check the Card and CardBonus tables
```

## 📅 Setting Up Cron Job

### Create vercel.json
```json
{
  "crons": [
    {
      "path": "/api/cron/update-cards",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Schedule Options
- `0 2 * * *` - Daily at 2 AM
- `0 */12 * * *` - Every 12 hours
- `0 0 * * 0` - Weekly on Sunday
- `0 0 1 * *` - Monthly on 1st

### Deploy to Vercel
```bash
# Add CRON_SECRET to Vercel
vercel env add CRON_SECRET production

# Deploy
vercel --prod
```

### Verify Cron Job
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Cron Jobs" tab
4. See scheduled runs and logs

## 🔒 Security Checklist

- [x] CRON_SECRET added to environment variables
- [x] Authorization header verification in API route
- [ ] Rate limiting implemented (optional)
- [ ] User-Agent header set
- [ ] Error messages don't expose internals
- [ ] Logs don't contain sensitive data

## 🎨 Testing Error States

### Test No Cards Found
1. Select a goal with a point type not in database (e.g., Marriott Bonvoy)
2. Submit the form
3. Should see beautiful error message: "We are currently updating our database for Marriott Bonvoy"

### Test Insufficient Spending
1. Enter $0 for all spending categories
2. Submit the form
3. Should see error: "Spending Required"

### Test Success State
1. Select Aeroplan goal
2. Enter spending amounts
3. Should see roadmap timeline

## 📊 Monitoring

### Check Scraper Logs
```bash
# Vercel CLI
vercel logs

# Filter for cron job
vercel logs --filter="cron/update-cards"
```

### Database Stats
```sql
-- Count cards by bank
SELECT bank, COUNT(*) as card_count
FROM "Card"
GROUP BY bank;

-- Recent updates
SELECT name, bank, "updatedAt"
FROM "Card"
ORDER BY "updatedAt" DESC
LIMIT 10;

-- Cards with bonuses
SELECT c.name, cb."bonusPoints", cb."pointType"
FROM "Card" c
JOIN "CardBonus" cb ON c.id = cb."cardId"
WHERE cb."isActive" = true;
```

## 🚨 Common Issues

### Issue: 401 Unauthorized
**Solution**: Check CRON_SECRET matches in .env.local and request header

### Issue: 0 Cards Scraped
**Solution**: 
1. Check if URLs are accessible
2. Verify CSS selectors are correct
3. Add console.log to see what's being found

### Issue: Wrong Data Extracted
**Solution**:
1. Test selectors in browser console
2. Check number extraction regex
3. Verify point type inference logic

### Issue: Database Errors
**Solution**:
1. Check Prisma schema matches
2. Verify enum values are valid
3. Ensure required fields are provided

## 🎓 Next Steps

### Immediate
1. [ ] Test scraper locally
2. [ ] Update CSS selectors for one bank
3. [ ] Verify data in Prisma Studio
4. [ ] Deploy to Vercel

### Short-term
1. [ ] Add all major Canadian banks
2. [ ] Set up cron schedule
3. [ ] Monitor scraper performance
4. [ ] Refine selectors based on results

### Long-term
1. [ ] Add change detection
2. [ ] Implement notifications
3. [ ] Scrape multiplier tables
4. [ ] Download card images

---

**Ready to scrape?** Start with Step 1 and work your way through! 🚀
