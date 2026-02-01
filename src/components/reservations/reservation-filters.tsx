"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { GlassCard } from "@/components/ui/glass"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Property } from "@/types/api"
import {
  RESERVATION_STATUS_CONFIG,
  PLATFORM_CONFIG,
  DATE_RANGE_PRESETS,
  initialReservationFilters,
  type ReservationFilterState,
} from "@/types/reservation"
import { parseFiltersFromUrl, filtersToUrlParams, getActiveFilterCount } from "@/lib/utils/reservation-filters"

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface FilterSectionProps {
  label: string
  children: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}

function FilterSection({
  label,
  children,
  collapsible = false,
  defaultOpen = true,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between text-sm font-medium mb-3",
          collapsible && "cursor-pointer hover:text-foreground/80"
        )}
        onClick={() => collapsible && setIsOpen(!isOpen)}
        disabled={!collapsible}
      >
        <span>{label}</span>
        {collapsible && (
          <span className="text-muted-foreground">
            {isOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </span>
        )}
      </button>
      {isOpen && <div className="space-y-2">{children}</div>}
    </div>
  )
}

interface CheckboxFilterProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function CheckboxFilter({ label, checked, onChange }: CheckboxFilterProps) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
      />
      <span
        className={cn(
          "text-sm transition-colors duration-150",
          checked
            ? "text-foreground font-medium"
            : "text-muted-foreground group-hover:text-foreground"
        )}
      >
        {label}
      </span>
    </label>
  )
}

// ---------------------------------------------------------------------------
// Active Filter Pills
// ---------------------------------------------------------------------------

interface ActiveFilterPillsProps {
  filters: ReservationFilterState
  onRemove: (key: keyof ReservationFilterState, value?: string) => void
  properties: Property[]
}

