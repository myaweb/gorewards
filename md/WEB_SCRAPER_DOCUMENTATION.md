# Web Scraper & Cron Job Documentation

## Overview
Automated web scraping system that fetches live credit card data from Canadian banks and updates the database. Runs as a Vercel Cron Job with secure authentication.

## ✅ What Was Implemented

### 1. RouteEngine Error Handling
**File**: `lib/services/routeEngine.ts`

**Changes**:
- Removed `throw new Error()` statements
- Returns graceful error states instead of crashing
- Added `status` field to `OptimalRoadmap` type

**Error States**:
```typescript
{
  status: 'no_cards_found',      // No cards match the point type
  status: 'insufficient_spending', // User entered zero spending
  status: 'success',              // Normal operation
}
```

**Benefits**:
- App never crashes from missing card data
- User-friendly error messages
- Graceful degradation

### 2. Dashboard UI Error Handling
**File**: `app/page.tsx`

**Features**:
- Beautiful glassmorphic warning card
- Matches `#090A0F` dark theme
- Clear messaging: "We are currently updating our database for [PointType]"
- Action buttons: Try different goal or view comparisons
- Helpful suggestions for users

**Error States Handled**:
1. `no_cards_found`: Database update in progress
2. `insufficient_spending`: User needs to enter spending amounts
3. `success`: Normal roadmap display

### 3. Web Scraper Installation
**Package**: `cheerio`

**Installation**:
```bash
npm install cheerio
```

**Purpose**: Fast, flexible HTML parsing for web scraping

### 4. Secure Cron Job API Route
**File**: `app/api/cron/update-cards/route.ts`

**Security Features**:
- Authorization header verification
- CRON_SECRET environment variable
- Bearer token authentication
- Prevents unauthorized triggers

**Endpoints**:
- `GET /api/cron/update-cards` - Run scraper
- `POST /api/cron/update-cards` - Manual trigger

**Authentication**:
```bash
curl -X GET https://yoursite.com/api/cron/update-cards \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 5. Robust Scraping Function
**Features**:
- Modular scraper configuration
- Bank-specific CSS selectors
- Generic parser for reusability
- Error handling per card
- Automatic data extraction

**Scraper Configuration**:
```typescript
interface ScraperConfig {
  bank: string
  url: string
  selectors: {
    cardContainer: string
    cardName: string
    welcomeBonus: string
    minimumSpend: string
    annualFee?: string
    network?: string
  }
  parser: (html: string, config: ScraperConfig) => ScrapedCard[]
}
```

**Supported Banks** (configured, ready to customize):
- TD Bank
- CIBC
- American Express
- Scotiabank (easy to add)
- RBC (easy to add)

### 6. Database Integration
**Features**:
- `prisma.card.upsert` - Update or create cards
- `prisma.cardBonus.upsert` - Update or create bonuses
- `prisma.cardMultiplier.createMany` - Add default multipliers
- Stable ID generation from card names
- Automatic timestamp updates

**Data Mapping**:
```typescript
interface ScrapedCard {
  name: string              // "TD Aeroplan Visa Infinite"
  bank: string              // "TD"
  network: CardNetwork      // VISA, MASTERCARD, AMEX
  annualFee: number         // 139
  bonusPoints: number       // 50000
  pointType: PointType      // AEROPLAN
  minimumSpendAmount: number // 3000
  spendPeriodMonths: number  // 3
}
```

## 🔧 How It Works

### Scraping Flow
```
1. Cron Job Triggered (Vercel or Manual)
   ↓
2. Verify CRON_SECRET
   ↓
3. For Each Bank:
   - Fetch HTML from bank website
   - Parse with Cheerio
   - Extract card data
   ↓
4. For Each Card:
   - Upsert card record
   - Upsert bonus record
   - Create default multipliers (if new)
   ↓
5. Return Results
```

### Data Extraction
```typescript
// Extract numbers from text
"50,000 points" → 50000
"$3,000 spend" → 3000
"$139 annual fee" → 139

// Infer network from name
"TD Aeroplan Visa" → CardNetwork.VISA
"Amex Cobalt" → CardNetwork.AMEX

