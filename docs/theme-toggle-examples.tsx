/**
 * Theme Toggle Usage Examples
 *
 * This file contains practical examples of how to use the theme system
 * in different scenarios throughout the Co.Property Dashboard.
 */

import { ThemeToggle, ThemeToggleSimple } from "@/components/ui/theme-toggle"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

// ============================================================================
// Example 1: Basic Usage in Header/Navigation
// ============================================================================

export function NavigationHeader() {
  return (
    <header className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <h1>Co.Property</h1>
        <nav>{/* Navigation items */}</nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Other header actions */}
        <ThemeToggle />
      </div>
    </header>
  )
}

// ============================================================================
// Example 2: Simple Toggle in Compact Spaces
// ============================================================================

export function CompactToolbar() {
  return (
    <div className="flex items-center gap-2 p-2">
      <Button size="icon" variant="ghost">Action 1</Button>
      <Button size="icon" variant="ghost">Action 2</Button>
      {/* Use simple toggle when space is limited */}
      <ThemeToggleSimple />
    </div>
  )
}

// ============================================================================
// Example 3: Theme-Aware Component with Conditional Styling
// ============================================================================

export function ThemeAwareCard() {
  const { theme } = useTheme()

  return (
    <div className="glass-card p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">
        Current Theme: {theme}
      </h3>
      <p className="text-muted-foreground">
        This card uses glass morphism and adapts to the current theme.
      </p>

      {/* Conditional content based on theme */}
      {theme === "dark" && (
        <div className="mt-4 p-3 bg-primary/10 rounded">
          Dark mode exclusive content
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Example 4: Using Design System Colors
// ============================================================================

export function BrandedButton() {
  return (
    <div className="space-y-4">
      {/* Using Co.Property brand colors */}
      <button className="px-4 py-2 bg-[hsl(var(--property-primary))] text-white rounded-lg hover:opacity-90 transition">
        Co.Property Primary
      </button>

      <button className="px-4 py-2 bg-[hsl(var(--property-secondary))] text-white rounded-lg hover:opacity-90 transition">
        Co.Property Secondary
      </button>

      {/* Using semantic colors */}
      <button className="px-4 py-2 bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] rounded-lg hover:opacity-90 transition">
        Success Action
      </button>

      <button className="px-4 py-2 bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] rounded-lg hover:opacity-90 transition">
        Warning Action
      </button>

      <button className="px-4 py-2 bg-[hsl(var(--error))] text-[hsl(var(--error-foreground))] rounded-lg hover:opacity-90 transition">
        Error Action
      </button>
    </div>
  )
}

// ============================================================================
// Example 5: Glass Morphism Effects
// ============================================================================

export function GlassMorphismShowcase() {
  return (
    <div className="space-y-6 p-6">
      {/* Subtle glass effect */}
      <div className="glass p-4 rounded-lg">
        <h4 className="font-medium mb-2">Subtle Glass (.glass)</h4>
        <p className="text-sm text-muted-foreground">
          Minimal backdrop blur for subtle transparency effects.
        </p>
      </div>

      {/* Medium glass effect */}
      <div className="glass-card p-4 rounded-lg">
        <h4 className="font-medium mb-2">Medium Glass (.glass-card)</h4>
        <p className="text-sm text-muted-foreground">
          Perfect for cards and containers with good readability.
        </p>
      </div>

      {/* Strong glass effect */}
      <div className="glass-strong p-4 rounded-lg">
        <h4 className="font-medium mb-2">Strong Glass (.glass-strong)</h4>
        <p className="text-sm text-muted-foreground">
          Maximum opacity for prominent UI elements.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Example 6: Custom Theme Controls
// ============================================================================

export function CustomThemeControls() {
  const { theme, setTheme, themes } = useTheme()

  return (
    <div className="space-y-4 p-6 glass-card rounded-lg">
      <h3 className="text-lg font-semibold">Theme Settings</h3>

      <div className="flex gap-2">
        {themes.map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`
              px-4 py-2 rounded-lg transition-all
              ${theme === t
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
              }
            `}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <ThemeToggle />
      </div>
    </div>
  )
}

// ============================================================================
// Example 7: Status Indicators with Theme Colors
// ============================================================================

export function StatusIndicators() {
  return (
    <div className="space-y-2">
      {/* Success status */}
      <div className="flex items-center gap-2 p-3 bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/20 rounded-lg">
        <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" />
        <span className="text-sm font-medium text-[hsl(var(--success))]">
          Cleaning Completed
        </span>
      </div>

      {/* Warning status */}
      <div className="flex items-center gap-2 p-3 bg-[hsl(var(--warning))]/10 border border-[hsl(var(--warning))]/20 rounded-lg">
        <div className="w-2 h-2 rounded-full bg-[hsl(var(--warning))]" />
        <span className="text-sm font-medium text-[hsl(var(--warning))]">
          Check-in Soon
        </span>
      </div>

      {/* Error status */}
      <div className="flex items-center gap-2 p-3 bg-[hsl(var(--error))]/10 border border-[hsl(var(--error))]/20 rounded-lg">
        <div className="w-2 h-2 rounded-full bg-[hsl(var(--error))]" />
        <span className="text-sm font-medium text-[hsl(var(--error))]">
          Maintenance Required
        </span>
      </div>

      {/* Info status */}
      <div className="flex items-center gap-2 p-3 bg-[hsl(var(--info))]/10 border border-[hsl(var(--info))]/20 rounded-lg">
        <div className="w-2 h-2 rounded-full bg-[hsl(var(--info))]" />
        <span className="text-sm font-medium text-[hsl(var(--info))]">
          New Message
        </span>
      </div>
    </div>
  )
}

// ============================================================================
// Example 8: Property Card with Theme-Aware Styling
// ============================================================================

export function PropertyCard({ property }: { property: any }) {
  return (
    <div className="glass-card rounded-lg overflow-hidden hover:shadow-xl transition-all duration-200">
      {/* Property Image */}
      <div className="h-48 bg-gradient-to-br from-[hsl(var(--property-primary))] to-[hsl(var(--property-secondary))]" />

      {/* Property Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{property?.name || "029-SKT"}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Sukhumvit Soi 31, Bangkok
        </p>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] rounded">
            Active
          </span>
          <span className="text-xs text-muted-foreground">
            78% Occupancy
          </span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Example 9: Dashboard Stats with Theme Colors
// ============================================================================

export function DashboardStats() {
  const stats = [
    { label: "Check-ins Today", value: 12, color: "success" },
    { label: "Check-outs Today", value: 8, color: "warning" },
    { label: "Cleaning Pending", value: 5, color: "info" },
    { label: "High Priority Tasks", value: 3, color: "error" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="glass-card p-6 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
          <p className={`text-3xl font-bold text-[hsl(var(--${stat.color}))]`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// Example 10: Settings Panel with Theme Toggle
// ============================================================================

export function SettingsPanel() {
  return (
    <div className="glass-card p-6 rounded-lg space-y-6">
      <h2 className="text-xl font-semibold">Appearance Settings</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Theme</h3>
            <p className="text-sm text-muted-foreground">
              Choose your preferred color scheme
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Preview</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-20 bg-background border rounded flex items-center justify-center text-sm">
              Background
            </div>
            <div className="h-20 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm">
              Primary
            </div>
            <div className="h-20 bg-secondary text-secondary-foreground rounded flex items-center justify-center text-sm">
              Secondary
            </div>
            <div className="h-20 bg-muted text-muted-foreground rounded flex items-center justify-center text-sm">
              Muted
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Usage Tips:
// ============================================================================

/*
1. Import the ThemeToggle component where needed:
   import { ThemeToggle } from "@/components/ui/theme-toggle"

2. Use ThemeToggleSimple for compact spaces:
   import { ThemeToggleSimple } from "@/components/ui/theme-toggle"

3. Access theme state with useTheme:
   const { theme, setTheme } = useTheme()

4. Use CSS variables for theme-aware colors:
   className="bg-[hsl(var(--property-primary))]"

5. Use Tailwind's dark: variant:
   className="bg-white dark:bg-gray-900"

6. Use glass morphism utilities:
   .glass, .glass-card, .glass-strong

7. Always test in both light and dark modes

8. Ensure sufficient color contrast for accessibility
*/
