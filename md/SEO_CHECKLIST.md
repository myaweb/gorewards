# SEO Checklist for Comparison Pages

## Pre-Launch Checklist

### Technical SEO ✅

- [x] Dynamic metadata generation implemented
- [x] Canonical URLs configured
- [x] Sitemap.xml generated automatically
- [x] Robots.txt configured
- [x] Structured data (JSON-LD) implemented
- [x] Open Graph tags added
- [x] Twitter Card tags added
- [x] Static page generation enabled
- [x] 404 pages configured
- [x] Loading states implemented

### On-Page SEO ✅

- [x] Unique titles for each comparison
- [x] Compelling meta descriptions
- [x] H1 tags with target keywords
- [x] Semantic HTML structure
- [x] Internal linking strategy
- [x] Alt text for images (when added)
- [x] Keyword-rich content
- [x] Clear CTAs

### Performance ✅

- [x] Core Web Vitals optimized
- [x] Image optimization configured
- [x] Code splitting enabled
- [x] CSS optimization (Tailwind purge)
- [x] Font optimization (Geist)
- [x] Compression enabled
- [x] Caching headers configured
- [x] Mobile-first responsive design

### Content Quality ✅

- [x] Unique content per page
- [x] Valuable comparison data
- [x] Clear pros and cons
- [x] Actionable recommendations
- [x] AI verdict section (placeholder)
- [x] User-focused language
- [x] No duplicate content

## Post-Launch Tasks

### Indexing

- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Request indexing for key pages
- [ ] Monitor crawl errors
- [ ] Check index coverage

### Monitoring

- [ ] Set up Google Analytics 4
- [ ] Configure Google Search Console
- [ ] Track Core Web Vitals
- [ ] Monitor page speed
- [ ] Track keyword rankings

### Content Updates

- [ ] Update card data monthly
- [ ] Refresh AI verdicts quarterly
- [ ] Add new comparisons
- [ ] Update welcome bonuses
- [ ] Review and update pros/cons

### Link Building

- [ ] Internal linking from homepage
- [ ] Cross-link between comparisons
- [ ] Add to navigation menu
- [ ] Create comparison hub page
- [ ] Build external backlinks

## SEO Best Practices

### Title Optimization

**Format:**
```
[Card 1] vs [Card 2]: Which Card is Better in [Year]?
```

**Guidelines:**
- Keep under 60 characters
- Include both card names
- Add year for freshness
- Use power words (Better, Best, Winner)
- Front-load important keywords

### Description Optimization

**Format:**
```
Compare [Card 1] and [Card 2] side-by-side. See annual fees, 
rewards rates, welcome bonuses, and our AI verdict on which 
card wins for your spending profile.
```

**Guidelines:**
- Keep under 160 characters
- Include primary keywords
- Add call-to-action
- Mention key features
- Make it compelling

### URL Structure

**Format:**
```
/compare/[card1-slug]-vs-[card2-slug]
```

**Guidelines:**
- Use hyphens, not underscores
- Keep URLs short and descriptive
- Use lowercase only
- Include target keywords
- Avoid special characters

### Heading Structure

```html
<h1>Card 1 vs Card 2: Which Card is Better?</h1>
<h2>Quick Stats Comparison</h2>
<h3>Annual Fee</h3>
<h3>Welcome Bonus</h3>
<h2>Detailed Comparison</h2>
<h3>Card 1 Details</h3>
<h3>Card 2 Details</h3>
<h2>AI-Generated Verdict</h2>
```

### Internal Linking

**From Homepage:**
```html
<a href="/compare/amex-cobalt-vs-td-aeroplan">
  Compare Amex Cobalt vs TD Aeroplan
</a>
```

**Between Comparisons:**
```html
<a href="/compare/cibc-aeroplan-vs-scotiabank-passport">
  See how CIBC Aeroplan compares to Scotiabank Passport
</a>
```

**To Main Tool:**
```html
<a href="/">
  Get personalized recommendation
</a>
```

## Keyword Strategy

### Primary Keywords

- [Card 1 Name] vs [Card 2 Name]
- [Card 1 Name] [Card 2 Name] comparison
- Compare [Card 1 Name] [Card 2 Name]
- [Card 1 Name] or [Card 2 Name]

### Secondary Keywords

- Best credit card [Year]
- [Card 1 Name] review
- [Card 2 Name] review
- Credit card comparison
- Rewards credit card
- [Bank Name] credit card

### Long-Tail Keywords

- Which is better [Card 1] or [Card 2]
- [Card 1] vs [Card 2] for groceries
- [Card 1] vs [Card 2] welcome bonus
- Should I get [Card 1] or [Card 2]
- [Card 1] vs [Card 2] annual fee

## Content Optimization

### Above the Fold

- Clear H1 with both card names
- Quick stats comparison
- Visual hierarchy
- Fast loading time

