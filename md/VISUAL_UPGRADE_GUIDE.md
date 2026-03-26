# Visual Upgrade Quick Reference Guide

## 🎨 What Changed

### Homepage (`/`)
**Before:** Text-only hero section
**After:** 
- 2-column layout with hero mockup image on right
- Trust badges showing supported networks (VISA, MC, AMEX, TD, RBC, CIBC)
- Professional, modern design with glow effects

### Compare Pages (`/compare/[slug]`)
**Before:** Text-only comparison
**After:**
- Visual "VS" header with card images side-by-side
- Glowing VS badge between cards
- Card images with hover effects
- Automatic fallback to placeholder if no image

### Dashboard (`/dashboard`)
**Before:** Plain text "no strategies" message
**After:**
- Beautiful empty state with custom SVG illustration
- Animated elements (pulse, sparkles)
- Two prominent CTAs with glow effects
- Professional, engaging design

### Social Sharing (All Pages)
**Before:** Generic OG images
**After:**
- Dynamic OG images generated per page
- Professional dark theme with cyan accents
- Custom titles for each page
- 1200x630px optimized for all platforms

---

## 🖼️ Image System

### Card Images
**Location:** Database field `Card.imageUrl`
**Fallback:** `/images/placeholder-card.svg`
**Usage:** Automatically used in compare pages

**To add a card image:**
1. Go to Admin Dashboard (`/admin`)
2. Click "Edit" on any card
3. Enter the "Direct Image URL"
4. Save

### Hero Image
**Location:** `/public/images/hero-mockup.png`
**Used on:** Homepage hero section
**Dimensions:** Flexible (scales to fit)

### Placeholder Card
**Location:** `/public/images/placeholder-card.svg`
**Used when:** Card has no imageUrl set
**Style:** Dark theme with BonusGo branding

---

## 🎯 Key Features

### Trust Badges
- Displays major card networks and banks
- Grayscale by default
- Transitions to color on hover
- Builds credibility and trust

### VS Header
- Shows actual card images in comparisons
- Animated glowing VS badge
- Hover effects on cards
- Professional presentation

### Empty States
- Engaging SVG illustrations
- Clear call-to-action
- Reduces user confusion
- Encourages first action

### OG Images
- Auto-generated for social sharing
- Custom per page
- Professional appearance
- Increases click-through rates

---

## 🔧 Customization

### Change Trust Badge Banks
Edit `app/page.tsx` around line 50:
```tsx
<div className="flex items-center gap-2">
  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
    <span className="text-xs font-bold text-white/80">YOUR_BANK</span>
  </div>
</div>
```

### Change OG Image Colors
Edit `app/api/og/route.tsx`:
- Background: `backgroundColor: '#090A0F'`
- Accent: `stop-color="#06b6d4"`

### Change Empty State Text
Edit `app/dashboard/page.tsx` around line 150:
```tsx
<h2 className="text-3xl font-bold text-gradient mb-4">
  Your Custom Heading
</h2>
```

---

## 📱 Responsive Behavior

### Mobile (< 768px)
- Hero image hidden
- Trust badges wrap
- VS header stacks vertically
- Empty state scales down

### Tablet (768px - 1024px)
- Hero image visible
- 2-column layouts maintained
- Optimal spacing

### Desktop (> 1024px)
- Full 2-column hero
- Side-by-side comparisons
- Maximum visual impact

---

## ✅ Testing URLs

### Test OG Images
- Homepage: `/api/og?title=Test&subtitle=Subtitle`
- Compare: `/api/og?title=Card A vs Card B&subtitle=Comparison`

### Test Empty State
1. Sign in to dashboard
2. If you have strategies, temporarily comment them out in code
3. View `/dashboard`

### Test VS Header
1. Visit any comparison page: `/compare/amex-cobalt-vs-td-aeroplan`
2. Check that card images display
3. Verify fallback works (temporarily set imageUrl to null)

### Test Trust Badges
1. Visit homepage `/`
2. Scroll to trust badge section
3. Hover over badges to see color transition

---

## 🚨 Troubleshooting

### Images Not Showing
- Check file exists in `/public/images/`
- Verify path is correct (case-sensitive)
- Clear browser cache
- Check browser console for errors

### OG Images Not Generating
- Verify route exists: `/app/api/og/route.tsx`
- Check edge runtime is enabled
- Test URL directly in browser
- Check server logs for errors

### Empty State Not Showing
- Verify user has 0 saved strategies
- Check `hasStrategies` variable
- Inspect component render logic

### Trust Badges Not Animating
- Check CSS classes are applied
- Verify Tailwind config includes hover variants
- Test in different browsers

---

## 📊 Performance Tips

### Optimize Images
```bash
# Compress PNG images
pngquant hero-mockup.png --quality=65-80

# Convert to WebP
cwebp hero-mockup.png -q 80 -o hero-mockup.webp
```

### Lazy Load Images
Add to image tags:
```tsx
loading="lazy"
```

### Preload Hero Image
Add to `<head>`:
```html
<link rel="preload" as="image" href="/images/hero-mockup.png" />
```

---

## 🎨 Design Tokens

### Colors
```css
--primary: #06b6d4 (Cyan)
--secondary: #0891b2 (Teal)
--background: #090A0F (Dark)
--glass: rgba(255, 255, 255, 0.05)
```

### Shadows
```css
drop-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5)
drop-shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.6)
```

### Transitions
```css
duration-300: 300ms
duration-500: 500ms
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 📝 Maintenance

### Adding New Card Images
1. Admin panel → Edit card
2. Enter image URL
3. Image automatically displays in comparisons

### Updating Hero Image
1. Replace `/public/images/hero-mockup.png`
2. Keep same filename or update in `app/page.tsx`
3. Clear CDN cache if using one

### Modifying OG Images
1. Edit `/app/api/og/route.tsx`
2. Changes apply immediately (edge runtime)
3. Test with social media debuggers

---

**Last Updated:** March 7, 2026
**Version:** 1.0
**Status:** Production Ready
