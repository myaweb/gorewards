# BonusGo SaaS Design Tokens

Quick reference for maintaining design consistency across the application.

## 🎨 Color Palette

### Primary Colors
```css
--cyan-500: #06b6d4  /* Primary brand color */
--cyan-600: #0891b2  /* Hover states */
--cyan-400: #22d3ee  /* Accents */
```

### Text Colors
```css
--white: #ffffff      /* Headlines */
--gray-400: #9ca3af  /* Body text, labels */
--gray-500: #6b7280  /* Muted text */
```

### Background
```css
--background: #090A0F  /* Main background */
--card-bg: rgba(255, 255, 255, 0.05)  /* Glass cards */
```

---

## ✨ Glow Effects

### Button Glows
```css
/* Default state */
shadow-[0_0_15px_rgba(6,182,212,0.5)]

/* Hover state */
shadow-[0_0_20px_rgba(6,182,212,0.7)]

/* Strong emphasis */
shadow-[0_0_30px_rgba(6,182,212,0.8)]
```

### Usage
```tsx
<Button className="bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)]">
  Get Started
</Button>
```

---

## 📐 Typography Scale

### Headlines
```tsx
// Hero headline
className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-none"

// Section headline
className="text-3xl md:text-4xl font-bold"

// Card title
className="text-xl font-semibold"
```

### Body Text
```tsx
// Large body
className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed"

// Regular body
className="text-base text-gray-400"

// Small text
className="text-sm text-gray-400"
```

### Labels
```tsx
// Uppercase label
className="text-sm text-gray-400 uppercase tracking-widest font-semibold"
```

---

## 🎭 Glassmorphism

### Standard Glass
```tsx
className="bg-white/5 border border-white/10 backdrop-blur-sm"
```

### Premium Glass
```tsx
className="glass-premium border-primary/20"
// Defined in globals.css as:
// bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08]
```

### Glass Card
```tsx
className="glass-card"
// Defined in globals.css as:
// bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-xl
```

---

## 🔘 Button Styles

### Primary CTA
```tsx
<Button className="h-14 px-8 text-lg bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all font-semibold">
  Get Started Free
</Button>
```

### Secondary CTA
```tsx
<Button variant="outline" className="h-14 px-8 text-lg border-white/20 hover:bg-white/5">
  Learn More
</Button>
```

### Small Button (Navbar)
```tsx
<Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_20px_rgba(6,182,212,0.7)] transition-all font-semibold">
  Sign Up
</Button>
```

---

## 📦 Card Components

### Feature Card
```tsx
<Card className="glass-premium border-primary/20 hover:border-primary/40 transition-all">
  <CardHeader>
    <CardTitle>Feature Title</CardTitle>
    <CardDescription>Feature description</CardDescription>
  </CardHeader>
</Card>
```

### Numbered Step Card
```tsx
<Card className="glass-premium border-primary/20 hover:border-primary/40 transition-all relative">
  <div className="absolute -top-4 left-8">
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xl font-bold shadow-lg">
      1
    </div>
  </div>
  <CardHeader className="pt-12">
    <CardTitle>Step Title</CardTitle>
    <CardDescription>Step description</CardDescription>
  </CardHeader>
</Card>
```

---

## 🎬 Animations

### Float Animation
```css
/* In globals.css */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
```

### Usage
```tsx
<img className="animate-float" src="/hero.png" alt="Hero" />
```

### Hover Transitions
```tsx
// Standard transition
className="transition-all duration-300"

// Hover scale
className="hover:scale-105 transition-transform duration-300"

// Hover glow
className="hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all"
```

---

## 🏷️ Badge Styles

### Premium Badge
```tsx
<Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
  <Sparkles className="h-3 w-3 mr-1" />
  Premium
</Badge>
```

### Outline Badge
```tsx
<Badge variant="outline" className="border-primary/50 text-primary">
  New
</Badge>
```

---

## 📱 Responsive Breakpoints

### Tailwind Breakpoints
```
sm: 640px   // Small devices
md: 768px   // Tablets
lg: 1024px  // Laptops
xl: 1280px  // Desktops
2xl: 1536px // Large screens
```

### Common Patterns
```tsx
// Hide on mobile, show on desktop
className="hidden lg:block"

// Stack on mobile, grid on desktop
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Responsive text size
className="text-xl md:text-2xl lg:text-3xl"

// Responsive spacing
className="gap-4 md:gap-8 lg:gap-12"
```

---

## 🎯 Interactive States

### Grayscale Hover (Trust Badges)
```tsx
<div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
  {/* Logo content */}
</div>
```

### Border Hover
```tsx
className="border-primary/20 hover:border-primary/40 transition-all"
```

### Background Hover
```tsx
className="hover:bg-white/5 transition-colors"
```

---

## 📐 Spacing System

### Container
```tsx
className="container mx-auto px-4"
```

### Section Padding
```tsx
className="py-16"  // Standard section
className="py-12"  // Compact section
className="py-20"  // Large section
```

### Element Gaps
```tsx
className="gap-4"   // Tight
className="gap-8"   // Standard
className="gap-12"  // Loose
className="gap-16"  // Extra loose
```

---

## 🌟 Special Effects

### Glow Behind Element
```tsx
<div className="relative">
  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-3xl blur-3xl opacity-50" />
  <img className="relative z-10" src="/image.png" alt="Image" />
</div>
```

### Avatar Stack
```tsx
<div className="flex -space-x-2">
  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 border-2 border-background" />
  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-background" />
  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 border-2 border-background" />
</div>
```

### Numbered Badge
```tsx
<div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xl font-bold shadow-lg">
  1
</div>
```

---

## 🎨 Gradient Patterns

### Text Gradient
```tsx
className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white"
```

### Background Gradient
```tsx
className="bg-gradient-to-br from-cyan-500 to-blue-500"
```

### Border Gradient (via pseudo-element)
```tsx
className="relative before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-r before:from-cyan-500 before:to-blue-500"
```

---

## 📋 Copy-Paste Components

### Hero CTA Group
```tsx
<div className="flex flex-col sm:flex-row gap-4 pt-4">
  <Button 
    size="lg"
    className="h-14 px-8 text-lg bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all font-semibold"
  >
    Get Started Free
    <Sparkles className="ml-2 h-5 w-5" />
  </Button>
  
  <Button 
    size="lg"
    variant="outline"
    className="h-14 px-8 text-lg border-white/20 hover:bg-white/5"
  >
    Learn More
  </Button>
</div>
```

### Social Proof
```tsx
<div className="flex items-center gap-6 pt-6">
  <div className="flex -space-x-2">
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 border-2 border-background" />
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-background" />
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 border-2 border-background" />
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 border-2 border-background" />
  </div>
  <div className="text-sm">
    <div className="font-semibold text-white">1,000+ Canadians</div>
    <div className="text-gray-400">optimizing their rewards</div>
  </div>
</div>
```

### Trust Badge
```tsx
<div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm p-8">
  <p className="text-center text-sm text-gray-400 mb-8 uppercase tracking-widest font-semibold">
    Trusted by Leading Canadian Banks
  </p>
  <div className="flex flex-wrap items-center justify-center gap-12">
    {/* Logo items */}
  </div>
</div>
```

---

**Last Updated:** March 7, 2026
**Version:** 1.0
**Maintained By:** BonusGo Design Team