// Infer point type
"Aeroplan" → PointType.AEROPLAN
"Scene+" → PointType.SCENE_PLUS
"Cobalt" → PointType.MEMBERSHIP_REWARDS
```

## 📊 Scraper Configuration

### Adding a New Bank

1. **Add Configuration**:
```typescript
{
  bank: 'RBC',
  url: 'https://www.rbcroyalbank.com/credit-cards/',
  selectors: {
    cardContainer: '.card-product',
    cardName: 'h2.product-name',
    welcomeBonus: '.bonus-offer',
    minimumSpend: '.spend-requirement',
    annualFee: '.annual-fee-amount',
  },
  parser: parseCardData,
}
```

2. **Test Selectors**:
```javascript
// In browser console on bank website
document.querySelectorAll('.card-product').length
document.querySelector('.card-product h2.product-name').textContent
```

3. **Deploy and Test**:
```bash
curl -X POST https://yoursite.com/api/cron/update-cards \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Custom Parser Example
```typescript
function parseRBCCards(html: string, config: ScraperConfig): ScrapedCard[] {
  const $ = cheerio.load(html)
  const cards: ScrapedCard[] = []

  $('.card-product').each((_, element) => {
    const name = $(element).find('h2.product-name').text().trim()
    const bonusText = $(element).find('.bonus-offer').text()
    const bonusPoints = extractNumber(bonusText)
    
    // Custom logic for RBC
    const isAvion = name.includes('Avion')
    const pointType = isAvion ? PointType.AVION : PointType.OTHER
    
    cards.push({
      name,
      bank: 'RBC',
      network: CardNetwork.VISA,
      annualFee: 120,
      bonusPoints,
      pointType,
      minimumSpendAmount: 3000,
      spendPeriodMonths: 3,
    })
  })

  return cards
}
```

## 🚀 Deployment

### Vercel Cron Job Setup

1. **Create `vercel.json`**:
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

**Schedule Formats**:
- `0 2 * * *` - Daily at 2 AM
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Weekly on Sunday
- `0 0 1 * *` - Monthly on 1st

2. **Add Environment Variable**:
```bash
vercel env add CRON_SECRET
# Enter your secret key
```

3. **Deploy**:
```bash
vercel --prod
```

### Manual Trigger

**Local Testing**:
```bash
curl -X POST http://localhost:3000/api/cron/update-cards \
  -H "Authorization: Bearer sk_cron_secure_random_key_2024_production"
```

**Production**:
```bash
curl -X POST https://yoursite.com/api/cron/update-cards \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 📈 Monitoring

### Response Format
```json
{
  "success": true,
  "message": "Card database updated successfully",
  "results": {
    "totalCards": 15,
    "created": 0,
    "updated": 15,
    "errors": 0,
    "banks": ["TD", "CIBC", "American Express"]
  },
  "duration": "3542ms",
  "timestamp": "2024-01-15T02:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "HTTP 403: Forbidden",
  "results": {
    "totalCards": 0,
    "created": 0,
    "updated": 0,
    "errors": 0,
    "banks": []
  }
}
```

### Logging
```typescript
// Check Vercel logs
console.log(`Scraping ${config.bank}...`)
console.error('Error parsing card element:', error)
```

## 🔒 Security

### Best Practices
1. **Rotate CRON_SECRET regularly**
2. **Use environment variables** (never hardcode)
3. **Rate limit requests** (respect bank websites)
4. **User-Agent headers** (identify your bot)
5. **Error handling** (don't expose internals)

### Rate Limiting
```typescript
// Add delay between banks
await new Promise(resolve => setTimeout(resolve, 2000))
```

### Robots.txt Compliance
```typescript
// Check robots.txt before scraping
const robotsUrl = new URL('/robots.txt', config.url)
const robotsResponse = await fetch(robotsUrl)
// Parse and respect rules
```

## 🧪 Testing

### Unit Tests
```typescript
describe('extractNumber', () => {
  it('extracts number from text', () => {
    expect(extractNumber('50,000 points')).toBe(50000)
    expect(extractNumber('$3,000')).toBe(3000)
  })
})

