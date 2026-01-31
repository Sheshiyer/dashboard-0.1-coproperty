# Theme System Documentation

## Overview

The Co.Property Dashboard implements a comprehensive theme system with light and dark mode support using `next-themes`. The theme system includes smooth transitions, glass morphism effects, and comprehensive CSS variables aligned with the design system.

## Components

### ThemeToggle Component

Located at: `/src/components/ui/theme-toggle.tsx`

Two variants are available:

#### 1. Dropdown Menu Version (Default)

```tsx
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function MyComponent() {
  return <ThemeToggle />
}
```

Features:
- Dropdown menu with three options: Light, Dark, and System
- Shows current active theme
- Lucide React icons (Sun, Moon, Monitor)
- Glass morphism styling
- Full keyboard accessibility
- ARIA labels for screen readers

#### 2. Simple Toggle Version

```tsx
import { ThemeToggleSimple } from "@/components/ui/theme-toggle"

export function MyComponent() {
  return <ThemeToggleSimple />
}
```

Features:
- Single button toggle between light and dark
- Smooth icon transitions
- Glass morphism styling
- Simpler UI for space-constrained areas

### Features

- **Hydration Safe**: Prevents hydration mismatches by only rendering after client-side mount
- **Persistent**: Theme preference is saved to localStorage
- **System Preference**: Supports system theme preference detection
- **Smooth Transitions**: 200ms transition between themes
- **Glass Morphism**: Backdrop blur effects with transparency
- **Accessible**: Full keyboard navigation and screen reader support

## CSS Variables

### Theme Structure

All CSS variables are defined in `/src/app/globals.css` and follow the HSL color format for easy manipulation.

### Light Mode Colors

```css
:root {
  /* Base Colors */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;

  /* Brand Colors */
  --primary: 233 86% 67%;              /* #6172f3 - Primary Blue */
  --secondary: 48 96% 47%;             /* #eab308 - Gold */

  /* Co.Property Specific */
  --property-primary: 174 82% 24%;     /* #0F766E - Teal 700 */
  --property-secondary: 172 66% 50%;   /* #14B8A6 - Teal 500 */
  --property-accent: 48 96% 47%;       /* #eab308 - Gold */

  /* Semantic Colors */
  --success: 142 71% 45%;              /* #10b981 */
  --warning: 36 100% 50%;              /* #f59e0b */
  --error: 4 84% 60%;                  /* #ef4444 */
  --info: 221 83% 53%;                 /* #3b82f6 */

  /* Gray Scale */
  --gray-50 to --gray-950             /* Full gray palette */
}
```

### Dark Mode Colors

```css
.dark {
  /* Base Colors */
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;

  /* Brand Colors - Same */
  --primary: 233 86% 67%;
  --secondary: 48 96% 47%;

  /* Co.Property Specific - Adjusted for dark */
  --property-primary: 172 66% 50%;     /* Lighter teal for dark mode */
  --property-secondary: 174 82% 24%;   /* Darker teal */
  --property-accent: 48 96% 53%;       /* Slightly lighter gold */

  /* Semantic Colors - Adjusted */
  --success: 142 76% 36%;              /* Darker green */
  --warning: 36 100% 45%;              /* Darker orange */
  --error: 4 90% 58%;                  /* Adjusted red */
  --info: 221 83% 53%;                 /* Same blue */
}
```

## Glass Morphism Utilities

Three glass morphism utility classes are provided:

### 1. `.glass` - Subtle Glass Effect

```tsx
<div className="glass">
  Light glass effect with minimal blur
</div>
```

Properties:
- Backdrop blur: sm (4px)
- Background: 10% opacity
- Border: 20% opacity

### 2. `.glass-card` - Medium Glass Effect

```tsx
<div className="glass-card">
  Medium glass effect for cards
</div>
```

Properties:
- Backdrop blur: md (12px)
- Background: 80% opacity
- Border: 50% opacity
- Shadow: lg

### 3. `.glass-strong` - Strong Glass Effect

```tsx
<div className="glass-strong">
  Strong glass effect for prominent elements
</div>
```

Properties:
- Backdrop blur: lg (16px)
- Background: 90% opacity
- Border: 60% opacity
- Shadow: xl

## Usage Examples

### Basic Usage in Header

```tsx
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function Header() {
  return (
    <header>
      <nav>
        {/* ... navigation items ... */}
      </nav>
      <ThemeToggle />
    </header>
  )
}
```

