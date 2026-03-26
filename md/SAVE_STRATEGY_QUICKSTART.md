# Save Strategy Feature - Quick Start Guide

## 🚀 Test the Feature in 3 Minutes

### Step 1: Generate a Strategy
1. Go to homepage: `http://localhost:3000`
2. Fill in spending amounts
3. Select a goal (e.g., "Aeroplan Flight to Europe")
4. Click "Generate My Route"
5. Wait for roadmap to appear

### Step 2: Save the Strategy
**If Not Signed In**:
1. Scroll to bottom of results
2. Click "Sign In to Save" button
3. Sign in with Clerk modal
4. Button changes to "Save to Dashboard"
5. Click it → See success message

**If Already Signed In**:
1. Scroll to bottom of results
2. Click "Save to Dashboard"
3. See checkmark and "Saved!" message

### Step 3: View in Dashboard
1. Go to `/dashboard`
2. See your saved strategy
3. View stats: Total, In Progress, Completed
4. Click expand (chevron down) to see steps

### Step 4: Track Progress
1. Check off each step as you complete it
2. Watch progress bar fill up
3. When all steps checked → 🎉 CONFETTI!
4. Strategy marked as "Completed"

## 🎨 UI Features

### Homepage Save Button
```
┌─────────────────────────────────────┐
│ 💾 Save This Strategy               │
│ Track your progress and get         │
│ reminders in your dashboard         │
│                                     │
│ [Sign In to Save] or [Save to      │
│  Dashboard]                         │
└─────────────────────────────────────┘
```

### Dashboard Stats
```
┌──────────┬──────────┬──────────┬──────────┐
│ Account  │  Total   │   In     │ Completed│
│ Status   │Strategies│ Progress │          │
│ Premium  │    3     │    2     │    1     │
└──────────┴──────────┴──────────┴──────────┘
```

### Strategy Card
```
┌─────────────────────────────────────────┐
│ Aeroplan Flight to Europe    [Completed]│
│ Jan 15, 2024 | 75,000 pts | 12 months  │
│                                         │
│ Progress: 12 / 12 steps                 │
│ ████████████████████████████ 100%       │
│                                         │
│ ☐ Month 1: Apply for TD Aeroplan       │
│ ☑ Month 2: Use TD Aeroplan             │
│ ☑ Month 3: Use TD Aeroplan             │
│ ...                                     │
└─────────────────────────────────────────┘
```

## 🔧 Developer Testing

### Test Server Actions
```typescript
// In browser console (on dashboard page)
const result = await fetch('/api/actions/strategy', {
  method: 'POST',
  body: JSON.stringify({
    action: 'save',
    roadmapData: { /* ... */ },
    goalName: 'Test Goal'
  })
})
```

### Test Confetti
```typescript
// In browser console
import confetti from 'canvas-confetti'
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
})
```

### Check Database
```bash
npx prisma studio

# Navigate to SavedStrategy table
# Verify records are being created
```

## 📊 Analytics Tracking

### Events to Monitor
1. **strategy_saved**
   - When: User clicks save button
   - Where: PostHog dashboard
   - Properties: goal_name, total_months, total_points

2. **Page Views**
   - `/dashboard` - Track engagement
   - `/` - Track strategy generation

### PostHog Queries
```sql
-- Strategies saved per day
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as saves
FROM events
WHERE event = 'strategy_saved'
GROUP BY date
ORDER BY date DESC

-- Most popular goals
SELECT 
  properties.goal_name,
  COUNT(*) as count
FROM events
WHERE event = 'strategy_saved'
GROUP BY properties.goal_name
ORDER BY count DESC
```

## 🐛 Troubleshooting

### Issue: Save Button Not Appearing
**Check**:
1. Roadmap generated successfully?
2. `roadmap.status === 'success'`?
3. Console errors?

**Solution**: Ensure roadmap has steps array

### Issue: Confetti Not Firing
**Check**:
1. All steps checked?
2. Browser console for errors?
3. canvas-confetti installed?

**Solution**: 
```bash
npm install canvas-confetti @types/canvas-confetti
```

### Issue: Dashboard Shows No Strategies
**Check**:
1. User signed in?
2. Strategy actually saved?
3. Database connection?

**Solution**: Check Prisma Studio for SavedStrategy records

### Issue: Checkbox Not Working
**Check**:
1. Checkbox component imported?
2. @radix-ui/react-checkbox installed?
3. Console errors?

**Solution**:
```bash
npm install @radix-ui/react-checkbox
```

## 🎯 User Flow Examples

### New User Flow
```
1. Visit homepage (not signed in)
2. Generate strategy
3. Click "Sign In to Save"
4. Sign up with Clerk
5. Redirected back
6. Click "Save to Dashboard"
7. Visit /dashboard
8. See first strategy
```

### Returning User Flow
```
1. Visit homepage (signed in)
2. Generate strategy
3. Click "Save to Dashboard"
4. See success message
5. Visit /dashboard
6. See new strategy added
7. Check off steps
8. Complete strategy → Confetti!
```

### Power User Flow
```
1. Generate multiple strategies
2. Save all to dashboard
3. Work on strategies in parallel
4. Check off steps as completed
5. Delete old strategies
6. Track progress over time
```

## 📱 Mobile Testing

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Test Checklist
- [ ] Save button visible on mobile
- [ ] Dashboard stats stack properly
- [ ] Strategy cards expand/collapse
- [ ] Checkboxes easy to tap (44px min)
- [ ] Confetti works on mobile
- [ ] Delete button accessible

## 🎨 Customization

### Change Confetti Colors
```typescript
// In strategy-kanban.tsx
confetti({
  colors: ['#FF0000', '#00FF00', '#0000FF'] // Your colors
})
```

### Adjust Progress Bar
```typescript
// In strategy-kanban.tsx
<div className="h-3 bg-white/5"> {/* Height */}
  <div className="bg-gradient-to-r from-primary to-cyan-400">
    {/* Your gradient */}
  </div>
</div>
```

### Modify Empty State
```typescript
// In strategy-kanban.tsx
<CardContent className="py-16 text-center">
  <YourIcon className="h-16 w-16" />
  <h3>Your Custom Message</h3>
  <Button>Your CTA</Button>
</CardContent>
```

## 📈 Success Metrics

### Week 1
- [ ] 10+ strategies saved
- [ ] 5+ users using feature
- [ ] 0 critical bugs

### Month 1
- [ ] 100+ strategies saved
- [ ] 50+ users using feature
- [ ] 10+ completed strategies
- [ ] Positive user feedback

### Quarter 1
- [ ] 1,000+ strategies saved
- [ ] 500+ users using feature
- [ ] 100+ completed strategies
- [ ] Feature adoption > 50%

## 🔗 Related Documentation

- **Full Documentation**: `SAVE_STRATEGY_FEATURE.md`
- **Prisma Schema**: `prisma/schema.prisma`
- **Server Actions**: `app/actions/strategy.actions.ts`
- **Kanban Component**: `components/strategy-kanban.tsx`

---

**Ready to test?** Follow Step 1 and start saving strategies! 🚀
