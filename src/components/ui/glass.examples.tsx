/**
 * Glass Morphism Component Examples
 *
 * This file demonstrates usage examples for the glass morphism components.
 * Use these examples as reference for implementing glass effects throughout the dashboard.
 */

import {
  GlassCard,
  GlassPanel,
  GlassNavbar,
  GlassButton,
  GlassBadge,
} from "./glass";

// ============================================================================
// Example 1: Basic GlassCard Usage
// ============================================================================

export function PropertyCardExample() {
  return (
    <GlassCard intensity="medium" className="p-6 max-w-md">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-heading font-semibold text-property-text dark:text-white">
            Ocean View Apartment
          </h3>
          <p className="text-sm text-property-text/70 dark:text-white/60">
            Unit 402, Building A
          </p>
        </div>
        <GlassBadge>Available</GlassBadge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-property-text/70 dark:text-white/60">Rent:</span>
          <span className="font-semibold text-property-text dark:text-white">$2,500/mo</span>
        </div>
        <div className="flex justify-between">
          <span className="text-property-text/70 dark:text-white/60">Size:</span>
          <span className="font-semibold text-property-text dark:text-white">1,200 sq ft</span>
        </div>
      </div>

      <GlassButton className="w-full mt-4">
        View Details
      </GlassButton>
    </GlassCard>
  );
}

// ============================================================================
// Example 2: GlassPanel for Dashboard Section
// ============================================================================