### Using Theme in Components

```tsx
"use client"

import { useTheme } from "next-themes"

export function MyComponent() {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme("dark")}>
        Switch to Dark
      </button>
    </div>
  )
}
```

### Using Design System Colors

```tsx
// Using Co.Property brand colors
<div className="bg-[hsl(var(--property-primary))] text-white">
  Teal branded element
</div>

// Using semantic colors
<div className="bg-[hsl(var(--success))] text-white">
  Success message
</div>

// Using glass morphism
<div className="glass-card p-4 rounded-lg">
  Glass card with blur effect
</div>
```

### Conditional Styling Based on Theme

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  This adapts to the theme
</div>
```

## Theme Transitions

All theme transitions are smooth with a 200ms duration. This is applied to:
- Background colors
- Text colors
- Border colors

The transitions are defined in `globals.css`:

```css
body {
  transition-property: color, background-color, border-color;
  transition-duration: 200ms;
  transition-timing-function: ease-in-out;
}
```

## Preventing Flash of Wrong Theme

The theme provider in `layout.tsx` includes these critical props:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange  // Prevents flash during initial load
>
```

Additionally, the `<html>` tag includes `suppressHydrationWarning` to prevent hydration warnings from theme switching.

## Accessibility Features

### Keyboard Navigation
- Tab: Navigate to theme toggle
- Enter/Space: Open dropdown menu
- Arrow keys: Navigate menu items
- Escape: Close dropdown

### Screen Reader Support
- All icons have `sr-only` text labels
- Current theme is announced
- Theme changes are communicated
- Full ARIA labels on interactive elements

### Focus Management
- Visible focus indicators
- Focus ring uses `--ring` color
- 2px offset for better visibility
- Focus trapped in dropdown when open

## Best Practices

### 1. Always Use CSS Variables

```tsx
// Good
<div className="bg-primary text-primary-foreground">

// Also Good
<div className="bg-[hsl(var(--property-primary))]">

// Avoid - hardcoded colors won't adapt to theme
<div className="bg-[#6172f3]">
```

### 2. Use Tailwind's Dark Mode Variant

```tsx
// Good - adapts to theme
<div className="bg-white dark:bg-gray-900">

// Avoid - doesn't adapt
<div className="bg-white">
```

### 3. Test Both Themes

Always test components in both light and dark modes to ensure:
- Sufficient contrast
- Readable text
- Appropriate colors
- Proper shadows and borders

### 4. Use Semantic Colors

```tsx
// Good - semantic meaning
<div className="bg-[hsl(var(--success))] text-success-foreground">
  Operation successful!
</div>

// Avoid - non-semantic color
<div className="bg-green-500">
  Operation successful!
</div>
```

## Integration with Design System

The theme system fully integrates with the Co.Property Design System:

1. **Primary Colors**: Uses brand blue (#6172f3) and gold (#eab308)
2. **Property Colors**: Co.Property-specific teal palette
3. **Semantic Colors**: Success, Warning, Error, Info with proper contrast
4. **Gray Scale**: Complete neutral palette from 25 to 950
5. **Glass Morphism**: Branded backdrop blur effects

## Performance Considerations

1. **CSS Variables**: Runtime theme switching without page reload
2. **Minimal JavaScript**: Theme logic is lightweight
3. **LocalStorage**: Instant theme restoration on page load
4. **No Flash**: Proper SSR/hydration handling prevents FOUT
5. **Smooth Transitions**: Hardware-accelerated CSS transitions

## Troubleshooting

### Theme Not Persisting
- Check localStorage is enabled
- Verify ThemeProvider is wrapping the app
- Ensure `defaultTheme` is set

### Flash of Wrong Theme
- Verify `suppressHydrationWarning` on `<html>`
- Check `disableTransitionOnChange` on ThemeProvider
- Ensure proper SSR setup

### Icons Not Switching
- Verify component is marked `"use client"`
- Check useEffect for mounting state
- Ensure proper conditional rendering

## Future Enhancements

Potential improvements to the theme system:

1. **Custom Theme Colors**: Allow users to customize accent colors
2. **High Contrast Mode**: Additional theme for accessibility
3. **Theme Presets**: Pre-configured color schemes
4. **Scheduled Themes**: Auto-switch based on time of day
5. **Per-Page Themes**: Different themes for different sections
