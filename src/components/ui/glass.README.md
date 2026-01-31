# Glass Morphism Components

Modern, reusable glass morphism UI components for the Co.Property Dashboard with full light/dark mode support.

## Components Overview

### Core Components

1. **GlassCard** - Card with glass morphism effect
2. **GlassPanel** - Large panel/container with glass effect
3. **GlassNavbar** - Navigation bar with glass effect

### Additional Components

4. **GlassButton** - Interactive button with glass styling
5. **GlassBadge** - Badge/tag with glass effect

## Features

- ✅ Full TypeScript support with proper type definitions
- ✅ Light/dark mode compatibility
- ✅ Three intensity levels: light, medium, strong
- ✅ Customizable via className prop
- ✅ Built with Tailwind CSS
- ✅ Forward refs for all components
- ✅ Accessible and semantic HTML
- ✅ Smooth transitions and hover effects

## Design Specifications

### Glass Effect Properties

- **Backdrop Blur**: 16px (light), 24px (medium), 40px (strong)
- **Light Mode Backgrounds**: 70-90% opacity for visibility
- **Dark Mode Backgrounds**: 5-15% opacity for subtle effect
- **Borders**: Semi-transparent white with different opacities
- **Shadows**: Soft depth shadows with primary color tint

## Usage Examples

### Basic GlassCard

```tsx
import { GlassCard } from "@/components/ui/glass";

export function PropertyCard() {
  return (
    <GlassCard intensity="medium" className="p-6">
      <h3>Ocean View Apartment</h3>
      <p>Beautiful 2-bedroom apartment with ocean views</p>
    </GlassCard>
  );
}
```

### GlassPanel for Sections

```tsx
import { GlassPanel } from "@/components/ui/glass";

export function DashboardSection() {
  return (
    <GlassPanel intensity="light" className="p-8">
      <h2>Recent Activity</h2>
      {/* Section content */}
    </GlassPanel>
  );
}
```

### GlassNavbar with Sticky Positioning

```tsx
import { GlassNavbar, GlassButton } from "@/components/ui/glass";

export function TopNavigation() {
  return (
    <GlassNavbar sticky={true} intensity="strong" className="px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <div>Logo</div>
        <nav>Navigation Links</nav>
        <GlassButton>Add Property</GlassButton>
      </div>
    </GlassNavbar>
  );
}
```

### GlassButton Variants

```tsx
import { GlassButton } from "@/components/ui/glass";

export function ActionButtons() {
  return (
    <div className="flex gap-3">
      <GlassButton variant="default">Primary Action</GlassButton>
      <GlassButton variant="ghost">Secondary Action</GlassButton>
    </div>
  );
}
```

### GlassBadge for Status

```tsx
import { GlassBadge } from "@/components/ui/glass";

export function StatusIndicator() {
  return (
    <div className="flex gap-2">
      <GlassBadge>Available</GlassBadge>
      <GlassBadge className="text-success-700">Active</GlassBadge>
      <GlassBadge className="text-warning-700">Pending</GlassBadge>
    </div>
  );
}
```

## Intensity Levels

### Light Intensity
- **Blur**: 16px (backdrop-blur-lg)
- **Best for**: Content-heavy sections, forms, readable text areas
- **Opacity**: Light mode 90%, Dark mode 5%

```tsx
<GlassCard intensity="light" className="p-6">
  {/* High visibility content */}
</GlassCard>
```

### Medium Intensity (Default)
- **Blur**: 24px (backdrop-blur-xl)
- **Best for**: General cards, panels, most UI components
- **Opacity**: Light mode 80%, Dark mode 10%

```tsx
<GlassCard intensity="medium" className="p-6">
  {/* Balanced visibility and effect */}
</GlassCard>
```

### Strong Intensity
- **Blur**: 40px (backdrop-blur-2xl)
- **Best for**: Navbars, overlays, modals, dramatic effects
- **Opacity**: Light mode 70%, Dark mode 15%

```tsx
<GlassNavbar intensity="strong">
  {/* Strong glass effect for overlays */}
</GlassNavbar>
```

## Customization

### Adding Custom Styles

All components accept a `className` prop that gets merged with default styles:

