# Glass Components - Quick Reference Card

## Import
```tsx
import { GlassCard, GlassPanel, GlassNavbar, GlassButton, GlassBadge } from "@/components/ui/glass";
```

## Components at a Glance

| Component | Use Case | Default Intensity | Props |
|-----------|----------|-------------------|-------|
| `GlassCard` | Cards, features boxes | medium | `intensity`, `className`, `children` |
| `GlassPanel` | Sections, sidebars | medium | `intensity`, `className`, `children` |
| `GlassNavbar` | Navigation bars | strong | `intensity`, `sticky`, `className`, `children` |
| `GlassButton` | Interactive buttons | - | `variant`, `className`, `children` |
| `GlassBadge` | Tags, labels, status | - | `className`, `children` |

## Intensity Levels

| Level | Blur | Light Mode | Dark Mode | Best For |
|-------|------|------------|-----------|----------|
| `light` | 16px | 90% opacity | 5% opacity | Content-heavy, forms |
| `medium` | 24px | 80% opacity | 10% opacity | General use (default) |
| `strong` | 40px | 70% opacity | 15% opacity | Navbars, overlays |

## Quick Copy-Paste Examples

### Simple Card
```tsx
<GlassCard className="p-6">
  <h3>Title</h3>
  <p>Content</p>
</GlassCard>
```

### Panel with Stats
```tsx
<GlassPanel intensity="light" className="p-8">
  <h2>Dashboard</h2>
  <div className="grid grid-cols-3 gap-4">
    <GlassCard className="p-4">
      <p className="text-3xl">24</p>
    </GlassCard>
  </div>
</GlassPanel>
```

### Navbar
```tsx
<GlassNavbar className="px-6 py-4">
  <div className="container mx-auto flex justify-between">
    <Logo />
    <GlassButton>Sign In</GlassButton>
  </div>
</GlassNavbar>
```

### Button Group
```tsx
<div className="flex gap-3">
  <GlassButton>Save</GlassButton>
  <GlassButton variant="ghost">Cancel</GlassButton>
</div>
```

### Badge
```tsx
<GlassBadge className="text-success-700">Active</GlassBadge>
```

## Common Patterns

### Property Card
```tsx
<GlassCard className="p-6">
  <div className="flex justify-between mb-4">
    <div>
      <h3 className="font-semibold">Property Name</h3>
      <p className="text-sm opacity-70">Unit 402</p>
    </div>
    <GlassBadge>Available</GlassBadge>
  </div>
  <p className="text-2xl font-bold">$2,500/mo</p>
  <GlassButton className="w-full mt-4">View</GlassButton>
</GlassCard>
```

### Stat Card
```tsx
<GlassCard className="p-5">
  <p className="text-sm opacity-60 mb-1">Total Properties</p>
  <p className="text-3xl font-bold">24</p>
  <GlassBadge className="mt-2">+3 this month</GlassBadge>
</GlassCard>
```

### Form Input (matching glass style)
```tsx
<input
  className="w-full px-3 py-2 rounded-lg
             bg-white/50 dark:bg-white/5
             border border-white/30 dark:border-white/20
             backdrop-blur-sm
             focus:ring-2 focus:ring-property-primary"
/>
```

## Color Combinations

### Success (Green)
```tsx
<GlassBadge className="text-success-700 dark:text-success-500">
  Active
</GlassBadge>
```

### Warning (Yellow)
```tsx
<GlassBadge className="text-warning-700 dark:text-warning-500">
  Pending
</GlassBadge>
```

### Error (Red)
```tsx
<GlassBadge className="text-error-700 dark:text-error-500">
  Overdue
</GlassBadge>
```

### Info (Blue)
```tsx
<GlassBadge className="text-info-700 dark:text-info-500">
  Info
</GlassBadge>
```

## Tips & Tricks

### Nested Glass
```tsx
<GlassPanel intensity="light">  {/* Outer: light */}
  <GlassCard intensity="medium"> {/* Inner: medium */}
    Content
  </GlassCard>
</GlassPanel>
```

### Custom Border Color
```tsx
<GlassCard className="border-property-primary/30">
  Branded border
</GlassCard>
```

### Full Width
```tsx
<GlassCard className="w-full">Content</GlassCard>
```

### Max Width
```tsx
<GlassCard className="max-w-md mx-auto">Centered</GlassCard>
```

### Hover Effects
```tsx
<GlassCard className="hover:scale-105 transition-transform cursor-pointer">
  Interactive card
</GlassCard>
```

## Common Class Combinations

```tsx
// Padding variations
className="p-4"      // Small padding
className="p-6"      // Medium padding (common)
className="p-8"      // Large padding

// Spacing
className="space-y-4"  // Vertical spacing between children
className="gap-4"      // Grid/flex gap

// Text colors (light/dark compatible)
className="text-property-text dark:text-white"
className="text-property-text/70 dark:text-white/60"

// Responsive grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
```

## Do's and Don'ts

### ✅ Do
- Use `intensity="light"` for text-heavy content
- Test in both light and dark modes
- Combine with design system colors
- Use semantic HTML inside components

### ❌ Don't
- Don't nest more than 2-3 levels deep
- Don't use `intensity="strong"` on small components
- Don't override backdrop-blur unnecessarily
- Don't forget className prop for customization

## File Locations

- Components: `/src/components/ui/glass.tsx`
- Examples: `/src/components/ui/glass.examples.tsx`
- Docs: `/src/components/ui/glass.README.md`
- Test Page: `/src/components/ui/glass.test-page.tsx`

## TypeScript

All components are fully typed. Hover over props in VS Code for IntelliSense.

```tsx
// Auto-completion works for:
<GlassCard
  intensity="medium"  // "light" | "medium" | "strong"
  className="..."     // string
  // ...all HTML div attributes
>
```

## Need Help?

1. Check `glass.README.md` for full documentation
2. View `glass.examples.tsx` for detailed examples
3. Use `glass.test-page.tsx` for visual reference
4. Refer to `DesignSpec.md` for design guidelines
