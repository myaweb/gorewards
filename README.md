# Credit Card Rewards Optimization Engine

A Next.js 14 application for optimizing credit card rewards with complex financial rules and relationships.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui** (Component library)
- **Prisma** with PostgreSQL
- **Zod** for validation
- **Geist Font** (Premium typography)

## Database Schema

The application includes four core models:

1. **Card**: Credit card details with network, fees, and bank information
2. **CardBonus**: Welcome/signup bonuses with spending requirements
3. **CardMultiplier**: Category-based earning multipliers (grocery, gas, dining, etc.)
4. **Goal**: User redemption goals with point requirements

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Update the `.env` file with your PostgreSQL connection string:

```
DATABASE_URL="postgresql://user:password@localhost:5432/rewards_optimizer?schema=public"
```

### 3. Initialize Database

```bash
# Push schema to database
npm run db:push

# Generate Prisma Client
npm run db:generate

# Seed database with sample cards
npm run db:seed
```

The seed script populates the database with 5 realistic Canadian credit cards:
- American Express Cobalt Card
- TD Aeroplan Visa Infinite
- Scotiabank Momentum Visa Infinite
- CIBC Aeroplan Visa
- Scotiabank Passport Visa Infinite

See [DATABASE_SEED.md](./DATABASE_SEED.md) for complete details.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Design System

The application uses a premium dark fintech theme with:

