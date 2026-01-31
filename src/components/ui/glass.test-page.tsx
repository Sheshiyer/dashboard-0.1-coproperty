/**
 * Glass Components Visual Test Page
 *
 * This component showcases all glass morphism components for visual testing.
 * To use: Import this in a page and view in both light and dark modes.
 */

import {
  GlassCard,
  GlassPanel,
  GlassNavbar,
  GlassButton,
  GlassBadge,
} from "./glass";

export function GlassComponentsTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-property-bg via-property-border/20 to-property-bg dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Glass Navbar */}
      <GlassNavbar sticky={true} intensity="strong" className="px-6 py-4 mb-8">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-property-primary dark:bg-property-secondary flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-heading font-bold text-property-text dark:text-white">
              Co.Property
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#cards" className="text-property-text/80 dark:text-white/70 hover:text-property-primary dark:hover:text-property-secondary transition-colors">
              Cards
            </a>
            <a href="#panels" className="text-property-text/80 dark:text-white/70 hover:text-property-primary dark:hover:text-property-secondary transition-colors">
              Panels
            </a>
            <a href="#buttons" className="text-property-text/80 dark:text-white/70 hover:text-property-primary dark:hover:text-property-secondary transition-colors">
              Buttons
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <GlassButton variant="ghost" className="px-3 py-2">
              Theme Toggle
            </GlassButton>
            <GlassButton className="px-4 py-2">
              Sign In
            </GlassButton>
          </div>
        </div>
      </GlassNavbar>

      <div className="container mx-auto px-6 py-12 space-y-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-property-text dark:text-white mb-4">
            Glass Morphism Components
          </h1>
          <p className="text-lg text-property-text/70 dark:text-white/60">
            Test all glass components in light and dark mode
          </p>
        </div>

        {/* Intensity Levels Section */}
        <section id="cards">
          <h2 className="text-3xl font-heading font-bold text-property-text dark:text-white mb-6">
            Intensity Levels - GlassCard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard intensity="light" className="p-6">
              <h3 className="text-xl font-heading font-semibold mb-2 text-property-text dark:text-white">
                Light Intensity
              </h3>
              <p className="text-property-text/70 dark:text-white/60 mb-4">
                Backdrop blur: 16px (backdrop-blur-lg)
              </p>
              <div className="flex gap-2">
                <GlassBadge>bg-white/90</GlassBadge>
                <GlassBadge>dark:bg-white/5</GlassBadge>
              </div>
            </GlassCard>

            <GlassCard intensity="medium" className="p-6">
              <h3 className="text-xl font-heading font-semibold mb-2 text-property-text dark:text-white">
                Medium Intensity
              </h3>
              <p className="text-property-text/70 dark:text-white/60 mb-4">
                Backdrop blur: 24px (backdrop-blur-xl)
              </p>
              <div className="flex gap-2">
                <GlassBadge>bg-white/80</GlassBadge>
                <GlassBadge>dark:bg-white/10</GlassBadge>
              </div>
            </GlassCard>

            <GlassCard intensity="strong" className="p-6">
              <h3 className="text-xl font-heading font-semibold mb-2 text-property-text dark:text-white">
                Strong Intensity
              </h3>
              <p className="text-property-text/70 dark:text-white/60 mb-4">
                Backdrop blur: 40px (backdrop-blur-2xl)
              </p>
              <div className="flex gap-2">
                <GlassBadge>bg-white/70</GlassBadge>
                <GlassBadge>dark:bg-white/15</GlassBadge>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Property Cards Example */}
        <section>
          <h2 className="text-3xl font-heading font-bold text-property-text dark:text-white mb-6">
            Property Cards Example
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Sunset Towers", unit: "Unit 402", rent: "$2,500", status: "Available" },
              { name: "Ocean View", unit: "Unit 305", rent: "$3,200", status: "Occupied" },
              { name: "Downtown Loft", unit: "Unit 101", rent: "$2,800", status: "Maintenance" },
            ].map((property, index) => (
              <GlassCard key={index} intensity="medium" className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-property-text dark:text-white">
                      {property.name}
                    </h3>
                    <p className="text-sm text-property-text/70 dark:text-white/60">
                      {property.unit}
                    </p>
                  </div>
                  <GlassBadge
                    className={
                      property.status === "Available"
                        ? "text-success-700 dark:text-success-500"
                        : property.status === "Occupied"
                        ? "text-info-700 dark:text-info-500"
                        : "text-warning-700 dark:text-warning-500"
                    }
                  >
                    {property.status}
                  </GlassBadge>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-property-text/70 dark:text-white/60">Monthly Rent:</span>
                    <span className="font-semibold text-property-text dark:text-white">
                      {property.rent}
                    </span>
                  </div>
                </div>

                <GlassButton className="w-full">View Details</GlassButton>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Glass Panel Section */}
        <section id="panels">
          <h2 className="text-3xl font-heading font-bold text-property-text dark:text-white mb-6">
            GlassPanel Example
          </h2>
          <GlassPanel intensity="light" className="p-8">
            <header className="mb-6">
              <h3 className="text-2xl font-heading font-bold text-property-text dark:text-white mb-2">
                Dashboard Overview
              </h3>
              <p className="text-property-text/60 dark:text-white/50">
                Key metrics and statistics for your property portfolio
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Total Properties", value: "24", icon: "🏢" },
                { label: "Active Leases", value: "47", icon: "📄" },
                { label: "Monthly Revenue", value: "$89.5K", icon: "💰" },
                { label: "Occupancy Rate", value: "96%", icon: "📊" },
              ].map((stat, index) => (
                <GlassCard key={index} intensity="medium" className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-property-primary/10 dark:bg-property-secondary/10 flex items-center justify-center text-2xl">
                      {stat.icon}
                    </div>
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
          </GlassPanel>
        </section>

        {/* Buttons Section */}
        <section id="buttons">
          <h2 className="text-3xl font-heading font-bold text-property-text dark:text-white mb-6">
            GlassButton Variants
          </h2>
          <GlassCard intensity="medium" className="p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-heading font-semibold text-property-text dark:text-white mb-3">
                  Default Variant
                </h3>
                <div className="flex flex-wrap gap-3">
                  <GlassButton>Primary Action</GlassButton>
                  <GlassButton className="px-6">Add Property</GlassButton>
                  <GlassButton className="px-8 py-3">Large Button</GlassButton>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-heading font-semibold text-property-text dark:text-white mb-3">
                  Ghost Variant
                </h3>
                <div className="flex flex-wrap gap-3">
                  <GlassButton variant="ghost">Secondary Action</GlassButton>
                  <GlassButton variant="ghost">Cancel</GlassButton>
                  <GlassButton variant="ghost">Settings</GlassButton>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-heading font-semibold text-property-text dark:text-white mb-3">
                  Button Groups
                </h3>
                <div className="flex gap-3">
                  <GlassButton className="flex-1">Accept</GlassButton>
                  <GlassButton variant="ghost" className="flex-1">
                    Decline
                  </GlassButton>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Badges Section */}
        <section>
          <h2 className="text-3xl font-heading font-bold text-property-text dark:text-white mb-6">
            GlassBadge Examples
          </h2>
          <GlassCard intensity="medium" className="p-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-property-text/70 dark:text-white/60 mb-2">
                  Status Badges
                </h3>
                <div className="flex flex-wrap gap-2">
                  <GlassBadge>Default</GlassBadge>
                  <GlassBadge className="text-success-700 dark:text-success-500">Active</GlassBadge>
                  <GlassBadge className="text-warning-700 dark:text-warning-500">Pending</GlassBadge>
                  <GlassBadge className="text-error-700 dark:text-error-500">Overdue</GlassBadge>
                  <GlassBadge className="text-info-700 dark:text-info-500">Info</GlassBadge>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-property-text/70 dark:text-white/60 mb-2">
                  Property Types
                </h3>
                <div className="flex flex-wrap gap-2">
                  <GlassBadge>Apartment</GlassBadge>
                  <GlassBadge>House</GlassBadge>
                  <GlassBadge>Commercial</GlassBadge>
                  <GlassBadge>Condo</GlassBadge>
                  <GlassBadge>Townhouse</GlassBadge>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Nested Example */}
        <section>
          <h2 className="text-3xl font-heading font-bold text-property-text dark:text-white mb-6">
            Nested Components Example
          </h2>
          <GlassPanel intensity="light" className="p-8">
            <h3 className="text-2xl font-heading font-bold text-property-text dark:text-white mb-6">
              Property Management Form
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard intensity="medium" className="p-6">
                <h4 className="text-lg font-heading font-semibold text-property-text dark:text-white mb-4">
                  Property Details
                </h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Property name"
                    className="w-full px-3 py-2 rounded-lg border border-white/30 dark:border-white/20
                             bg-white/50 dark:bg-white/5 backdrop-blur-sm
                             text-property-text dark:text-white placeholder:text-property-text/50
                             focus:outline-none focus:ring-2 focus:ring-property-primary"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    className="w-full px-3 py-2 rounded-lg border border-white/30 dark:border-white/20
                             bg-white/50 dark:bg-white/5 backdrop-blur-sm
                             text-property-text dark:text-white placeholder:text-property-text/50
                             focus:outline-none focus:ring-2 focus:ring-property-primary"
                  />
                </div>
              </GlassCard>

              <GlassCard intensity="medium" className="p-6">
                <h4 className="text-lg font-heading font-semibold text-property-text dark:text-white mb-4">
                  Financial Info
                </h4>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Monthly rent"
                    className="w-full px-3 py-2 rounded-lg border border-white/30 dark:border-white/20
                             bg-white/50 dark:bg-white/5 backdrop-blur-sm
                             text-property-text dark:text-white placeholder:text-property-text/50
                             focus:outline-none focus:ring-2 focus:ring-property-primary"
                  />
                  <input
                    type="number"
                    placeholder="Deposit amount"
                    className="w-full px-3 py-2 rounded-lg border border-white/30 dark:border-white/20
                             bg-white/50 dark:bg-white/5 backdrop-blur-sm
                             text-property-text dark:text-white placeholder:text-property-text/50
                             focus:outline-none focus:ring-2 focus:ring-property-primary"
                  />
                </div>
              </GlassCard>
            </div>

            <div className="flex gap-3 mt-6">
              <GlassButton className="flex-1">Save Property</GlassButton>
              <GlassButton variant="ghost">Cancel</GlassButton>
            </div>
          </GlassPanel>
        </section>
      </div>
    </div>
  );
}

export default GlassComponentsTestPage;
