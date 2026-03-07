# UI Quick Start Guide

## Overview

The Credit Card Rewards Optimizer uses a premium dark fintech design system. This guide will help you quickly understand and use the UI components.

## Getting Started

### 1. View the Application

```bash
npm install
npm run dev
```

Visit:
- Main app: http://localhost:3000
- Component showcase: http://localhost:3000/components-demo

### 2. Understanding the Theme

The app uses a dark theme by default with:
- Deep navy background (#0a0e17)
- Electric blue primary color
- Geist Sans typography
- Glassmorphism effects

## Common Patterns

### Creating a Page

```tsx
export default function MyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Page Title</h1>
      {/* Content */}
    </div>
  )
}
```

### Stat Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

<Card className="glass-card">
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        Total Points
      </CardTitle>
      <TrendingUp className="h-4 w-4 text-primary" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">125,430</div>
    <p className="text-xs text-muted-foreground mt-1">
      +12.5% from last month
    </p>
  </CardContent>
</Card>
```

### Form with Inputs

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

<Card className="glass-card">
  <CardHeader>
    <CardTitle>Form Title</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="name">Name</Label>
      <Input id="name" placeholder="Enter name" />
    </div>
    <Button className="w-full">Submit</Button>
  </CardContent>
</Card>
```

### Slider with Label

```tsx
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

<div className="space-y-2">
  <div className="flex items-center justify-between">
    <Label>Grocery Spending</Label>
    <span className="text-sm text-muted-foreground">$1,200</span>
  </div>
  <Slider defaultValue={[1200]} max={3000} step={50} />
</div>
```

### Select Dropdown

```tsx
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

<div className="space-y-2">
  <Label htmlFor="point-type">Point Type</Label>
  <Select defaultValue="aeroplan">
    <SelectTrigger id="point-type">
      <SelectValue placeholder="Select..." />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="aeroplan">Aeroplan</SelectItem>
      <SelectItem value="avion">Avion</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### Progress Bar

```tsx
import { Progress } from "@/components/ui/progress"

<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Goal Progress</span>
    <span className="text-muted-foreground">68%</span>
  </div>
  <Progress value={68} />
</div>
```

## Layout Patterns

### Two-Column Grid

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <Card className="glass-card">{/* Left column */}</Card>
  <Card className="glass-card">{/* Right column */}</Card>
</div>
```

### Four-Column Stats

```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <Card className="glass-card">{/* Stat 1 */}</Card>
  <Card className="glass-card">{/* Stat 2 */}</Card>
  <Card className="glass-card">{/* Stat 3 */}</Card>
  <Card className="glass-card">{/* Stat 4 */}</Card>
</div>
```

### Three-Column Features

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card className="glass-card">{/* Feature 1 */}</Card>
  <Card className="glass-card">{/* Feature 2 */}</Card>
  <Card className="glass-card">{/* Feature 3 */}</Card>
</div>
```

## Styling Tips

### Glass Effect

Use on cards for premium look:
```tsx
<Card className="glass-card">
```

### Text Gradient

For hero headings:
```tsx
<h1 className="text-gradient">Maximize Your Rewards</h1>
```

### Icon with Background

```tsx
<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
  <Icon className="h-6 w-6 text-primary" />
</div>
```

### Hover Effects

```tsx
<div className="transition-colors hover:bg-accent hover:text-accent-foreground">
  Hoverable content
</div>
```

## Button Variants

```tsx
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
```

## Button Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

## Spacing

Use consistent spacing:
```tsx
<div className="space-y-4">  {/* Vertical spacing */}
<div className="space-x-4">  {/* Horizontal spacing */}
<div className="gap-6">      {/* Grid gap */}
```

## Icons

Import from lucide-react:
```tsx
import { CreditCard, TrendingUp, Target, Zap } from "lucide-react"

<CreditCard className="h-5 w-5 text-primary" />
```

Common sizes:
- `h-4 w-4` - Small (16px)
- `h-5 w-5` - Medium (20px)
- `h-6 w-6` - Large (24px)

## Responsive Design

Mobile-first approach:
```tsx
{/* Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
```

## Color Classes

```tsx
text-foreground          {/* Primary text */}
text-muted-foreground    {/* Secondary text */}
text-primary             {/* Primary color */}
bg-background            {/* Background */}
bg-card                  {/* Card background */}
border-border            {/* Border color */}
```

## Common Mistakes to Avoid

1. Don't use light mode classes - app is dark by default
2. Always use `glass-card` on Card components for consistency
3. Use `text-muted-foreground` for secondary text, not gray-500
4. Include proper spacing with `space-y-*` or `gap-*`
5. Always pair Label with Input using htmlFor/id

## Next Steps

1. Explore the component showcase at `/components-demo`
2. Read the full design system docs in `DESIGN_SYSTEM.md`
3. Check out example patterns in `app/page.tsx`
4. Build your feature using these patterns

## Need Help?

- Component docs: `DESIGN_SYSTEM.md`
- Shadcn/ui docs: https://ui.shadcn.com
- Tailwind docs: https://tailwindcss.com
- Lucide icons: https://lucide.dev
