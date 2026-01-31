# UI Component Library - Quick Reference

Professional UI components with glass morphism effects integrated with the Co.Property design system.

## Design System

- **Primary Color**: `#0F766E` (property-primary) - Teal 700
- **Secondary Color**: `#14B8A6` (property-secondary) - Teal 500
- **CTA Color**: `#0369A1` (property-cta) - Sky 700
- **Typography**: Poppins (headings), Open Sans (body)
- **Glass Effects**: Backdrop blur with semi-transparent backgrounds

## Components

### Button

Enhanced button component with glass variant and loading states.

**Variants:**
- `default` - Primary brand color (property-primary)
- `secondary` - Secondary brand color (property-secondary)
- `destructive` - Red for dangerous actions
- `outline` - Border with transparent background
- `ghost` - No background, hover effect only
- `link` - Text with underline on hover
- `glass` - Glass morphism effect with backdrop blur

**Sizes:**
- `sm` - Small (h-9, text-xs)
- `default` - Medium (h-10, text-sm)
- `lg` - Large (h-11, text-base)
- `icon` - Square icon button (h-10 w-10)

**Props:**
- `loading?: boolean` - Shows loading spinner with framer-motion animation
- `disabled?: boolean` - Disabled state
- `asChild?: boolean` - Render as child component using Radix Slot

**Examples:**

```tsx
// Default button
<Button variant="default">Save Changes</Button>

// Glass button with loading
<Button variant="glass" loading={isLoading}>
  Submit
</Button>

// Button with icon
<Button variant="secondary">
  <Download className="h-4 w-4" />
  Download
</Button>

// Small icon button
<Button size="icon" variant="outline">
  <Settings className="h-4 w-4" />
</Button>
```

---

### Card

Container component with default and glass variants.

**Variants:**
- `default` - Solid background with border
- `glass` - Glass morphism effect with backdrop blur

**Sub-components:**
- `CardHeader` - Top section with padding
- `CardTitle` - Heading with font-heading
- `CardDescription` - Subtitle text
- `CardContent` - Main content area
- `CardFooter` - Bottom section for actions

**Examples:**

```tsx
// Default card
<Card variant="default">
  <CardHeader>
    <CardTitle>Property Overview</CardTitle>
    <CardDescription>View your property details</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Learn More</Button>
  </CardFooter>
</Card>

// Glass card
<Card variant="glass">
  <CardHeader>
    <CardTitle>Featured Property</CardTitle>
  </CardHeader>
  <CardContent>
    Beautiful glass effect
  </CardContent>
</Card>
```

---

### Badge

Small status indicators with semantic colors and sizes.

**Variants:**
- `default` - Primary brand color
- `secondary` - Secondary brand color
- `success` - Green for success states
- `warning` - Yellow for warnings
- `error` - Red for errors
- `destructive` - Alternative red variant
- `outline` - Border with transparent background
- `glass` - Glass morphism effect

**Sizes:**
- `sm` - Small (px-2, py-0.5, text-xs)
- `md` - Medium (px-2.5, py-0.5, text-xs)
- `lg` - Large (px-3, py-1, text-sm)

**Examples:**

```tsx
// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Overdue</Badge>

// Glass badge with icon
<Badge variant="glass" size="sm">
  <Bell className="h-3 w-3 mr-1" />
  New
</Badge>

// Different sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

---

### Input

Form input component with variants and error states.

**Variants:**
- `default` - Standard input with border
- `glass` - Glass morphism effect

**Sizes:**
- `sm` - Small (h-9, text-xs)
- `default` - Medium (h-10, text-sm)
- `lg` - Large (h-11)

**Props:**
- `error?: boolean` - Shows error styling with red border
- All standard HTML input attributes

**Examples:**

```tsx
// Default input
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    variant="default"
  />
</div>

// Glass input
<Input
  type="search"
  placeholder="Search properties..."
  variant="glass"
/>

// Input with error
<Input
  type="text"
  placeholder="Required field"
  variant="default"
  error={true}
/>

// Small input
<Input
  inputSize="sm"
  placeholder="Small input"
