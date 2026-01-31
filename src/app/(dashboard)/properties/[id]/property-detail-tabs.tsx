"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GlassCard } from "@/components/ui/glass"
import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Sparkles,
  ClipboardCheck,
  StickyNote,
} from "lucide-react"
import type { PropertyWithDetails } from "@/types/api"
import { PropertyInfoCards } from "@/components/properties/property-info-cards"
import { ReservationCalendar } from "@/components/properties/reservation-calendar"
import { ReservationTimeline } from "@/components/properties/reservation-timeline"
import { RevenueAnalytics } from "@/components/properties/revenue-analytics"
import { OccupancyAnalytics } from "@/components/properties/occupancy-analytics"
import { CleaningHistory } from "@/components/properties/cleaning-history"
import { TaskHistory } from "@/components/properties/task-history"
import { PropertyNotes } from "@/components/properties/property-notes"

interface PropertyDetailTabsProps {
  property: PropertyWithDetails
}

const tabs = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "reservations", label: "Reservations", icon: CalendarDays },
  { value: "analytics", label: "Analytics", icon: BarChart3 },
  { value: "cleaning", label: "Cleaning", icon: Sparkles },
  { value: "tasks", label: "Tasks", icon: ClipboardCheck },
  { value: "notes", label: "Notes", icon: StickyNote },
] as const

export function PropertyDetailTabs({ property }: PropertyDetailTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      {/* Tab Navigation - Glass morphism with horizontal scroll on mobile */}
      <TabsList className="w-full justify-start overflow-x-auto scrollbar-hide backdrop-blur-xl bg-white/80 dark:bg-gray-900/60 border border-white/20 dark:border-white/10 rounded-lg p-1 h-auto flex-nowrap">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap data-[state=active]:bg-property-primary/10 data-[state=active]:text-property-primary data-[state=active]:shadow-sm rounded-md transition-all duration-200 shrink-0"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label}</span>
            </TabsTrigger>
          )
        })}
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="mt-6 space-y-6">
        <PropertyInfoCards property={property} />

        {/* Quick Stats Summary */}
        <div className="grid gap-6 md:grid-cols-3">
          <GlassCard className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Reservations</p>
            <p className="text-3xl font-bold text-property-primary mt-1">
              {property.reservations?.length || 0}
            </p>
          </GlassCard>
          <GlassCard className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Cleaning Jobs</p>
            <p className="text-3xl font-bold text-property-primary mt-1">
              {property.cleaning_jobs?.length || 0}
            </p>
          </GlassCard>
          <GlassCard className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Active Tasks</p>
            <p className="text-3xl font-bold text-property-primary mt-1">
              {property.tasks?.filter((t) => t.status !== "completed")
                .length || 0}
            </p>
          </GlassCard>
        </div>
      </TabsContent>

      {/* Reservations Tab */}
      <TabsContent value="reservations" className="mt-6 space-y-6">
        <ReservationCalendar
          propertyId={property.id}
          reservations={property.reservations || []}
        />
        <ReservationTimeline
          propertyId={property.id}
          reservations={property.reservations || []}
        />
      </TabsContent>

      {/* Analytics Tab - with nested sub-tabs */}
      <TabsContent value="analytics" className="mt-6 space-y-6">
        <GlassCard className="p-6">
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="mb-6 bg-muted/50">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
            </TabsList>
            <TabsContent value="revenue">
              <RevenueAnalytics propertyId={property.id} />
            </TabsContent>
            <TabsContent value="occupancy">
              <OccupancyAnalytics propertyId={property.id} />
            </TabsContent>
          </Tabs>
        </GlassCard>
      </TabsContent>

      {/* Cleaning Tab */}
      <TabsContent value="cleaning" className="mt-6 space-y-6">
        <CleaningHistory property={{ id: property.id, name: property.name || "Property" }} />
      </TabsContent>

      {/* Tasks Tab */}
      <TabsContent value="tasks" className="mt-6 space-y-6">
        <TaskHistory property={property} />
      </TabsContent>

      {/* Notes Tab */}
      <TabsContent value="notes" className="mt-6 space-y-6">
        <PropertyNotes property={property} />
      </TabsContent>
    </Tabs>
  )
}