### Main Content

- Side-by-side comparison cards
- Detailed feature breakdown
- Pros and cons lists
- Earning rates table
- Welcome bonus details

### Below the Fold

- AI verdict section
- Additional features
- FAQ section (future)
- Related comparisons
- CTA buttons

## Schema Markup

### ComparisonPage Schema

```json
{
  "@context": "https://schema.org",
  "@type": "ComparisonPage",
  "name": "Card 1 vs Card 2 Comparison",
  "description": "...",
  "mainEntity": [...]
}
```

### FinancialProduct Schema

```json
{
  "@type": "FinancialProduct",
  "name": "Card Name",
  "provider": {
    "@type": "Organization",
    "name": "Bank Name"
  },
  "feesAndCommissionsSpecification": {...},
  "offers": {...}
}
```

### Validation

- [ ] Test with Google Rich Results Test
- [ ] Validate with Schema.org validator
- [ ] Check Search Console for errors
- [ ] Monitor rich snippet appearance

## Performance Targets

### Core Web Vitals

- **LCP**: < 2.5s (Good)
- **FID**: < 100ms (Good)
- **CLS**: < 0.1 (Good)

### Lighthouse Scores

- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

### Page Speed

- **Mobile**: < 3s load time
- **Desktop**: < 2s load time
- **Time to Interactive**: < 3.5s

## Analytics Tracking

### Key Metrics

- Page views per comparison
- Bounce rate
- Time on page
- CTA click-through rate
- Conversion rate
- Exit pages

### Events to Track

```javascript
// Page view
gtag('event', 'page_view', {
  page_title: 'Card Comparison',
  card1: 'amex-cobalt',
  card2: 'td-aeroplan'
})

// CTA click
gtag('event', 'cta_click', {
  card_name: 'Amex Cobalt',
  cta_location: 'card_detail'
})

// Scroll depth
gtag('event', 'scroll', {
  percent_scrolled: 75
})
```

## Competitive Analysis

### Research Competitors

- [ ] Identify top-ranking comparison pages
- [ ] Analyze their content structure
- [ ] Review their keyword usage
- [ ] Study their CTAs
- [ ] Check their backlink profile

### Differentiation

- AI-powered verdicts
- Interactive comparison tool
- Real-time data updates
- Better user experience
- Faster page speed

## Link Building Strategy

### Internal Links

- Homepage to top comparisons
- Blog posts to relevant comparisons
- Cross-link between comparisons
- Footer links to popular pages

### External Links

- Guest posts on finance blogs
- Credit card forums
- Reddit communities
- Social media sharing
- Influencer partnerships

## Content Calendar

### Monthly Tasks

- Update card data
- Refresh welcome bonuses
- Check affiliate links
- Review analytics
- Update rankings

### Quarterly Tasks

- Refresh AI verdicts
- Add new comparisons
- Update pros/cons
- Review keyword rankings
- Optimize underperforming pages

### Annual Tasks

- Major content refresh
- Update year in titles
- Review entire strategy
- Competitive analysis
- Technical SEO audit

## Testing Tools

### SEO Tools

- Google Search Console
- Google Analytics
- Ahrefs / SEMrush
- Screaming Frog
- Moz Pro

### Performance Tools

- Google PageSpeed Insights
- Lighthouse
- WebPageTest
- GTmetrix
- Chrome DevTools

### Validation Tools

- Google Rich Results Test
- Schema.org Validator
- W3C Markup Validator
- Mobile-Friendly Test
- Structured Data Testing Tool

## Common Issues & Solutions

### Issue: Pages Not Indexing

**Solutions:**
- Submit sitemap to Search Console
- Check robots.txt
- Verify canonical URLs
- Request manual indexing
- Check for crawl errors

### Issue: Low Rankings

**Solutions:**
- Improve content quality
- Add more unique value
- Build backlinks
- Optimize page speed
- Update metadata

### Issue: High Bounce Rate

**Solutions:**
- Improve page speed
- Enhance content quality
- Better CTAs
- Improve mobile experience
- Add related content

### Issue: Poor Core Web Vitals

**Solutions:**
- Optimize images
- Reduce JavaScript
- Improve server response
- Eliminate render-blocking resources
- Use CDN

## Success Metrics

### Short-Term (1-3 months)

- All pages indexed
- Lighthouse scores 95+
- Core Web Vitals passing
- Basic keyword rankings
- Initial traffic

### Medium-Term (3-6 months)

- Top 10 rankings for brand terms
- Increasing organic traffic
- Improving CTR
- Growing backlinks
- Better engagement metrics

### Long-Term (6-12 months)

- Top 3 rankings for target keywords
- Significant organic traffic
- High conversion rates
- Strong domain authority
- Sustainable growth

---

**Last Updated**: March 7, 2026

**Next Review**: April 7, 2026
