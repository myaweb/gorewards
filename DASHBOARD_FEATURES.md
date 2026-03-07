# Dashboard Features

## Overview

The main dashboard provides an intuitive 3-step flow for credit card rewards optimization.

## User Flow

### Step 1: Input Spending Profile

**Location**: Main form on homepage

**Features**:
- 4 spending category sliders with emoji labels:
  - 🛒 Grocery (max $3,000)
  - ⛽ Gas (max $1,000)
  - 🍽️ Dining (max $2,000)
  - 📱 Recurring Bills (max $2,000)
- Real-time total spending calculation
- Visual feedback with primary color highlights

**Goal Selection**:
- Dropdown with 5 pre-configured goals:
  - Tokyo Flight (75,000 Aeroplan points)
  - Europe Flight (60,000 Aeroplan points)
  - Caribbean Flight (35,000 Aeroplan points)
  - Luxury Hotel Stay (50,000 Marriott Bonvoy points)
  - $1,000 Cashback (100,000 Cashback points)

### Step 2: Generate Route

**Action**: Click "Generate My Route" button

**Loading State**:
- Animated sparkle icon
- "Analyzing 50+ Cards..." message
- Bouncing dots animation
- 2-second processing simulation

**Behind the Scenes**:
1. Validates spending profile
2. Filters cards by point type
3. Runs RouteEngine optimization algorithm
4. Generates month-by-month roadmap

### Step 3: View Roadmap

**Summary Card**:
- Goal achievement status
- Total points earned
- Time to goal (months)
- Efficiency rating (points per dollar)
- Total spend required

**Timeline Visualization**:
- Vertical timeline with connecting line
- Color-coded nodes (completed vs. pending)
- Month badges
- Card application indicators

**Each Timeline Node Shows**:
1. **Month Number**: Badge with month count
2. **Action Type**: "Apply" or "Use" badge
3. **Card Information**:
   - Card name
   - Bank/issuer
   - Card icon
4. **Spending Strategy**:
   - Category allocations
   - Multiplier rates
   - Points earned per category
5. **Bonus Progress**:
   - Current spend vs. required
   - Progress bar
   - Bonus earned indicator
6. **Points Summary**:
   - Monthly points earned
   - Cumulative total
   - Goal completion percentage

**Interactive Elements**:
- "Start Over" button to reset
- Smooth scroll to timeline
- Hover effects on cards

## Technical Implementation

### Components

```
components/
├── spending-form.tsx       # Step 1: Input form
├── roadmap-timeline.tsx    # Step 3: Results display
└── ui/
    ├── slider.tsx         # Range inputs
    ├── select.tsx         # Dropdown
    ├── progress.tsx       # Progress bars
    ├── badge.tsx          # Labels
    └── button.tsx         # Actions
```

### State Management

```tsx
const [roadmap, setRoadmap] = useState<OptimalRoadmap | null>(null)
const [isLoading, setIsLoading] = useState(false)
const [goalName, setGoalName] = useState("")
```

### Data Flow

```
User Input → SpendingForm
    ↓
Form Submit → handleGenerateRoute()
    ↓
RouteEngine.calculateOptimalRoadmap()
    ↓
OptimalRoadmap → RoadmapTimeline
    ↓
Display Results
```

## Mock Data

The dashboard uses mock card data for demonstration:

1. **TD Aeroplan Visa Infinite**
   - 50,000 point bonus
   - 3x grocery, 2x gas/dining

2. **CIBC Aeroplan Visa**
   - 20,000 point bonus
   - 2x grocery, 1.5x gas/dining

3. **Amex Cobalt**
   - 30,000 point bonus
   - 5x grocery/dining, 2x gas

4. **Scotiabank Passport Visa Infinite**
   - 40,000 point bonus
   - 3x dining, 2x grocery/gas

## Optimization Algorithm

The RouteEngine uses a sophisticated algorithm:

1. **Card Filtering**: Match point type to goal
2. **Card Ranking**: Score by bonus + multipliers
3. **Sequential Application**: Apply cards one at a time
4. **Bonus Optimization**: Focus on completing bonuses
5. **Category Allocation**: Route spending to best multipliers
6. **Progress Tracking**: Calculate cumulative points

## Visual Design

### Color Coding

- **Primary Blue**: Interactive elements, progress
- **Muted Gray**: Secondary information
- **Success Green**: Completed milestones
- **Gradient**: Hero text, highlights

### Glassmorphism

All cards use the `.glass-card` utility:
- Semi-transparent background
- Backdrop blur effect
- Subtle border
- Gradient overlay

### Typography

- **Hero**: 4xl-6xl, gradient text
- **Card Titles**: 2xl, bold
- **Body**: Base size, readable
- **Metadata**: Small, muted

### Spacing

- **Container**: Max-width 4xl (896px)
- **Card Padding**: 6 (24px)
- **Section Gaps**: 6-8 (24-32px)
- **Element Spacing**: 2-4 (8-16px)

## Responsive Behavior

### Mobile (< 768px)
- Single column layout
- Full-width cards
- Stacked timeline
- Touch-optimized sliders

### Tablet (768px - 1024px)
- Two-column grids where appropriate
- Larger touch targets
- Optimized spacing

### Desktop (> 1024px)
- Centered content (max-width)
- Hover effects enabled
- Multi-column layouts
- Enhanced animations

## Accessibility Features

### Keyboard Navigation
- Tab through all interactive elements
- Enter to submit form
- Escape to close modals
- Arrow keys for sliders

### Screen Readers
- Semantic HTML structure
- ARIA labels on form controls
- Descriptive button text
- Progress announcements

### Visual Accessibility
- High contrast text
- Focus indicators
- Large touch targets (44px min)
- Clear visual hierarchy

## Performance Metrics

### Target Metrics
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

### Optimizations
- Client-side rendering for interactivity
- Minimal JavaScript bundle
- Optimized CSS with Tailwind
- No external API calls (mock data)

## User Experience Enhancements

### Micro-interactions
- Slider value updates in real-time
- Button hover effects
- Progress bar animations
- Loading state transitions

### Feedback
- Visual confirmation on form submit
- Loading indicators during processing
- Success state on completion
- Error handling (if applicable)

### Guidance
- Clear labels with emojis
- Helpful descriptions
- Inline validation
- Progress indicators

## Future Enhancements

### Phase 2
- [ ] Save roadmaps to database
- [ ] User authentication
- [ ] Multiple goal tracking
- [ ] Card comparison tool
- [ ] Export roadmap as PDF

### Phase 3
- [ ] Real-time card data integration
- [ ] Personalized recommendations
- [ ] Spending tracking
- [ ] Notification system
- [ ] Social sharing

### Phase 4
- [ ] Machine learning optimization
- [ ] Predictive analytics
- [ ] A/B testing
- [ ] Advanced filtering
- [ ] Custom card creation

## Testing Scenarios

### Happy Path
1. User adjusts spending sliders
2. User selects a goal
3. User clicks "Generate My Route"
4. Loading state displays
5. Roadmap appears with timeline
6. User reviews strategy
7. User clicks "Start Over"

### Edge Cases
- Zero spending in all categories
- Very high spending amounts
- No cards match point type
- Goal already achieved
- Multiple cards with same value

### Error Handling
- Invalid spending values
- Network errors (future)
- Missing card data
- Calculation failures

## Analytics Events (Future)

Track user interactions:
- `spending_form_submitted`
- `goal_selected`
- `roadmap_generated`
- `timeline_viewed`
- `start_over_clicked`

## Maintenance

### Regular Updates
- Update card data monthly
- Review optimization algorithm
- Monitor performance metrics
- Gather user feedback
- Fix bugs and issues

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Unit tests for logic
- E2E tests for flows
