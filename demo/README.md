# BonusGo Compare Page Demo

## Overview
This is a high-fidelity, standalone HTML prototype of the BonusGo card comparison page. It demonstrates a modern, dark-first fintech UI with premium styling and responsive design.

## File Location
`/demo/compare-page-demo.html`

## Design Decisions

### 1. Visual Hierarchy
- **Hero Section**: Immediate side-by-side card comparison with key stats
- **Winner Summary**: Visual cards highlighting category winners at a glance
- **Detailed Table**: Comprehensive feature comparison with winner indicators
- **Scenario Analysis**: Interactive tabs showing real-world value calculations
- **Pros/Cons**: Honest assessment in easy-to-scan format
- **Expert Insight**: Branded BonusGo recommendation section
- **Strong CTAs**: Clear next steps for user engagement

### 2. Color System
- **Dark-first palette**: Primary background (#0a0a0f) with layered cards
- **Accent colors**: Indigo/purple gradient (#6366f1, #8b5cf6) for brand identity
- **Success indicators**: Green (#10b981) for winners and positive values
- **High contrast**: Ensures readability and premium feel

### 3. Typography
- **System fonts**: Native font stack for performance and familiarity
- **Size hierarchy**: 42px hero → 36px sections → 28px cards → 18px body
- **Weight variation**: 700 for headings, 600 for emphasis, 400 for body

### 4. Responsive Strategy
- **Desktop (1400px max)**: Full two-column layouts
- **Tablet (968px)**: Single column for cards, maintained table structure
- **Mobile (640px)**: Stacked layout, hidden table headers, full-width tabs

### 5. Interactive Elements
- **Scenario tabs**: Vanilla JS tab switching for spending profiles
- **Hover effects**: Subtle transforms and color changes on interactive elements
- **Scroll animations**: Fade-in effects using Intersection Observer API
- **Winner badges**: Dynamic checkmarks and highlighting for better values

### 6. Component Structure
Each section follows a consistent pattern:
- Container (max-width 1400px, centered)
- Section title + subtitle
- Content grid/layout
- Consistent spacing (80px vertical padding)

### 7. Accessibility Considerations
- Semantic HTML structure
- High contrast ratios (WCAG AA compliant)
- Keyboard-navigable interactive elements
- Clear focus states on buttons and tabs

## Demo Data
Uses realistic Canadian credit card examples:
- **Amex Cobalt**: Premium rewards card with 5x groceries/dining
- **TD Aeroplan Visa Infinite**: Travel-focused card with Air Canada perks

All values are believable but clearly marked as demo data.

## Technical Stack
- Pure HTML5
- Embedded CSS (CSS custom properties for theming)
- Vanilla JavaScript (no dependencies)
- No build process required

## Usage
Simply open `compare-page-demo.html` in any modern browser. No server or build step needed.

## Next Steps
This prototype is ready for:
1. Design review and feedback
2. User testing sessions
3. Stakeholder approval
4. Integration planning with Next.js app

## Notes
- This is a standalone demo and does NOT integrate with the production app
- No production files were modified
- All interactions are demo-only (alerts on CTA clicks)
- Optimized for modern browsers (Chrome, Firefox, Safari, Edge)
