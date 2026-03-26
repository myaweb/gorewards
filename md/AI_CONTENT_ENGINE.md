# AI-Powered Content Engine Documentation

## Overview

An AI-powered content generation system that creates unique, SEO-optimized comparison verdicts for every credit card comparison page using OpenAI's GPT-4o-mini model. This dramatically improves search engine rankings by providing fresh, relevant content for each comparison.

## Features

### 1. Automatic Content Generation
- Generates 300-word expert analysis for each card comparison
- Uses GPT-4o-mini for cost-effective, high-quality content
- Caches generated content in database for performance
- Fallback gracefully if AI generation fails

### 2. SEO Optimization
- Unique content for every comparison page
- Structured HTML with semantic tags (h3, p, strong, ul, li)
- Engaging, conversational tone
- Keyword-rich without keyword stuffing
- Helps rank for long-tail search queries

### 3. Smart Caching
- Stores generated verdicts in database
- Serves cached content instantly on subsequent visits
- Reduces API costs
- Consistent content across page loads

### 4. Beautiful Presentation
- Tailwind Typography plugin for professional formatting
- Dark theme styling (#090A0F) with teal accents
- Responsive design
- Glassmorphic card design

## Architecture

### Database Schema

```prisma
model CardComparison {
  id            String   @id @default(cuid())
  slug          String   @unique
  cardAId       String
  cardBId       String
  aiVerdictText String   @db.Text
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([slug])
  @@index([cardAId])
  @@index([cardBId])
}
```

### Files Created

```
app/
├── actions/
│   └── ai.actions.ts              # Server actions for AI generation
├── compare/[slug]/
│   └── page.tsx                   # Updated with AI verdict integration
components/
└── card-comparison.tsx            # Updated to display AI verdict
prisma/
└── schema.prisma                  # Added CardComparison model
tailwind.config.ts                 # Added typography plugin
```

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create new secret key
5. Copy the key (starts with `sk-`)

### 2. Add to Environment Variables

**Local (.env.local)**:
```env
OPENAI_API_KEY="sk-your_actual_api_key_here"
```

**Production (Vercel)**:
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add `OPENAI_API_KEY` with your key
3. Redeploy

### 3. Database Migration

Already done! Schema was pushed:
```bash
npx prisma db push
```

### 4. Install Dependencies

Already installed:
```bash
npm install openai @tailwindcss/typography
```

## How It Works

### Generation Flow

```
User visits /compare/card-a-vs-card-b
    ↓
Server checks CardComparison table for slug
    ↓
If exists:
  → Serve cached verdict (instant)
    ↓
If not exists:
  → Call generateComparisonVerdict()
  → OpenAI generates 300-word analysis
  → Save to database
  → Render on page
    ↓
User sees AI-powered expert analysis
```

### AI Prompt Structure

**System Prompt**:
```
You are a Canadian financial expert specializing in credit card rewards optimization.
Write engaging, professional, and SEO-optimized content that helps readers make informed decisions.
Use HTML formatting with semantic tags (h3, p, strong, ul, li).
Focus on practical advice and clear recommendations.
Keep the tone conversational yet authoritative.
```

**User Prompt** includes:
- Card names and banks
- Annual fees
- Welcome bonuses with requirements
- Top earning rates (multipliers)
- Request for structured response with specific sections

### Content Structure

Generated content includes:
1. **Opening paragraph**: Key difference between cards
2. **Who should choose Card A**: Specific spending profiles
3. **Who should choose Card B**: Specific spending profiles
4. **Final recommendation**: Clear, actionable advice

## API Reference

### Server Actions

#### `generateComparisonVerdict(cardA, cardB, slug)`

Generates or retrieves AI verdict for card comparison.

**Parameters**:
```typescript
cardA: {
  id: string
  name: string
  bank: string
  annualFee: number
  bonuses: Array<{
    bonusPoints: number
    pointType: string
    minimumSpendAmount: number
    spendPeriodMonths: number
  }>
  multipliers: Array<{
    category: string
    multiplierValue: number
  }>
}
cardB: CardData // Same structure as cardA
slug: string // e.g., "amex-cobalt-vs-td-aeroplan"
```

**Returns**:
```typescript
{
  success: boolean
  verdict: string | null
  cached: boolean
  error?: string
}
```

#### `getComparisonVerdict(slug)`

Retrieves existing verdict from database.

**Parameters**:
- `slug`: string

**Returns**:
```typescript
{
  success: boolean
  verdict: string | null
  error?: string
}
```

#### `regenerateVerdict(slug, cardA, cardB)`

Deletes existing verdict and generates new one (admin use).

**Parameters**:
- `slug`: string
- `cardA`: CardData
- `cardB`: CardData

**Returns**: Same as `generateComparisonVerdict`

## Styling

### Tailwind Typography Classes

```tsx
<div className="prose prose-invert prose-cyan max-w-none 
  prose-headings:text-primary 
  prose-headings:font-bold 
  prose-p:text-muted-foreground 
  prose-p:leading-relaxed 
  prose-strong:text-white 
  prose-ul:text-muted-foreground 
  prose-li:text-muted-foreground"
>
  {/* AI-generated HTML content */}
</div>
```

### Custom Styling
- **Background**: Glassmorphic card with border
- **Icon**: Purple-to-teal gradient with Sparkles icon
- **Typography**: Inverted prose with cyan accents
- **Spacing**: Consistent with existing design system

## Cost Optimization

### GPT-4o-mini Pricing
- **Input**: ~$0.15 per 1M tokens
- **Output**: ~$0.60 per 1M tokens
- **Average cost per verdict**: ~$0.002-0.003

### Caching Strategy
- First generation: API call (~$0.003)
- Subsequent visits: Database query (free)
- 99%+ cache hit rate after initial generation

### Cost Estimates
- 1,000 comparisons: ~$3
- 10,000 comparisons: ~$30
- 100,000 comparisons: ~$300

## SEO Benefits

### Unique Content
- Every comparison page has unique AI-generated content
- Avoids duplicate content penalties
- Increases indexable content per page

### Long-Tail Keywords
- AI naturally includes relevant keywords
- Targets specific user queries
- Improves ranking for "Card A vs Card B" searches

### User Engagement
- Engaging, readable content
- Reduces bounce rate
- Increases time on page
- Signals quality to search engines

### Structured Content
- Semantic HTML tags
- Clear headings and sections
- Easy for search engines to parse
- Rich snippets potential

## Testing

### Test AI Generation

1. **Visit a comparison page**:
```
http://localhost:3000/compare/amex-cobalt-vs-td-aeroplan
```

2. **Check for AI verdict section**:
- Should appear after comparison table
- Purple-to-teal gradient icon
- "AI-Powered Expert Analysis" heading
- Formatted HTML content

3. **Verify caching**:
- Refresh page
- Should load instantly (cached)
- Check database for CardComparison record

### Test Without API Key

If `OPENAI_API_KEY` is not set:
- Page still loads normally
- AI verdict section doesn't appear
- No errors thrown
- Graceful degradation

### Manual Testing

```bash
# Check database for generated verdicts
psql $DATABASE_URL -c "SELECT slug, LENGTH(aiVerdictText) as length, createdAt FROM CardComparison;"

# Count total verdicts
psql $DATABASE_URL -c "SELECT COUNT(*) FROM CardComparison;"
```

## Monitoring

### Check Generation Status

**Vercel Logs**:
- Function invocations for AI actions
- OpenAI API response times
- Error messages

**Database Queries**:
```sql
-- Recent verdicts
SELECT slug, createdAt 
FROM "CardComparison" 
ORDER BY createdAt DESC 
LIMIT 10;

-- Verdicts by date
SELECT DATE(createdAt) as date, COUNT(*) as count
FROM "CardComparison"
GROUP BY DATE(createdAt)
ORDER BY date DESC;

-- Average verdict length
SELECT AVG(LENGTH(aiVerdictText)) as avg_length
FROM "CardComparison";
```

### OpenAI Usage

Check usage at [platform.openai.com/usage](https://platform.openai.com/usage):
- Total API calls
- Token usage
- Cost breakdown
- Rate limits

## Troubleshooting

### AI Verdict Not Appearing

**Problem**: No AI section on comparison page

**Solutions**:
1. Check `OPENAI_API_KEY` is set in `.env.local`
2. Restart dev server after adding env var
3. Check browser console for errors
4. Verify OpenAI API key is valid
5. Check Vercel logs for API errors

### Generation Fails

**Problem**: Error generating verdict

**Solutions**:
1. Check OpenAI API key has credits
2. Verify API key permissions
3. Check rate limits (60 requests/minute for GPT-4o-mini)
4. Review error logs for specific message
5. Test with simpler prompt

### Styling Issues

**Problem**: AI content not styled correctly

**Solutions**:
1. Verify `@tailwindcss/typography` is installed
2. Check tailwind.config.ts includes typography plugin
3. Rebuild: `npm run build`
4. Clear browser cache
5. Inspect HTML structure in DevTools

### Database Errors

**Problem**: Can't save verdict to database

**Solutions**:
1. Check DATABASE_URL is correct
2. Verify Prisma schema is pushed
3. Run `npx prisma db push`
4. Check database connection
5. Review Prisma error logs

## Best Practices

### Content Quality

1. **Review Generated Content**
   - Spot-check AI verdicts for accuracy
   - Ensure recommendations make sense
   - Verify no hallucinations

2. **Update Prompts**
   - Refine system prompt based on output quality
   - A/B test different prompt structures
   - Adjust temperature for creativity vs consistency

3. **Monitor Performance**
   - Track user engagement metrics
   - Monitor bounce rates
   - Check time on page
   - Analyze search rankings

### Cost Management

1. **Cache Aggressively**
   - Never regenerate unless necessary
   - Use database caching
   - Consider CDN caching for static content

2. **Batch Operations**
   - Pre-generate verdicts for popular comparisons
   - Use background jobs for bulk generation
   - Avoid real-time generation in production

3. **Monitor Usage**
   - Set up billing alerts in OpenAI dashboard
   - Track API calls per day
   - Optimize prompt length

### SEO Optimization

1. **Content Freshness**
   - Regenerate verdicts when card details change
   - Update annually for date references
   - Add "Last updated" timestamps

2. **Keyword Targeting**
   - Include card names in prompts
   - Target specific user queries
   - Use natural language

3. **Internal Linking**
   - Link to related comparisons
   - Reference specific cards
   - Build topic clusters

## Future Enhancements

### Planned Features

1. **Bulk Generation**
   - Admin tool to pre-generate all comparisons
   - Background job processing
   - Progress tracking

2. **Content Variations**
   - Multiple AI verdicts per comparison
   - A/B testing different versions
   - Personalized based on user data

3. **Enhanced Prompts**
   - Include user reviews
   - Add seasonal promotions
   - Reference current events

4. **Quality Control**
   - AI content moderation
   - Fact-checking against database
   - Human review workflow

5. **Analytics Integration**
   - Track which verdicts drive conversions
   - Measure SEO impact
   - Optimize based on performance

## Environment Variables Summary

```env
# Required for AI content generation
OPENAI_API_KEY="sk-your_api_key"

# Already configured
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

## Dependencies

```json
{
  "openai": "^4.0.0",
  "@tailwindcss/typography": "^0.5.10"
}
```

## Quick Reference

| Action | Command/URL |
|--------|-------------|
| View comparison | `/compare/card-a-vs-card-b` |
| Check database | `SELECT * FROM "CardComparison"` |
| Regenerate verdict | Call `regenerateVerdict()` action |
| Monitor costs | platform.openai.com/usage |

---

**AI Content Engine is ready to boost your SEO rankings with unique, engaging content!** 🚀