```tsx
<GlassCard
  intensity="medium"
  className="p-8 hover:scale-105 transition-transform"
>
  {/* Custom styling applied */}
</GlassCard>
```

### Overriding Colors

Use Tailwind classes to customize colors:

```tsx
<GlassCard
  className="p-6 border-property-primary/30 shadow-property-cta/10"
>
  {/* Custom border and shadow colors */}
</GlassCard>
```

### Responsive Design

Combine with Tailwind responsive utilities:

```tsx
<GlassPanel className="p-4 md:p-8 lg:p-12">
  {/* Responsive padding */}
</GlassPanel>
```

## Advanced Examples

### Nested Glass Components

```tsx
<GlassPanel intensity="light" className="p-8">
  <h2>Property Portfolio</h2>

  <div className="grid grid-cols-2 gap-4 mt-6">
    <GlassCard intensity="medium" className="p-4">
      <span>Total Properties</span>
      <p className="text-3xl font-bold">24</p>
    </GlassCard>

    <GlassCard intensity="medium" className="p-4">
      <span>Occupancy Rate</span>
      <p className="text-3xl font-bold">96%</p>
    </GlassCard>
  </div>
</GlassPanel>
```

### With Forms

```tsx
<GlassCard intensity="medium" className="p-6">
  <form className="space-y-4">
    <input
      className="w-full px-3 py-2 rounded-lg
                 bg-white/50 dark:bg-white/5
                 border border-white/30 dark:border-white/20
                 backdrop-blur-sm"
      placeholder="Property name"
    />
    <GlassButton type="submit" className="w-full">
      Save Property
    </GlassButton>
  </form>
</GlassCard>
```

### Dashboard Stats Cards

```tsx
const stats = [
  { label: "Active Leases", value: "47", icon: "📄" },
  { label: "Pending Requests", value: "12", icon: "⏳" },
];

<div className="grid grid-cols-2 gap-4">
  {stats.map((stat, i) => (
    <GlassCard key={i} intensity="medium" className="p-5">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{stat.icon}</span>
        <div>
          <p className="text-sm opacity-60">{stat.label}</p>
          <p className="text-3xl font-bold">{stat.value}</p>
        </div>
      </div>
    </GlassCard>
  ))}
</div>
```

## Best Practices

### Do's ✅

- Use `intensity="light"` for content with lots of text
- Use `intensity="strong"` for navbars and overlays
- Combine with design system colors from `tailwind.config.ts`
- Ensure sufficient contrast in both light and dark modes
- Use semantic HTML within glass components

### Don'ts ❌

- Don't nest too many glass components (max 2-3 levels)
- Don't use strong intensity on small components
- Don't rely solely on glass effect for content visibility
- Don't forget to test in both light and dark modes
- Don't override backdrop-blur without purpose

## Accessibility

All components:
- Use semantic HTML elements
- Support keyboard navigation (for interactive components)
- Maintain proper contrast ratios
- Work with screen readers
- Support focus states on interactive elements

## Browser Support

Glass morphism effects require:
- Modern browsers with `backdrop-filter` support
- Graceful fallback with solid backgrounds for older browsers
- Feature detection via `supports-[backdrop-filter]` utility

## Performance Considerations

- Backdrop blur is GPU-accelerated in modern browsers
- Avoid animating blur values (can cause performance issues)
- Use `will-change` sparingly and only when needed
- Test on lower-end devices for smooth performance

## TypeScript Support

Full TypeScript definitions included:

```tsx
interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  intensity?: "light" | "medium" | "strong";
}
```

All components are fully typed and provide IntelliSense support in VS Code.

## Related Files

- **Components**: `/src/components/ui/glass.tsx`
- **Examples**: `/src/components/ui/glass.examples.tsx`
- **Design System**: `/tailwind.config.ts`
- **Utilities**: `/src/lib/utils.ts`

## Contributing

When extending these components:
1. Maintain TypeScript type safety
2. Test in both light and dark modes
3. Follow the existing naming conventions
4. Update examples file with new use cases
5. Document new props or features

## Questions or Issues?

For questions or issues related to glass morphism components, refer to:
- Design specifications in `DesignSpec.md`
- Project architecture in `ProjectArchitecture.md`
- Component examples in `glass.examples.tsx`