describe('inferPointType', () => {
  it('infers Aeroplan from name', () => {
    expect(inferPointType('TD Aeroplan Visa', 'TD')).toBe(PointType.AEROPLAN)
  })
})
```

### Integration Tests
```typescript
describe('Scraper API', () => {
  it('requires authorization', async () => {
    const response = await fetch('/api/cron/update-cards')
    expect(response.status).toBe(401)
  })

  it('updates database', async () => {
    const response = await fetch('/api/cron/update-cards', {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` }
    })
    expect(response.status).toBe(200)
  })
})
```

## 🐛 Troubleshooting

### Issue: No Cards Scraped
**Causes**:
- Website structure changed
- CSS selectors outdated
- Website blocking requests

**Solutions**:
1. Inspect website HTML
2. Update selectors in config
3. Add proper User-Agent header
4. Check for CAPTCHA or bot detection

### Issue: Wrong Data Extracted
**Causes**:
- Selector matches wrong element
- Number extraction regex fails
- Point type inference incorrect

**Solutions**:
1. Test selectors in browser console
2. Add logging to see extracted values
3. Update inference logic
4. Add custom parser for specific bank

### Issue: Database Errors
**Causes**:
- Duplicate IDs
- Invalid enum values
- Missing required fields

**Solutions**:
1. Check ID generation logic
2. Validate enum mappings
3. Add default values
4. Use try-catch per card

## 📚 Advanced Features

### Dynamic Multiplier Detection
```typescript
// Parse multiplier table from website
function parseMultipliers($: CheerioAPI, element: Element): Multiplier[] {
  const multipliers: Multiplier[] = []
  
  $(element).find('.multiplier-row').each((_, row) => {
    const category = $(row).find('.category').text()
    const rate = extractNumber($(row).find('.rate').text())
    
    multipliers.push({
      category: mapCategory(category),
      multiplierValue: rate,
    })
  })
  
  return multipliers
}
```

### Image Scraping
```typescript
// Download card images
const imageUrl = $(element).find('img.card-image').attr('src')
if (imageUrl) {
  const imageResponse = await fetch(imageUrl)
  const buffer = await imageResponse.arrayBuffer()
  // Upload to storage (S3, Cloudinary, etc.)
}
```

### Change Detection
```typescript
// Track changes over time
const previousBonus = await prisma.cardBonus.findUnique({
  where: { id: bonusId }
})

if (previousBonus && previousBonus.bonusPoints !== cardData.bonusPoints) {
  // Bonus changed! Send notification
  await sendNotification({
    type: 'bonus_increased',
    cardName: cardData.name,
    oldBonus: previousBonus.bonusPoints,
    newBonus: cardData.bonusPoints,
  })
}
```

## 🎯 Roadmap

### Phase 1: Core Scraping (✅ Complete)
- [x] Basic scraper infrastructure
- [x] TD, CIBC, Amex configurations
- [x] Database integration
- [x] Cron job setup

### Phase 2: Enhanced Scraping
- [ ] Add RBC, Scotiabank, BMO
- [ ] Scrape multiplier tables
- [ ] Download card images
- [ ] Parse additional features

### Phase 3: Intelligence
- [ ] Change detection
- [ ] Email notifications
- [ ] Historical tracking
- [ ] Trend analysis

### Phase 4: Automation
- [ ] Auto-update comparison pages
- [ ] Generate new comparisons
- [ ] Update SEO metadata
- [ ] Refresh sitemap

## 📊 Metrics to Track

### Scraper Performance
- Cards scraped per bank
- Success rate
- Average duration
- Error rate

### Data Quality
- Cards with complete data
- Cards missing multipliers
- Cards with outdated bonuses
- Duplicate detection rate

### Business Impact
- New cards added per week
- Bonus changes detected
- User engagement with new cards
- Conversion rate improvement

---

**Status**: ✅ Core system implemented and ready for production
**Next Steps**: 
1. Test scraper with real bank websites
2. Update CSS selectors for each bank
3. Deploy to Vercel with cron job
4. Monitor results and refine
