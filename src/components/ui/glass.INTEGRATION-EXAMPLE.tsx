/**
 * INTEGRATION EXAMPLE
 *
 * How to integrate glass components into existing Co.Property dashboard pages.
 * This file shows a complete example dashboard page using all glass components.
 */

import {
  GlassCard,
  GlassPanel,
  GlassNavbar,
  GlassButton,
  GlassBadge,
} from "@/components/ui/glass";

/**
 * Example: Dashboard Page with Glass Components
 *
 * This demonstrates how to replace existing components with glass versions
 * while maintaining the same layout and functionality.
 */
export default function DashboardPageExample() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-property-bg via-property-border/20 to-property-bg dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

      {/* STEP 1: Replace top navigation with GlassNavbar */}
      <GlassNavbar sticky={true} intensity="strong" className="px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-property-primary dark:bg-property-secondary flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-heading font-bold text-property-text dark:text-white">
              Co.Property
            </span>
          </div>

          {/* Navigation - could be a separate component */}
          <nav className="hidden md:flex items-center gap-6">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/dashboard" className="text-property-text/80 dark:text-white/70 hover:text-property-primary transition-colors">
              Dashboard
            </a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/properties" className="text-property-text/80 dark:text-white/70 hover:text-property-primary transition-colors">
              Properties
            </a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/tenants" className="text-property-text/80 dark:text-white/70 hover:text-property-primary transition-colors">
              Tenants
            </a>
          </nav>

          {/* Actions */}
          <GlassButton className="px-4 py-2">
            Add Property
          </GlassButton>
        </div>
      </GlassNavbar>

      {/* STEP 2: Main content area */}
      <main className="container mx-auto px-6 py-8 space-y-8">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-property-text dark:text-white mb-2">
            Dashboard Overview
          </h1>
          <p className="text-property-text/70 dark:text-white/60">
            Welcome back! Here&apos;s what&apos;s happening with your properties.
          </p>
        </div>

        {/* STEP 3: Replace stat cards with GlassCard */}
        <section>
          <h2 className="text-xl font-heading font-semibold text-property-text dark:text-white mb-4">
            Key Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Stat Card 1 */}
            <GlassCard intensity="medium" className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-property-primary/10 dark:bg-property-secondary/10 flex items-center justify-center text-2xl">
                  🏢
                </div>
                <GlassBadge className="text-success-700 dark:text-success-500">
                  +2
                </GlassBadge>
              </div>
              <p className="text-sm text-property-text/60 dark:text-white/50 mb-1">
                Total Properties
              </p>
              <p className="text-3xl font-heading font-bold text-property-text dark:text-white">
                24
              </p>
            </GlassCard>

            {/* Stat Card 2 */}
            <GlassCard intensity="medium" className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-property-primary/10 dark:bg-property-secondary/10 flex items-center justify-center text-2xl">
                  📄
                </div>
                <GlassBadge className="text-success-700 dark:text-success-500">
                  Active
                </GlassBadge>
              </div>
              <p className="text-sm text-property-text/60 dark:text-white/50 mb-1">
                Active Leases
              </p>
              <p className="text-3xl font-heading font-bold text-property-text dark:text-white">
                47
              </p>
            </GlassCard>

            {/* Stat Card 3 */}
            <GlassCard intensity="medium" className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-property-primary/10 dark:bg-property-secondary/10 flex items-center justify-center text-2xl">
                  💰
                </div>
                <GlassBadge className="text-success-700 dark:text-success-500">
                  +12%
                </GlassBadge>
              </div>
              <p className="text-sm text-property-text/60 dark:text-white/50 mb-1">
                Monthly Revenue
              </p>
              <p className="text-3xl font-heading font-bold text-property-text dark:text-white">
                $89.5K
              </p>
            </GlassCard>

            {/* Stat Card 4 */}
            <GlassCard intensity="medium" className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-property-primary/10 dark:bg-property-secondary/10 flex items-center justify-center text-2xl">
                  📊
                </div>
                <GlassBadge className="text-success-700 dark:text-success-500">
                  Excellent
                </GlassBadge>
              </div>
              <p className="text-sm text-property-text/60 dark:text-white/50 mb-1">
                Occupancy Rate
              </p>
              <p className="text-3xl font-heading font-bold text-property-text dark:text-white">
                96%
              </p>
            </GlassCard>

          </div>
        </section>

        {/* STEP 4: Replace larger sections with GlassPanel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Activity Panel */}
          <GlassPanel intensity="light" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-semibold text-property-text dark:text-white">
                Recent Activity
              </h2>
              <GlassButton variant="ghost" className="text-sm">
                View All
              </GlassButton>
            </div>

            <div className="space-y-3">
              {/* Activity Item 1 */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-white/5">
                <div className="w-10 h-10 rounded-full bg-property-primary/20 flex items-center justify-center">
                  <span className="text-lg">📋</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-property-text dark:text-white">
                    New maintenance request
                  </p>
                  <p className="text-xs text-property-text/60 dark:text-white/50">
                    Unit 305 - Plumbing issue
                  </p>
                </div>
                <span className="text-xs text-property-text/50 dark:text-white/40">
                  2h ago
                </span>
              </div>

              {/* Activity Item 2 */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-white/5">
                <div className="w-10 h-10 rounded-full bg-success-500/20 flex items-center justify-center">
                  <span className="text-lg">✅</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-property-text dark:text-white">
                    Lease approved
                  </p>
                  <p className="text-xs text-property-text/60 dark:text-white/50">
                    Unit 402 - New tenant
                  </p>
                </div>
                <span className="text-xs text-property-text/50 dark:text-white/40">
                  5h ago
                </span>
              </div>

              {/* Activity Item 3 */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-white/5">
                <div className="w-10 h-10 rounded-full bg-info-500/20 flex items-center justify-center">
                  <span className="text-lg">💵</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-property-text dark:text-white">
                    Payment received
                  </p>
                  <p className="text-xs text-property-text/60 dark:text-white/50">
                    Unit 201 - $2,500
                  </p>
                </div>
                <span className="text-xs text-property-text/50 dark:text-white/40">
                  1d ago
                </span>
              </div>
            </div>
          </GlassPanel>

          {/* Pending Tasks Panel */}
          <GlassPanel intensity="light" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-semibold text-property-text dark:text-white">
                Pending Tasks
              </h2>
              <GlassBadge className="text-warning-700 dark:text-warning-500">
                5 pending
              </GlassBadge>
            </div>

            <div className="space-y-3">
              {/* Task 1 */}
              <GlassCard intensity="medium" className="p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 rounded border-white/30 dark:border-white/20"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-property-text dark:text-white">
                      Review lease renewal
                    </p>
                    <p className="text-sm text-property-text/60 dark:text-white/50">
                      Unit 103 - Expires in 30 days
                    </p>
                    <div className="flex gap-2 mt-2">
                      <GlassBadge className="text-xs">High Priority</GlassBadge>
                      <GlassBadge className="text-xs">Due: Feb 15</GlassBadge>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Task 2 */}
              <GlassCard intensity="medium" className="p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 rounded border-white/30 dark:border-white/20"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-property-text dark:text-white">
                      Schedule property inspection
                    </p>
                    <p className="text-sm text-property-text/60 dark:text-white/50">
                      Building B - Annual inspection
                    </p>
                    <div className="flex gap-2 mt-2">
                      <GlassBadge className="text-xs">Medium Priority</GlassBadge>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            <GlassButton className="w-full mt-4">
              View All Tasks
            </GlassButton>
          </GlassPanel>

        </div>

        {/* STEP 5: Property List with GlassCard */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-semibold text-property-text dark:text-white">
              Your Properties
            </h2>
            <GlassButton className="px-4 py-2">
              Add New Property
            </GlassButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Property Card Example */}
            {["Sunset Towers", "Ocean View", "Downtown Loft"].map((name, index) => (
              <GlassCard key={index} intensity="medium" className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-property-text dark:text-white">
                      {name}
                    </h3>
                    <p className="text-sm text-property-text/70 dark:text-white/60">
                      Unit {400 + index}
                    </p>
                  </div>
                  <GlassBadge className="text-success-700 dark:text-success-500">
                    Available
                  </GlassBadge>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-property-text/70 dark:text-white/60">Rent:</span>
                    <span className="font-semibold text-property-text dark:text-white">
                      ${2500 + index * 300}/mo
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-property-text/70 dark:text-white/60">Size:</span>
                    <span className="font-semibold text-property-text dark:text-white">
                      {1200 + index * 100} sq ft
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <GlassButton className="flex-1">
                    View Details
                  </GlassButton>
                  <GlassButton variant="ghost" className="px-3">
                    Edit
                  </GlassButton>
                </div>
              </GlassCard>
            ))}

          </div>
        </section>

      </main>
    </div>
  );
}

/**
 * MIGRATION CHECKLIST
 *
 * When converting existing dashboard pages to use glass components:
 *
 * 1. Replace Navigation:
 *    - Old: <nav className="bg-white shadow">
 *    - New: <GlassNavbar intensity="strong">
 *
 * 2. Replace Cards:
 *    - Old: <div className="bg-white rounded shadow p-6">
 *    - New: <GlassCard intensity="medium" className="p-6">
 *
 * 3. Replace Panels/Sections:
 *    - Old: <section className="bg-white rounded-lg shadow-lg p-8">
 *    - New: <GlassPanel intensity="light" className="p-8">
 *
 * 4. Replace Buttons:
 *    - Old: <button className="bg-primary text-white px-4 py-2 rounded">
 *    - New: <GlassButton className="px-4 py-2">
 *
 * 5. Replace Tags/Badges:
 *    - Old: <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
 *    - New: <GlassBadge className="text-success-700 dark:text-success-500">
 *
 * 6. Test:
 *    - ✅ Light mode visibility
 *    - ✅ Dark mode appearance
 *    - ✅ Responsive layout
 *    - ✅ Interactive elements (hover, focus)
 *    - ✅ Accessibility (keyboard navigation)
 */
