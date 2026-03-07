# Design System Documentation

## Overview

The Credit Card Rewards Optimizer uses a premium dark fintech design system built with Shadcn/ui and Tailwind CSS. The theme emphasizes sophistication, clarity, and trust through carefully chosen colors, typography, and visual effects.

## Theme Configuration

### Color Palette

#### Background
- **Primary Background**: `#0a0e17` (Deep institutional charcoal/navy)
- **Card Background**: Slightly lighter with glassmorphism effects
- **Popover Background**: `#1a1f2e` (Elevated surfaces)

#### Primary Colors
- **Primary**: `hsl(217, 91%, 60%)` - Electric high-contrast blue
- **Primary Foreground**: Dark background color for text on primary
- **Primary Hover**: 90% opacity of primary

#### Secondary Colors
- **Secondary**: `hsl(217, 33%, 17%)` - Muted blue-gray
- **Muted**: Subtle backgrounds and disabled states
- **Accent**: Interactive hover states

#### Semantic Colors
- **Destructive**: Red tones for errors and warnings
- **Border**: `hsl(217, 33%, 17%)` - Subtle borders with low opacity
- **Ring**: Primary color for focus states

### Typography

#### Font Family
- **Primary**: Geist Sans (with Inter fallback)
- **Characteristics**: Clean, modern, professional
- **Features**: Optimized for financial interfaces

#### Font Sizes
- **Headings**: 
  - H1: 3rem (48px) - Hero sections
  - H2: 2.25rem (36px) - Section headers
  - H3: 1.5rem (24px) - Card titles
- **Body**: 0.875rem (14px) - Default text
- **Small**: 0.75rem (12px) - Captions and metadata

### Visual Effects

#### Glassmorphism

Two utility classes for glass effects:

```css
.glass {
  @apply bg-white/5 backdrop-blur-md border border-white/10;
}

.glass-card {
  @apply bg-gradient-to-br from-white/[0.07] to-white/[0.02] 
         backdrop-blur-md border border-white/[0.08];
}
```

Usage:
```tsx
<div className="glass">Subtle glass effect</div>
<Card className="glass-card">Enhanced card with gradient</Card>
```

#### Text Gradient

```css
.text-gradient {
  @apply bg-clip-text text-transparent 
         bg-gradient-to-r from-primary to-blue-400;
}
```

Usage:
```tsx
<h1 className="text-gradient">Gradient Text</h1>
```

#### Background Gradients

Ambient lighting effects in layout:
```tsx
<div className="fixed inset-0 -z-10">
  <div className="absolute top-0 left-1/4 w-96 h-96 
                  bg-primary/10 rounded-full blur-3xl" />
  <div className="absolute bottom-0 right-1/4 w-96 h-96 
                  bg-blue-500/10 rounded-full blur-3xl" />
</div>
```

## Components

### Button

Variants:
- **default**: Primary blue with shadow
- **destructive**: Red for dangerous actions
- **outline**: Bordered with transparent background
- **secondary**: Muted background
- **ghost**: Transparent with hover effect
- **link**: Text-only with underline

Sizes:
- **default**: h-9 px-4 py-2
- **sm**: h-8 px-3 (compact)
- **lg**: h-10 px-8 (prominent)
- **icon**: h-9 w-9 (square)

```tsx
<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button size="lg">Large</Button>
```

### Card

Components:
- **Card**: Container with glass effect
- **CardHeader**: Top section with padding
- **CardTitle**: Bold heading
- **CardDescription**: Muted subtitle
- **CardContent**: Main content area
- **CardFooter**: Bottom actions

```tsx
<Card className="glass-card">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Input

Styled text input with focus ring:

```tsx
<Input 
  placeholder="Enter value" 
  className="bg-background/50" 
/>
```

### Label

Accessible form labels:

```tsx
<Label htmlFor="input-id">Label Text</Label>
<Input id="input-id" />
```

### Slider

Range input with custom styling:

```tsx
<Slider 
  defaultValue={[50]} 
  max={100} 
  step={1} 
/>
```

### Select

Dropdown with custom styling:

```tsx
<Select defaultValue="option1">
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Progress

