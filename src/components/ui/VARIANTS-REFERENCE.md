# Component Variants Quick Reference

Visual reference for all component variants in the Co.Property UI library.

## Button Variants

```tsx
// Primary action - use for main CTAs
<Button variant="default">Save Changes</Button>

// Secondary action
<Button variant="secondary">Cancel</Button>

// Dangerous action
<Button variant="destructive">Delete Property</Button>

// Subtle action
<Button variant="outline">View Details</Button>

// Very subtle, no border
<Button variant="ghost">Skip</Button>

// Navigation link style
<Button variant="link">Learn More</Button>

// Modern glass effect - perfect for overlays
<Button variant="glass">Continue</Button>
```

**When to use each:**
- `default`: Primary actions (Submit, Save, Create)
- `secondary`: Secondary actions (Cancel, Back, Alternative)
- `destructive`: Dangerous actions (Delete, Remove, Archive)
- `outline`: Neutral actions (View, Edit, Details)
- `ghost`: Minimal actions (Close, Dismiss, Menu items)
- `link`: Text links (Learn More, Read More)
- `glass`: Modern UI overlays, hero sections, floating panels

---

## Button Sizes

```tsx
<Button size="sm">Small Button</Button>      // Compact spaces
<Button size="default">Default</Button>      // Most common
<Button size="lg">Large Button</Button>      // Hero sections, emphasis
<Button size="icon"><Home /></Button>        // Icon-only buttons
```

**When to use each:**
- `sm`: Tight spaces, inline actions, table rows
- `default`: 90% of use cases
- `lg`: Hero CTAs, prominent actions
- `icon`: Toolbar buttons, compact icon actions

---

## Card Variants

```tsx
// Standard card - most content
<Card variant="default">
  <CardContent>Regular content</CardContent>
</Card>

// Glass effect - overlays, modern sections
<Card variant="glass">
  <CardContent>Floating content</CardContent>
</Card>
```

**When to use each:**
- `default`: Data tables, forms, content blocks, dashboards
- `glass`: Hero sections, feature highlights, overlays, modern landing pages

---

## Badge Variants

```tsx
// Brand colors
<Badge variant="default">Default</Badge>      // Primary brand color
<Badge variant="secondary">Secondary</Badge>  // Secondary brand color

// Semantic colors
<Badge variant="success">Active</Badge>       // Positive states
<Badge variant="warning">Pending</Badge>      // Attention needed
<Badge variant="error">Overdue</Badge>        // Problems, errors

// Other
<Badge variant="destructive">Deleted</Badge>  // Destructive states
<Badge variant="outline">Draft</Badge>        // Neutral, subtle
<Badge variant="glass">Featured</Badge>       // Modern, floating
```

**When to use each:**
- `default`: Brand-related tags, categories
- `secondary`: Alternative categories, types
- `success`: Active, completed, verified, approved
- `warning`: Pending, in review, attention needed
- `error`: Failed, overdue, blocked, critical
- `destructive`: Deleted, archived, removed
- `outline`: Draft, optional, neutral states
- `glass`: Premium, featured, special badges on glass backgrounds

---

## Badge Sizes

```tsx
<Badge size="sm">Small</Badge>    // Tight spaces, inline text
<Badge size="md">Medium</Badge>   // Default, most common
<Badge size="lg">Large</Badge>    // Emphasis, standalone
```

---

## Input Variants

```tsx
// Standard input - forms, dialogs
<Input variant="default" placeholder="Enter text..." />

// Glass input - modern forms on backgrounds
<Input variant="glass" placeholder="Search..." />
```

**When to use each:**
- `default`: Traditional forms, dialogs, modals, settings
- `glass`: Search bars, hero sections, overlays, modern landing pages

---

## Input Sizes

```tsx
<Input inputSize="sm" />      // Compact forms, inline editing
<Input inputSize="default" /> // Standard forms
<Input inputSize="lg" />      // Prominent inputs, hero sections
```

---

## Input States

```tsx
// Normal
<Input placeholder="Email" />

// Error state
<Input error={true} placeholder="Required field" />

// Disabled
<Input disabled placeholder="Disabled input" />
```

---

## Select Variants

```tsx
// Standard select
<Select>
  <SelectTrigger variant="default">
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent variant="default">
    <SelectItem value="1">Option 1</SelectItem>
  </SelectContent>
</Select>

// Glass select
<Select>
  <SelectTrigger variant="glass">
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent variant="glass">
    <SelectItem value="1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

**When to use each:**
- `default`: Traditional forms, settings, filters
- `glass`: Modern forms on gradients, hero sections, overlays

---

## Combining Variants

### Traditional Form (Light Background)
```tsx
<Card variant="default">
  <CardHeader>
    <CardTitle>User Details</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <Input variant="default" placeholder="Name" />
    <Select>
      <SelectTrigger variant="default">
        <SelectValue placeholder="Role" />
      </SelectTrigger>
      <SelectContent variant="default">
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
    <div className="flex gap-2">
      <Badge variant="success">Active</Badge>
      <Badge variant="outline">Verified</Badge>
    </div>
  </CardContent>
  <CardFooter className="flex gap-2">
    <Button variant="outline">Cancel</Button>
    <Button variant="default">Save</Button>
  </CardFooter>
