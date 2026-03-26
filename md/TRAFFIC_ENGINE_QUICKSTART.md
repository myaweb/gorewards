# Organic Traffic Engine - Quick Start Guide

## 🚀 Test Your Implementation

### Step 1: Seed the Database
```bash
npx prisma db push
npx prisma db seed
```

This will create sample cards in your database including:
- American Express Cobalt Card
- TD Aeroplan Visa Infinite
- CIBC Aeroplan Visa
- Scotiabank Passport Visa Infinite

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Test Comparison Pages

Visit these URLs to see the comparison engine in action:

#### Example 1: Amex Cobalt vs TD Aeroplan
```
http://localhost:3000/compare/american-express-cobalt-vs-td-aeroplan
```

#### Example 2: CIBC Aeroplan vs Scotiabank Passport
```
http://localhost:3000/compare/cibc-aeroplan-vs-scotiabank-passport
```

#### Example 3: Test 404 (Invalid Comparison)
```
http://localhost:3000/compare/invalid-card-vs-another-invalid
```

### Step 4: Verify Features

#### ✅ SEO Metadata
1. View page source (Ctrl+U or Cmd+U)
2. Look for `<title>` tag with format: "Card A vs Card B: Which Card is Better in 2026?"
3. Check `<meta name="description">` for compelling copy
4. Find `<script type="application/ld+json">` for structured data

#### ✅ Visual Comparisons
1. Scroll to "Quick Stats" section
2. Verify progress bars show relative values
3. Check winner indicators appear correctly
4. Confirm glowing effects on primary elements

#### ✅ Category Breakdown
1. Find the "Category Multipliers Breakdown" table
2. Verify each category shows both cards' rates
3. Check winner badges appear in the right column
4. Confirm "Tie" appears when rates are equal

#### ✅ Math-Based Verdict
1. Scroll to "The Math-Based Verdict" section
2. Verify Year 1 value calculations are correct
3. Check category-by-category winners display
4. Confirm bottom line summary makes sense

#### ✅ Affiliate CTAs
1. Count the "Apply Now" buttons (should be 3+)
2. Verify buttons have glowing effects
3. Check bonus point callouts in button text
4. Confirm FTC disclosure box is visible

#### ✅ Mobile Responsiveness
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on iPhone, iPad, and desktop sizes
4. Verify all elements stack properly

## 🔍 Debugging Tips

### Issue: Cards Not Found (404)
**Cause**: Slug doesn't match database card names

**Solution**: Check your database for exact card names
```bash
npx prisma studio
```
Navigate to the `Card` table and note the exact names.

The slug parser converts:
- `amex-cobalt` → searches for cards containing "Amex Cobalt"
- `td-aeroplan` → searches for cards containing "Td Aeroplan"

### Issue: No Bonuses or Multipliers Showing
**Cause**: Related data not seeded or not active

**Solution**: Verify in Prisma Studio that:
1. `CardBonus` records exist with matching `cardId`
2. `CardMultiplier` records exist with matching `cardId`
3. All records have `isActive: true`

### Issue: Styling Looks Wrong
**Cause**: Tailwind classes not compiling

**Solution**: 
1. Restart dev server
2. Check `tailwind.config.ts` includes all component paths
3. Verify `app/globals.css` has custom utility classes

### Issue: TypeScript Errors
**Cause**: Prisma types not generated

**Solution**:
```bash
npx prisma generate
```

## 📊 Testing Checklist

### Functionality
- [ ] Comparison pages load successfully
- [ ] 404 page shows for invalid slugs
- [ ] Data fetches from Prisma correctly
- [ ] All card details display properly
- [ ] Calculations are accurate

### SEO
- [ ] Page title is dynamic and compelling
- [ ] Meta description is unique per page
- [ ] Keywords array is populated
- [ ] Structured data is valid (test with Google Rich Results Test)
- [ ] Canonical URL is correct

### UI/UX
- [ ] Visual comparison bars work
- [ ] Winner badges appear correctly
- [ ] Category table is readable
- [ ] Verdict section is clear
- [ ] CTAs are prominent and clickable
- [ ] FTC disclosure is visible
- [ ] Mobile layout is responsive

### Performance
- [ ] Page loads in < 2 seconds
- [ ] Images are optimized (if any)
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Lighthouse score > 90

## 🎯 Production Checklist

### Before Deploying
- [ ] Replace placeholder affiliate URLs with real links
- [ ] Add tracking parameters to affiliate URLs
- [ ] Update FTC disclosure with your company name
- [ ] Set up Google Analytics
- [ ] Configure Search Console
- [ ] Test all comparison pages
- [ ] Verify database has production data
- [ ] Check environment variables

### After Deploying
- [ ] Submit sitemap to Google
- [ ] Monitor Search Console for indexing
- [ ] Track affiliate click-through rates
- [ ] Monitor page load times
- [ ] Check for 404 errors
- [ ] Review user behavior in Analytics
- [ ] A/B test CTA copy

## 🔗 Useful Commands

### Database
```bash
# Push schema changes
npx prisma db push

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Reset database (careful!)
npx prisma migrate reset
```

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### Testing
```bash
# Run tests (if configured)
npm test

# Check for TypeScript errors
npx tsc --noEmit

# Validate Prisma schema
npx prisma validate
```

## 📈 Monitoring URLs

### Development
- Homepage: `http://localhost:3000`
- Sample Comparison: `http://localhost:3000/compare/american-express-cobalt-vs-td-aeroplan`
- Prisma Studio: `http://localhost:5555`

### Production (Update with your domain)
- Homepage: `https://yourdomain.com`
- Sample Comparison: `https://yourdomain.com/compare/amex-cobalt-vs-td-aeroplan`
- Sitemap: `https://yourdomain.com/sitemap.xml`

## 🆘 Getting Help

### Common Issues

**Q: Comparison page shows 404 but card exists in database**
A: Check that card name in database matches the slug pattern. Use case-insensitive search.

**Q: Affiliate buttons don't have proper styling**
A: Verify `app/globals.css` has the custom utility classes like `glow-teal-strong`.

**Q: Structured data validation fails**
A: Test with [Google Rich Results Test](https://search.google.com/test/rich-results) and fix any schema errors.

**Q: Page is slow to load**
A: Enable static generation by implementing `generateStaticParams` properly.

**Q: TypeScript complains about Prisma types**
A: Run `npx prisma generate` to regenerate types after schema changes.

### Resources
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Schema.org ComparisonPage](https://schema.org/ComparisonPage)
- [FTC Endorsement Guidelines](https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers)
- [Google Search Central](https://developers.google.com/search)

---

**Ready to launch?** Follow the checklist above and start generating organic traffic! 🚀