Progress bar with smooth animation:

```tsx
<Progress value={68} className="h-2" />
```

## Layout Structure

### Navigation

Fixed top navigation with glassmorphism:
- Height: 64px (h-16)
- Background: Glass effect with border
- Logo: Gradient background with icon
- Links: Hover effects with smooth transitions

### Container

Centered content with responsive padding:
```tsx
<div className="container mx-auto px-4 py-12">
  {/* Content */}
</div>
```

### Grid Layouts

Responsive grid patterns:

```tsx
{/* 4-column stats */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">

{/* 2-column forms */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

{/* 3-column features */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
```

## Best Practices

### Spacing

Use consistent spacing scale:
- **xs**: 0.5rem (2px)
- **sm**: 0.75rem (3px)
- **md**: 1rem (4px)
- **lg**: 1.5rem (6px)
- **xl**: 2rem (8px)

### Borders

Subtle borders with low opacity:
```tsx
className="border border-white/[0.08]"
```

### Shadows

Minimal shadows for depth:
```tsx
className="shadow-sm"  // Subtle
className="shadow"     // Default
className="shadow-md"  // Elevated
```

### Hover States

Smooth transitions on interactive elements:
```tsx
className="transition-colors hover:bg-accent"
```

### Focus States

Visible focus rings for accessibility:
```tsx
className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
```

## Accessibility

### Color Contrast

All text meets WCAG AA standards:
- Primary text: High contrast on dark background
- Muted text: Sufficient contrast for readability
- Interactive elements: Clear visual feedback

### Keyboard Navigation

All interactive elements are keyboard accessible:
- Tab navigation
- Focus indicators
- Escape to close modals

### Screen Readers

Semantic HTML and ARIA labels:
```tsx
<Label htmlFor="input-id">Accessible Label</Label>
<Input id="input-id" aria-describedby="help-text" />
```

## Responsive Design

### Breakpoints

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile-First Approach

```tsx
{/* Mobile: 1 column, Desktop: 4 columns */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
```

## Dark Mode

The application is dark mode by default:
- HTML element has `class="dark"`
- All components styled for dark theme
- No light mode toggle (institutional fintech aesthetic)

## Icons

Using Lucide React for consistent iconography:

```tsx
import { CreditCard, TrendingUp, Target } from "lucide-react"

<CreditCard className="h-5 w-5 text-primary" />
```

Common sizes:
- **sm**: h-4 w-4 (16px)
- **md**: h-5 w-5 (20px)
- **lg**: h-6 w-6 (24px)

## Animation

Subtle animations for polish:

```tsx
{/* Fade in */}
className="animate-in fade-in-0"

{/* Slide in from bottom */}
className="animate-in slide-in-from-bottom-2"

{/* Smooth transitions */}
className="transition-all duration-200"
```

## Component Composition

### Stat Card Pattern

```tsx
<Card className="glass-card">
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        Label
      </CardTitle>
      <Icon className="h-4 w-4 text-primary" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">Value</div>
    <p className="text-xs text-muted-foreground mt-1">
      Subtitle
    </p>
  </CardContent>
</Card>
```

### Form Field Pattern

```tsx
<div className="space-y-2">
  <Label htmlFor="field">Field Label</Label>
  <Input 
    id="field" 
    placeholder="Placeholder" 
    className="bg-background/50" 
  />
</div>
```

### Feature Card Pattern

```tsx
<Card className="glass-card">
  <CardHeader>
    <div className="w-12 h-12 rounded-lg bg-primary/10 
                    flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <CardTitle>Feature Title</CardTitle>
    <CardDescription>
      Feature description text
    </CardDescription>
  </CardHeader>
</Card>
```

## Performance

### Optimization Tips

1. Use `className` composition with `cn()` utility
2. Minimize custom CSS in favor of Tailwind utilities
3. Lazy load heavy components
4. Use Next.js Image component for optimized images
5. Implement code splitting for large pages

## Future Enhancements

Potential additions:
- Toast notifications
- Dialog/Modal components
- Dropdown menu
- Tabs component
- Tooltip component
- Badge component
- Avatar component
- Data table component