</Card>
```

### Modern Glass Form (Gradient Background)
```tsx
<div className="bg-gradient-to-br from-property-primary to-property-secondary p-8">
  <Card variant="glass">
    <CardHeader>
      <CardTitle>Premium Access</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <Input variant="glass" placeholder="Email" />
      <Select>
        <SelectTrigger variant="glass">
          <SelectValue placeholder="Plan" />
        </SelectTrigger>
        <SelectContent variant="glass">
          <SelectItem value="pro">Pro</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Badge variant="glass">Featured</Badge>
        <Badge variant="glass">Premium</Badge>
      </div>
    </CardContent>
    <CardFooter>
      <Button variant="glass" className="w-full">
        Get Started
      </Button>
    </CardFooter>
  </Card>
</div>
```

---

## Variant Decision Tree

### "Should I use glass variant?"

**YES, use glass when:**
- ✅ Component is on a gradient background
- ✅ Component is on an image background
- ✅ Building a modern, premium UI section
- ✅ Creating a floating overlay or modal
- ✅ Hero section or landing page
- ✅ Want to showcase modern design capabilities

**NO, use default when:**
- ✅ Standard form or data entry
- ✅ Dashboard with lots of data
- ✅ Traditional application UI
- ✅ Settings pages
- ✅ Admin panels
- ✅ Accessibility is critical (glass can reduce contrast)

---

## Color Combinations

### Primary Actions
```tsx
<Button variant="default">     {/* Teal 700: #0F766E */}
<Badge variant="default">       {/* Teal 700: #0F766E */}
```

### Secondary Actions
```tsx
<Button variant="secondary">   {/* Teal 500: #14B8A6 */}
<Badge variant="secondary">     {/* Teal 500: #14B8A6 */}
```

### Status Colors
```tsx
<Badge variant="success">      {/* Green: #10b981 */}
<Badge variant="warning">      {/* Orange: #f59e0b */}
<Badge variant="error">        {/* Red: #ef4444 */}
```

---

## Theme Behavior

### Light Mode
- Glass backgrounds: 80-90% white opacity
- Glass borders: 30-40% white opacity
- Solid backgrounds: Full color
- Shadows: Subtle, primary-tinted

### Dark Mode
- Glass backgrounds: 10-15% white opacity
- Glass borders: 15-25% white opacity
- Solid backgrounds: Darkened colors
- Shadows: More pronounced

**All components automatically adapt to theme!**

---

## Accessibility Notes

### Contrast
- ✅ Default variants: WCAG AA compliant
- ⚠️ Glass variants: May need contrast adjustment on certain backgrounds
- ✅ Error states: High contrast red (#ef4444)

### Focus States
- All interactive components have visible focus rings
- Focus rings use `property-primary` color
- 2px ring with offset for visibility

### Keyboard Navigation
- All buttons: Space and Enter
- Selects: Arrow keys, Enter, Escape
- Inputs: Standard keyboard input

---

## Performance Tips

### Loading States
```tsx
// Good: Shows loading immediately
<Button loading={isLoading}>Submit</Button>

// Better: Disable during load, show state
<Button loading={isLoading} disabled={isLoading}>
  {isLoading ? "Submitting..." : "Submit"}
</Button>
```

### Conditional Glass
```tsx
// Only use glass on hero sections
const isHeroSection = pathname === "/"

<Card variant={isHeroSection ? "glass" : "default"}>
  ...
</Card>
```

---

## Migration from Old to New

### Button
```tsx
// Old (still works!)
<Button>Click me</Button>

// New with glass
<Button variant="glass">Click me</Button>

// New with loading
<Button loading={isLoading}>Submit</Button>
```

### Card
```tsx
// Old (still works!)
<Card>
  <CardContent>Content</CardContent>
</Card>

// New with glass
<Card variant="glass">
  <CardContent>Content</CardContent>
</Card>

// New with footer
<Card>
  <CardContent>Content</CardContent>
  <CardFooter>Actions</CardFooter>  {/* New! */}
</Card>
```

### Badge
```tsx
// Old (still works!)
<Badge>Label</Badge>

// New with size
<Badge size="lg">Label</Badge>

// New with glass
<Badge variant="glass">Premium</Badge>
```

### Input
```tsx
// Old (still works!)
<Input placeholder="Text" />

// New with glass
<Input variant="glass" placeholder="Text" />

// New with error
<Input error={true} placeholder="Required" />
```

---

## Quick Copy-Paste Examples

### Login Form
```tsx
<Card variant="glass" className="w-[400px]">
  <CardHeader>
    <CardTitle>Welcome Back</CardTitle>
    <CardDescription>Sign in to your account</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <Input variant="glass" type="email" placeholder="Email" />
    <Input variant="glass" type="password" placeholder="Password" />
  </CardContent>
  <CardFooter>
    <Button variant="glass" className="w-full" loading={isLoading}>
      Sign In
    </Button>
  </CardFooter>
</Card>
```

### Status Card
```tsx
<Card variant="default">
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      Property Status
      <Badge variant="success">Active</Badge>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p>247 active properties</p>
  </CardContent>
  <CardFooter>
    <Button variant="outline" size="sm">View All</Button>
  </CardFooter>
</Card>
```

### Action Toolbar
```tsx
<div className="flex items-center gap-2">
  <Button variant="default" size="sm">
    <Download className="h-4 w-4" />
    Export
  </Button>
  <Button variant="outline" size="sm">
    <Upload className="h-4 w-4" />
    Import
  </Button>
  <Button variant="ghost" size="icon">
    <Settings className="h-4 w-4" />
  </Button>
</div>
```