- **Background**: Deep institutional charcoal/navy (#0a0e17)
- **Primary Color**: Electric high-contrast blue
- **Typography**: Geist Sans font family
- **Effects**: Glassmorphism with backdrop-blur and subtle borders
- **Components**: Shadcn/ui with custom dark theme styling

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for complete design documentation.

### UI Components

All Shadcn/ui components are pre-configured:
- Button (multiple variants and sizes)
- Card (with glassmorphism effects)
- Input (styled for dark theme)
- Label (accessible form labels)
- Slider (custom range input)
- Select (dropdown with custom styling)
- Progress (animated progress bar)

### Theme Utilities

Custom utility classes:
```css
.glass          /* Subtle glass effect */
.glass-card     /* Enhanced card with gradient */
.text-gradient  /* Primary to blue gradient text */
```

## Database Commands

- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database (dev)
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed database with sample cards

## Project Structure

```
├── app/                  # Next.js 14 App Router
│   ├── layout.tsx       # Root layout with dark theme
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles with theme
├── components/
│   ├── ui/              # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── slider.tsx
│   │   ├── select.tsx
│   │   └── progress.tsx
│   └── navigation.tsx   # Top navigation bar
├── lib/
│   ├── prisma.ts        # Prisma client singleton
│   ├── utils.ts         # Utility functions (cn)
│   ├── services/        # Business logic
│   │   ├── routeEngine.ts
│   │   └── cardService.ts
│   ├── types/           # TypeScript types
│   └── validations/     # Zod validation schemas
├── prisma/
│   └── schema.prisma    # Database schema
└── package.json
```

## Next Steps

1. Set up your PostgreSQL database
2. Run `npm install` to install dependencies
3. Configure your `.env` file
4. Run `npm run db:push` to create database tables
5. Start building your API routes and UI components


## RouteEngine - Core Business Logic

The `RouteEngine` is the heart of the optimization system. It calculates the optimal strategy for earning credit card rewards based on user spending patterns.

### Key Features

1. **Optimal Roadmap Generation**: Calculates chronological steps to reach point goals
2. **Bonus Optimization**: Determines fastest path to meet signup bonus requirements
3. **Category Multiplier Analysis**: Maximizes points based on spending categories
4. **Multi-Card Strategy**: Sequences multiple card applications for maximum efficiency

### Usage Example

```typescript
import { RouteEngine } from '@/lib/services/routeEngine'
import { CardService } from '@/lib/services/cardService'

// Define monthly spending
const spending = {
  grocery: 1000,
  gas: 300,
  dining: 500,
  recurring: 400,
}

// Define goal
const goal = {
  id: 'goal-1',
  name: 'Flight to Tokyo',
  requiredPoints: 75000,
  pointType: 'AEROPLAN',
}

// Fetch available cards from database
const cards = await CardService.getCardsByPointType('AEROPLAN')

// Calculate optimal roadmap
const roadmap = RouteEngine.calculateOptimalRoadmap(
  spending,
  goal,
  cards
)

console.log(`Goal achieved in ${roadmap.totalMonths} months`)
console.log(`Total points earned: ${roadmap.totalPointsEarned}`)
console.log(`Efficiency: ${roadmap.efficiency.pointsPerDollar} points per dollar`)
```

### Algorithm Overview

The RouteEngine uses a sophisticated multi-step algorithm:

1. **Card Filtering**: Filters cards matching the target point type
2. **Card Ranking**: Scores cards based on:
   - Signup bonus value (weighted 2x)
   - Ongoing earning potential from category multipliers
   - Annual fee impact
3. **Roadmap Building**:
   - Sequences card applications chronologically
   - Prioritizes completing signup bonuses
   - Allocates spending to maximize category multipliers
   - Tracks cumulative points month-by-month
4. **Optimization**: Minimizes time to goal while respecting natural spending habits

### Roadmap Output Structure

```typescript
{
  steps: [
    {
      month: 1,
      cardId: "card-1",
      cardName: "TD Aeroplan Visa Infinite",
      action: "APPLY",
      categoryAllocations: [],
      bonusProgress: null,
      monthlyPointsEarned: 0,
      cumulativePoints: 0,
      projectedGoalCompletion: 0
    },
    {
      month: 2,
      cardId: "card-1",
      cardName: "TD Aeroplan Visa Infinite",
      action: "USE",
      categoryAllocations: [
        {
          category: "grocery",
          amount: 1000,
          multiplier: 3,
          pointsEarned: 3000
        },
        // ... other categories
      ],
      bonusProgress: {
        bonusId: "bonus-1",
        currentSpend: 2200,
        requiredSpend: 3000,
        bonusPoints: 50000,
        bonusEarned: false
      },
      monthlyPointsEarned: 4700,
      cumulativePoints: 4700,
      projectedGoalCompletion: 6.3
    }
  ],
  totalMonths: 8,
  totalPointsEarned: 76500,
  goalAchieved: true,
  efficiency: {
    pointsPerDollar: 4.35,
    monthsToGoal: 7,
    totalSpend: 17600
  }
}
```

### Additional Utilities

#### Validate Spending Profile
```typescript
const isValid = RouteEngine.validateSpendingProfile(spending)
```

#### Calculate Bonus Completion Time
```typescript
const months = RouteEngine.calculateBonusCompletionTime(3000, 2200)
// Returns: 2 (months needed to spend $3000 at $2200/month)
```

#### Compare Two Cards
```typescript
const comparison = RouteEngine.compareCards(
  card1,
  card2,
  spending,
  'AEROPLAN',
  12 // time horizon in months
)
```

### CardService - Database Operations

The `CardService` provides methods to fetch cards with their relationships:

```typescript
// Get all active cards
const allCards = await CardService.getAllCardsWithDetails()

// Get cards by point type
const aeroplanCards = await CardService.getCardsByPointType('AEROPLAN')

// Get single card
const card = await CardService.getCardById('card-id')

// Search cards
const results = await CardService.searchCards('TD Aeroplan')

// Get top bonus cards
const topCards = await CardService.getTopBonusCards('AEROPLAN', 5)

// Get statistics
const stats = await CardService.getCardStatistics()
```

### Running Examples

Example files are provided in `lib/services/examples/`:

```bash
# Basic RouteEngine usage
npx tsx lib/services/examples/routeEngineExample.ts

# Full-stack example with database
npx tsx lib/services/examples/fullStackExample.ts
```

## Dashboard User Flow

The main dashboard (`app/page.tsx`) implements a 3-step PWA-style interface:

### Step 1: Input Spending Profile
- Mobile-first form with emoji-enhanced labels
- Shadcn Sliders for 4 spending categories (Grocery, Gas, Dining, Bills)
- Real-time total spending calculation
- Shadcn Select dropdown for goal selection

### Step 2: Generate Route
- Prominent "Generate My Route" button
- Loading state with animation ("Analyzing 50+ cards...")
- 2-second simulated processing time for UX

### Step 3: View Roadmap
- Vertical timeline UI showing month-by-month strategy
- Each timeline node displays:
  - Month number with badges
  - Card name and action (Apply/Use)
  - Spending strategy breakdown by category
  - Signup bonus progress with progress bar
  - Monthly and cumulative points
  - Goal completion percentage
- Summary card with key metrics
- "Start Over" button to reset

## Comparison Pages (Programmatic SEO)

Dynamic comparison pages at `/compare/[slug]` for SEO:

### Features
- **Dynamic Metadata**: High-converting SEO titles and descriptions
- **Side-by-Side UI**: Compare annual fees, multipliers, and bonuses
- **AI Verdict Section**: Placeholder for dynamic recommendations
- **Affiliate CTAs**: Prominent "Apply Now" buttons
- **Core Web Vitals**: Optimized for perfect performance scores
- **Structured Data**: JSON-LD for rich snippets
- **Static Generation**: Pre-rendered at build time

### Example URLs
- `/compare/amex-cobalt-vs-td-aeroplan`
- `/compare/cibc-aeroplan-vs-scotiabank-passport`
- `/compare/td-aeroplan-vs-scotiabank-passport`

See [COMPARISON_PAGES.md](./COMPARISON_PAGES.md) for complete documentation.

### Components

- `components/spending-form.tsx` - Input form with sliders and goal selection
- `components/roadmap-timeline.tsx` - Timeline visualization of optimization strategy
- `components/card-comparison.tsx` - Side-by-side card comparison UI
- `components/structured-data.tsx` - JSON-LD schema for SEO
- `components/ui/badge.tsx` - Badge component for labels

### PWA Features

- Manifest file for installability
- Mobile-optimized viewport settings
- Touch-friendly UI elements (44px minimum)
- Smooth animations and transitions
- Glassmorphism effects for premium feel

### Testing

Run the test suite:

```bash
npm test
```

Tests are located in `lib/services/__tests__/routeEngine.test.ts`
