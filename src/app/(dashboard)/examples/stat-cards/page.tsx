"use client"

import { StatCardExamples, DashboardStatsSection } from "@/components/ui/stat-card.examples"

export default function StatCardsExamplePage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-heading font-bold mb-2">StatCard Component</h1>
        <p className="text-lg text-muted-foreground">
          Animated stat cards with sparklines for displaying key metrics
        </p>
      </div>

      {/* Dashboard Context Example */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-heading font-bold mb-2">Dashboard Example</h2>
          <p className="text-muted-foreground">
            Real-world example of how StatCards work in a dashboard context
          </p>
        </div>
        <DashboardStatsSection />
      </section>

      {/* All Examples */}
      <StatCardExamples />
    </div>
  )
}