function ActiveFilterPills({ filters, onRemove, properties }: ActiveFilterPillsProps) {
  const pills: { key: keyof ReservationFilterState; value: string; label: string }[] = []

  for (const status of filters.status) {
    const config = RESERVATION_STATUS_CONFIG[status]
    pills.push({
      key: "status",
      value: status,
      label: `Status: ${config?.label || status}`
    })
  }

  for (const propertyId of filters.property) {
    const property = properties.find(p => p.id === propertyId)
    pills.push({
      key: "property",
      value: propertyId,
      label: `Property: ${property?.name || propertyId}`
    })
  }

  for (const platform of filters.platform) {
    const config = PLATFORM_CONFIG[platform]
    pills.push({
      key: "platform",
      value: platform,
      label: `Platform: ${config?.label || platform}`
    })
  }

  if (filters.dateRange && filters.dateRange !== 'upcoming') {
    const preset = DATE_RANGE_PRESETS.find(p => p.value === filters.dateRange)
    pills.push({
      key: "dateRange",
      value: filters.dateRange,
      label: `Date: ${preset?.label || filters.dateRange}`
    })
  }

  if (pills.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
      {pills.map((pill) => (
        <button
          key={`${pill.key}-${pill.value}`}
          type="button"
          onClick={() => onRemove(pill.key, pill.value)}
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
            "bg-property-primary/10 text-property-primary border border-property-primary/20",
            "hover:bg-property-primary/20 transition-colors duration-150",
            "capitalize"
          )}
        >
          {pill.label}
          <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main ReservationFilters Component
// ---------------------------------------------------------------------------

interface ReservationFiltersProps {
  properties: Property[]
}

export function ReservationFilters({ properties }: ReservationFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Initialize filters from URL params
  const [filters, setFilters] = useState<ReservationFilterState>(() => {
    const fromUrl = parseFiltersFromUrl(searchParams)
    return { ...initialReservationFilters, ...fromUrl }
  })

  // Mobile panel visibility
  const [isOpen, setIsOpen] = useState(false)

  // Sync URL params when filters change
  const syncUrl = useCallback(
    (nextFilters: ReservationFilterState) => {
      const params = filtersToUrlParams(nextFilters)
      const query = params.toString()
      startTransition(() => {
        router.push(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        })
      })
    },
    [router, pathname]
  )

  // Update filters and auto-apply (sync to URL)
  const updateFilters = useCallback(
    (updater: (prev: ReservationFilterState) => ReservationFilterState) => {
      setFilters((prev) => {
        const next = updater(prev)
        syncUrl(next)
        return next
      })
    },
    [syncUrl]
  )

  // Re-sync from URL if searchParams change externally (e.g. browser back)
  useEffect(() => {
    const fromUrl = parseFiltersFromUrl(searchParams)
    setFilters({ ...initialReservationFilters, ...fromUrl })
  }, [searchParams])

  // Toggle a value in a multi-select array filter
  const toggleArrayFilter = useCallback(
    (key: "status" | "platform" | "property", value: string, checked: boolean) => {
      updateFilters((prev) => ({
        ...prev,
        [key]: checked
          ? [...prev[key], value]
          : prev[key].filter((v) => v !== value),
      }))
    },
    [updateFilters]
  )

  // Remove a single filter pill
  const removeFilter = useCallback(
    (key: keyof ReservationFilterState, value?: string) => {
      updateFilters((prev) => {
        if (key === "dateRange") {
          return { ...prev, dateRange: "upcoming", customFrom: undefined, customTo: undefined }
        }
        if (value && Array.isArray(prev[key])) {
          return {
            ...prev,
            [key]: (prev[key] as string[]).filter((v) => v !== value),
          }
        }
        return prev
      })
    },
    [updateFilters]
  )

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(initialReservationFilters)
    startTransition(() => {
      router.push(pathname, { scroll: false })
    })
  }, [router, pathname])

  const activeCount = getActiveFilterCount(filters)

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="glass"
        className="md:hidden mb-4 w-full justify-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <SlidersHorizontal className="h-4 w-4 mr-2" />
        Filters
        {activeCount > 0 && (
          <Badge variant="glass" size="sm" className="ml-2">
            {activeCount}
          </Badge>
        )}
      </Button>

      {/* Filter Panel */}
      <GlassCard
        className={cn(
          "p-6 transition-all duration-300",
          !isOpen && "hidden md:block",
          isPending && "opacity-70"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm tracking-wide uppercase">
              Filters
            </h3>
            {activeCount > 0 && (
              <Badge variant="default" size="sm">
                {activeCount}
              </Badge>
            )}
          </div>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Reset All
            </Button>
          )}
        </div>

        {/* Filter Sections */}
        <div className="space-y-6">
          {/* Status Filter */}
          <FilterSection label="Status">
            {Object.entries(RESERVATION_STATUS_CONFIG).map(([value, config]) => (
              <CheckboxFilter
                key={value}
                label={config.label}
                checked={filters.status.includes(value)}
                onChange={(checked) =>
                  toggleArrayFilter("status", value, checked)
                }
              />
            ))}
          </FilterSection>

          {/* Property Filter */}
          <FilterSection label="Property">
            {properties.map((property) => (
              <CheckboxFilter
                key={property.id}
                label={property.name}
                checked={filters.property.includes(property.id)}
                onChange={(checked) =>
                  toggleArrayFilter("property", property.id, checked)
                }
              />
            ))}
          </FilterSection>

          {/* Platform Filter */}
          <FilterSection label="Platform">
            {Object.entries(PLATFORM_CONFIG).map(([value, config]) => (
              <CheckboxFilter
                key={value}
                label={config.label}
                checked={filters.platform.includes(value)}
                onChange={(checked) =>
                  toggleArrayFilter("platform", value, checked)
                }
              />
            ))}
          </FilterSection>

          {/* Date Range Filter */}
          <FilterSection label="Date Range">
            <Select
              value={filters.dateRange || "upcoming"}
              onValueChange={(value) =>
                updateFilters((prev) => ({
                  ...prev,
                  dateRange: value,
                  customFrom: value === 'custom' ? prev.customFrom : undefined,
                  customTo: value === 'custom' ? prev.customTo : undefined,
                }))
              }
            >
              <SelectTrigger variant="glass">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent variant="glass">
                {DATE_RANGE_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Custom Date Range Inputs */}
            {filters.dateRange === 'custom' && (
              <div className="mt-3 space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    From
                  </label>
                  <Input
                    type="date"
                    value={filters.customFrom || ''}
                    onChange={(e) =>
                      updateFilters((prev) => ({
                        ...prev,
                        customFrom: e.target.value,
                      }))
                    }
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    To
                  </label>
                  <Input
                    type="date"
                    value={filters.customTo || ''}
                    onChange={(e) =>
                      updateFilters((prev) => ({
                        ...prev,
                        customTo: e.target.value,
                      }))
                    }
                    className="h-9"
                  />
                </div>
              </div>
            )}
          </FilterSection>
        </div>

        {/* Active Filter Pills */}
        <ActiveFilterPills
          filters={filters}
          onRemove={removeFilter}
          properties={properties}
        />
      </GlassCard>
    </>
  )
}

// ---------------------------------------------------------------------------
// Hook: Use reservation filters for data filtering
// ---------------------------------------------------------------------------

export function useReservationFilters(): ReservationFilterState {
  const searchParams = useSearchParams()
  const fromUrl = parseFiltersFromUrl(searchParams)
  return { ...initialReservationFilters, ...fromUrl }
}
