# Theme System - Quick Reference Card

## 🚀 Quick Start

### 1. Import the Component
```tsx
import { ThemeToggle } from "@/components/ui/theme-toggle"
```

### 2. Use in Your Component
```tsx
export function MyHeader() {
  return (
    <header>
      <nav>{/* ... */}</nav>
      <ThemeToggle />
    </header>
  )
}
```

That's it! The theme toggle is now working.

---

## 🎨 Component Variants

### Dropdown Menu (Default)
```tsx
<ThemeToggle />
```
Shows: Light, Dark, System options

### Simple Toggle
```tsx
import { ThemeToggleSimple } from "@/components/ui/theme-toggle"
<ThemeToggleSimple />
```
Shows: Toggle between Light/Dark only

---

## 🎯 Using Theme State

```tsx
import { useTheme } from "next-themes"

function MyComponent() {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <p>Current: {theme}</p>
      <button onClick={() => setTheme("dark")}>Go Dark</button>
    </div>
  )
}
```

---

## 🎨 Using Colors

### CSS Variables
```tsx
<div className="bg-[hsl(var(--property-primary))]">
  Teal background
</div>
```

### Tailwind Dark Mode
```tsx
<div className="bg-white dark:bg-gray-900">
  Adapts to theme
</div>
```

### Semantic Colors
```tsx
<div className="bg-[hsl(var(--success))] text-success-foreground">
  Success message
</div>
```

---

## ✨ Glass Morphism

### Three Styles Available

```tsx
// Subtle
<div className="glass p-4 rounded-lg">
  Subtle glass effect
</div>

// Medium
<div className="glass-card p-4 rounded-lg">
  Card with glass effect
</div>

// Strong
<div className="glass-strong p-4 rounded-lg">
  Strong glass effect
</div>
```

---

## 🎨 Color Palette Reference

### Brand Colors
- `--primary` - Primary Blue (#6172f3)
- `--secondary` - Gold (#eab308)

### Co.Property Colors
- `--property-primary` - Teal 700 (#0F766E) light / Teal 500 (#14B8A6) dark
- `--property-secondary` - Teal 500 (#14B8A6) light / Teal 700 (#0F766E) dark
- `--property-accent` - Gold (#eab308)

### Semantic Colors
- `--success` - Green (#10b981)
- `--warning` - Orange (#f59e0b)
- `--error` - Red (#ef4444)
- `--info` - Blue (#3b82f6)

### Gray Scale
- `--gray-50` through `--gray-950` (Full palette)

---

## ♿ Accessibility

### Keyboard Shortcuts
- `Tab` - Focus toggle
- `Enter` / `Space` - Open menu
- `↑` / `↓` - Navigate options
- `Escape` - Close menu

### Screen Reader Labels
All components include proper ARIA labels automatically.

---

## 🔧 Common Patterns

### Status Badge
```tsx
<div className="px-2 py-1 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] rounded">
  Active
</div>
```

### Theme-Aware Card
```tsx
<div className="glass-card p-6 rounded-lg">
  <h3>Card Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

### Conditional Content
```tsx
const { theme } = useTheme()

{theme === "dark" && (
  <div>Dark mode only content</div>
)}
```

---

## 📝 Best Practices

✅ **DO:**
- Use CSS variables for colors
- Test both light and dark modes
- Use semantic color names
- Add proper ARIA labels
- Use glass morphism utilities

❌ **DON'T:**
- Hardcode color values
- Skip accessibility features
- Forget to test dark mode
- Use non-semantic colors
- Skip theme testing

---

## 🐛 Troubleshooting

### Theme not persisting?
Check that ThemeProvider wraps your app in layout.tsx

### Flash of wrong theme?
Ensure `suppressHydrationWarning` on `<html>` tag

### Icons not switching?
Component must be marked `"use client"`

### Hydration error?
Use the mounting state check (already in ThemeToggle)

---

## 📚 Full Documentation

For complete documentation, see:
- `/docs/theme-system.md` - Complete guide
- `/docs/theme-toggle-examples.tsx` - Usage examples
- `/docs/theme-toggle-visual-guide.md` - Visual reference

---

## 🎯 File Locations

- **Component:** `/src/components/ui/theme-toggle.tsx`
- **Dropdown:** `/src/components/ui/dropdown-menu.tsx`
- **Styles:** `/src/app/globals.css`
- **Integration:** `/src/components/layout/Header.tsx`

---

## 💡 Pro Tips

1. Use `glass-card` for most cards
2. Prefer CSS variables over hardcoded colors
3. Test with system dark mode enabled
4. Use semantic colors for status indicators
5. Check contrast ratios in both themes
6. Use ThemeToggleSimple in compact spaces
7. Add theme preview to settings page
8. Consider scheduled theme switching

---

**Need help?** Check the full documentation in `/docs/theme-system.md`