export function DashboardSectionExample() {
  return (
    <GlassPanel intensity="light" className="p-8">
      <header className="mb-6">
        <h2 className="text-2xl font-heading font-bold text-property-text dark:text-white">
          Recent Activity
        </h2>
        <p className="text-property-text/60 dark:text-white/50 mt-1">
          Track all property-related activities
        </p>
      </header>

      <div className="space-y-4">
        {/* Activity items would go here */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-white/50 dark:bg-white/5">
          <div className="w-10 h-10 rounded-full bg-property-primary/20 flex items-center justify-center">
            <span className="text-property-primary dark:text-property-secondary">📋</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-property-text dark:text-white">
              New maintenance request
            </p>
            <p className="text-sm text-property-text/60 dark:text-white/50">
              Unit 305 - Plumbing issue
            </p>
          </div>
          <span className="text-xs text-property-text/50 dark:text-white/40">
            2 hours ago
          </span>
        </div>
      </div>
    </GlassPanel>
  );
}

// ============================================================================
// Example 3: GlassNavbar for Top Navigation
// ============================================================================

export function NavigationExample() {
  return (
    <GlassNavbar sticky={true} className="px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-property-primary flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <span className="text-xl font-heading font-bold text-property-text dark:text-white">
            Co.Property
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-property-text/80 dark:text-white/70 hover:text-property-primary dark:hover:text-property-secondary transition-colors">
            Dashboard
          </a>
          <a href="#" className="text-property-text/80 dark:text-white/70 hover:text-property-primary dark:hover:text-property-secondary transition-colors">
            Properties
          </a>
          <a href="#" className="text-property-text/80 dark:text-white/70 hover:text-property-primary dark:hover:text-property-secondary transition-colors">
            Tenants
          </a>
          <a href="#" className="text-property-text/80 dark:text-white/70 hover:text-property-primary dark:hover:text-property-secondary transition-colors">
            Reports
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <GlassButton variant="ghost" className="px-3 py-2">
            Notifications
          </GlassButton>
          <GlassButton className="px-4 py-2">
            Add Property
          </GlassButton>
        </div>
      </div>
    </GlassNavbar>
  );
}

// ============================================================================
// Example 4: Intensity Variations Showcase
// ============================================================================

export function IntensityVariationsExample() {
  return (
    <div className="space-y-6 p-8">
      <h2 className="text-2xl font-heading font-bold text-property-text dark:text-white mb-6">
        Glass Effect Intensity Levels
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Light Intensity */}
        <GlassCard intensity="light" className="p-6">
          <h3 className="font-heading font-semibold mb-2 text-property-text dark:text-white">
            Light Intensity
          </h3>
          <p className="text-sm text-property-text/70 dark:text-white/60">
            Subtle blur (16px) with high opacity. Best for content that needs maximum visibility.
          </p>
        </GlassCard>

        {/* Medium Intensity */}
        <GlassCard intensity="medium" className="p-6">
          <h3 className="font-heading font-semibold mb-2 text-property-text dark:text-white">
            Medium Intensity
          </h3>
          <p className="text-sm text-property-text/70 dark:text-white/60">
            Balanced blur (24px) with medium opacity. Default option for most use cases.
          </p>
        </GlassCard>

        {/* Strong Intensity */}
        <GlassCard intensity="strong" className="p-6">
          <h3 className="font-heading font-semibold mb-2 text-property-text dark:text-white">
            Strong Intensity
          </h3>
          <p className="text-sm text-property-text/70 dark:text-white/60">
            Heavy blur (40px) with lower opacity. Dramatic effect for overlays and navbars.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}

// ============================================================================
// Example 5: Nested Glass Components
// ============================================================================

export function NestedGlassExample() {
  return (
    <GlassPanel intensity="light" className="p-8 max-w-4xl">
      <h2 className="text-2xl font-heading font-bold text-property-text dark:text-white mb-6">
        Property Portfolio Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard intensity="medium" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-property-text/70 dark:text-white/60">
              Total Properties
            </span>
            <GlassBadge>Active</GlassBadge>
          </div>
          <p className="text-3xl font-heading font-bold text-property-primary dark:text-property-secondary">
            24
          </p>
        </GlassCard>

        <GlassCard intensity="medium" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-property-text/70 dark:text-white/60">
              Occupancy Rate
            </span>
            <GlassBadge>96%</GlassBadge>
          </div>
          <p className="text-3xl font-heading font-bold text-property-primary dark:text-property-secondary">
            23/24
          </p>
        </GlassCard>
      </div>

      <div className="mt-6 flex gap-3">
        <GlassButton className="flex-1">
          View All Properties
        </GlassButton>
        <GlassButton variant="ghost">
          Export Report
        </GlassButton>
      </div>
    </GlassPanel>
  );
}

// ============================================================================
// Example 6: Glass Components with Forms
// ============================================================================

export function FormWithGlassExample() {
  return (
    <GlassCard intensity="medium" className="p-6 max-w-md">
      <h3 className="text-xl font-heading font-semibold text-property-text dark:text-white mb-4">
        Quick Add Property
      </h3>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-property-text dark:text-white mb-1">
            Property Name
          </label>
          <input
            type="text"
            placeholder="e.g., Sunset Towers"
            className="w-full px-3 py-2 rounded-lg border border-white/30 dark:border-white/20
                     bg-white/50 dark:bg-white/5 backdrop-blur-sm
                     text-property-text dark:text-white placeholder:text-property-text/50 dark:placeholder:text-white/40
                     focus:outline-none focus:ring-2 focus:ring-property-primary dark:focus:ring-property-secondary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-property-text dark:text-white mb-1">
            Address
          </label>
          <input
            type="text"
            placeholder="Street address"
            className="w-full px-3 py-2 rounded-lg border border-white/30 dark:border-white/20
                     bg-white/50 dark:bg-white/5 backdrop-blur-sm
                     text-property-text dark:text-white placeholder:text-property-text/50 dark:placeholder:text-white/40
                     focus:outline-none focus:ring-2 focus:ring-property-primary dark:focus:ring-property-secondary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-property-text dark:text-white mb-1">
              Units
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full px-3 py-2 rounded-lg border border-white/30 dark:border-white/20
                       bg-white/50 dark:bg-white/5 backdrop-blur-sm
                       text-property-text dark:text-white placeholder:text-property-text/50 dark:placeholder:text-white/40
                       focus:outline-none focus:ring-2 focus:ring-property-primary dark:focus:ring-property-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-property-text dark:text-white mb-1">
              Type
            </label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-white/30 dark:border-white/20
                       bg-white/50 dark:bg-white/5 backdrop-blur-sm
                       text-property-text dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-property-primary dark:focus:ring-property-secondary"
            >
              <option>Apartment</option>
              <option>House</option>
              <option>Commercial</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <GlassButton type="submit" className="flex-1">
            Add Property
          </GlassButton>
          <GlassButton type="button" variant="ghost">
            Cancel
          </GlassButton>
        </div>
      </form>
    </GlassCard>
  );
}

// ============================================================================
// Example 7: Glass Components with Icons and Status
// ============================================================================

export function StatusCardsExample() {
  const stats = [
    {
      label: "Active Leases",
      value: "47",
      change: "+3",
      status: "success" as const,
      icon: "📄",
    },
    {
      label: "Pending Requests",
      value: "12",
      change: "-2",
      status: "warning" as const,
      icon: "⏳",
    },
    {
      label: "Overdue Payments",
      value: "3",
      change: "-1",
      status: "error" as const,
      icon: "💰",
    },
    {
      label: "Vacant Units",
      value: "5",
      change: "+1",
      status: "info" as const,
      icon: "🏠",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <GlassCard key={index} intensity="medium" className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-property-primary/10 dark:bg-property-secondary/10
                          flex items-center justify-center text-xl">
              {stat.icon}
            </div>
            <GlassBadge className={
              stat.status === "success" ? "text-success-700 dark:text-success-500" :
              stat.status === "warning" ? "text-warning-700 dark:text-warning-500" :
              stat.status === "error" ? "text-error-700 dark:text-error-500" :
              "text-info-700 dark:text-info-500"
            }>
              {stat.change}
            </GlassBadge>
          </div>

          <p className="text-sm text-property-text/60 dark:text-white/50 mb-1">
            {stat.label}
          </p>
          <p className="text-3xl font-heading font-bold text-property-text dark:text-white">
            {stat.value}
          </p>
        </GlassCard>
      ))}
    </div>
  );
}