/>
```

---

### Select

Dropdown select component using Radix UI with variants.

**Components:**
- `Select` - Root component
- `SelectTrigger` - Trigger button (supports variants)
- `SelectContent` - Dropdown content (supports variants)
- `SelectItem` - Individual option
- `SelectGroup` - Group of options
- `SelectLabel` - Group label
- `SelectValue` - Selected value display

**Variants (for Trigger and Content):**
- `default` - Standard select
- `glass` - Glass morphism effect

**Examples:**

```tsx
// Default select
<Select>
  <SelectTrigger variant="default">
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent variant="default">
    <SelectGroup>
      <SelectLabel>Options</SelectLabel>
      <SelectItem value="1">Option 1</SelectItem>
      <SelectItem value="2">Option 2</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>

// Glass select
<Select>
  <SelectTrigger variant="glass">
    <SelectValue placeholder="Select property type" />
  </SelectTrigger>
  <SelectContent variant="glass">
    <SelectItem value="residential">Residential</SelectItem>
    <SelectItem value="commercial">Commercial</SelectItem>
  </SelectContent>
</Select>
```

---

## Glass Morphism Guidelines

Glass components work in both light and dark mode with automatic color adjustments:

**Light Mode:**
- Higher opacity backgrounds (80-90%)
- More visible borders (white/30-40%)
- Subtle shadows

**Dark Mode:**
- Lower opacity backgrounds (10-15%)
- Softer borders (white/15-25%)
- More pronounced shadows

**Best Practices:**

1. Use glass variants on top of gradients or images for best effect
2. Don't nest too many glass elements (max 2-3 levels)
3. Ensure text contrast meets accessibility standards
4. Test in both light and dark modes
5. Use glass buttons for secondary actions, not primary CTAs

---

## Theme Integration

All components automatically support:

- Light/Dark mode via `next-themes`
- CSS variable-based theming
- Smooth theme transitions (200ms)
- Design system color integration
- Responsive design
- Accessibility (ARIA, focus states, keyboard navigation)

---

## Loading States

Buttons support loading states with framer-motion animations:

```tsx
const [loading, setLoading] = useState(false)

<Button
  variant="default"
  loading={loading}
  onClick={() => {
    setLoading(true)
    // Perform async action
    setTimeout(() => setLoading(false), 2000)
  }}
>
  {loading ? "Processing..." : "Submit"}
</Button>
```

The loading spinner uses `Loader2` from Lucide React with smooth fade-in animation.

---

## Component Composition

Components are designed to work together:

```tsx
<Card variant="glass">
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      Property Details
      <Badge variant="success">Active</Badge>
    </CardTitle>
    <CardDescription>Manage your property information</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="name">Property Name</Label>
      <Input
        id="name"
        variant="glass"
        placeholder="Enter name"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="type">Type</Label>
      <Select>
        <SelectTrigger id="type" variant="glass">
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent variant="glass">
          <SelectItem value="residential">Residential</SelectItem>
          <SelectItem value="commercial">Commercial</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </CardContent>
  <CardFooter className="flex gap-4">
    <Button variant="glass" className="flex-1">Cancel</Button>
    <Button variant="default" className="flex-1">Save</Button>
  </CardFooter>
</Card>
```

---

## TypeScript Support

All components are fully typed with TypeScript:

```tsx
import type { ButtonProps } from "@/components/ui/button"
import type { CardProps } from "@/components/ui/card"
import type { BadgeProps } from "@/components/ui/badge"
import type { InputProps } from "@/components/ui/input"
```

Components export their variant types for type-safe usage:

```tsx
import { buttonVariants } from "@/components/ui/button"
import type { VariantProps } from "class-variance-authority"

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"]
// "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" | "glass"
```

---

## Utilities

All components use the `cn()` utility for class merging:

```tsx
import { cn } from "@/lib/utils"

<Button className={cn("custom-class", someCondition && "conditional-class")}>
  Click me
</Button>
```

This utility combines `clsx` and `tailwind-merge` for optimal Tailwind CSS class handling.

---

## View Examples

To see all components in action, check the example file:

```
src/components/ui/component-library.examples.tsx
```

Import and render the `ComponentLibraryExamples` component to see a complete showcase of all variants and use cases.
