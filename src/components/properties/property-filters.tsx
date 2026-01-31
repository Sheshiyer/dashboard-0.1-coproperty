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
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Filter Configuration
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "maintenance", label: "Maintenance" },
] as const

const TYPE_OPTIONS = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "condo", label: "Condo" },
] as const

const LOCATION_OPTIONS = [
  { value: "downtown", label: "Downtown" },
  { value: "suburbs", label: "Suburbs" },
  { value: "beachfront", label: "Beachfront" },
  { value: "mountain", label: "Mountain" },
  { value: "countryside", label: "Countryside" },
] as const

const BEDROOM_OPTIONS = [
  { value: "1", label: "1 Bedroom" },
  { value: "2", label: "2 Bedrooms" },
  { value: "3", label: "3 Bedrooms" },
  { value: "4+", label: "4+ Bedrooms" },
] as const

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PropertyFilterState {
  status: string[]
  type: string[]
  location: string
  bedrooms: string[]
}

const DEFAULT_FILTERS: PropertyFilterState = {
  status: [],
  type: [],
  location: "",
  bedrooms: [],
}

// ---------------------------------------------------------------------------
// Helper: Parse filters from URL search params
// ---------------------------------------------------------------------------

function parseFiltersFromParams(params: URLSearchParams): PropertyFilterState {
  return {
    status: params.get("status")?.split(",").filter(Boolean) ?? [],
    type: params.get("type")?.split(",").filter(Boolean) ?? [],
    location: params.get("location") ?? "",
    bedrooms: params.get("bedrooms")?.split(",").filter(Boolean) ?? [],
  }
}

// ---------------------------------------------------------------------------
// Helper: Build URL search params from filter state
// ---------------------------------------------------------------------------

function buildParamsFromFilters(filters: PropertyFilterState): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.status.length > 0) params.set("status", filters.status.join(","))
  if (filters.type.length > 0) params.set("type", filters.type.join(","))
  if (filters.location) params.set("location", filters.location)
  if (filters.bedrooms.length > 0)
    params.set("bedrooms", filters.bedrooms.join(","))
  return params
}

// ---------------------------------------------------------------------------
// Helper: Count active filters
// ---------------------------------------------------------------------------

function countActiveFilters(filters: PropertyFilterState): number {
  return (
    filters.status.length +
    filters.type.length +
    (filters.location ? 1 : 0) +
    filters.bedrooms.length
  )
}

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
  filters: PropertyFilterState
  onRemove: (key: keyof PropertyFilterState, value?: string) => void
}

function ActiveFilterPills({ filters, onRemove }: ActiveFilterPillsProps) {
  const pills: { key: keyof PropertyFilterState; value: string; label: string }[] = []

  for (const status of filters.status) {
    pills.push({ key: "status", value: status, label: `Status: ${status}` })
  }
  for (const type of filters.type) {
    pills.push({ key: "type", value: type, label: `Type: ${type}` })
  }
  if (filters.location) {
    pills.push({
      key: "location",
      value: filters.location,
      label: `Location: ${filters.location}`,
    })
  }
  for (const bed of filters.bedrooms) {
    pills.push({
      key: "bedrooms",
      value: bed,
      label: `${bed} bed${bed !== "1" ? "s" : ""}`,
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
// Main PropertyFilters Component
// ---------------------------------------------------------------------------

export function PropertyFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Initialize filters from URL params
  const [filters, setFilters] = useState<PropertyFilterState>(() =>
    parseFiltersFromParams(searchParams)
  )

  // Mobile panel visibility
  const [isOpen, setIsOpen] = useState(false)

  // Sync URL params when filters change
  const syncUrl = useCallback(
    (nextFilters: PropertyFilterState) => {
      const params = buildParamsFromFilters(nextFilters)
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
    (updater: (prev: PropertyFilterState) => PropertyFilterState) => {
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
    const fromUrl = parseFiltersFromParams(searchParams)
    setFilters(fromUrl)
  }, [searchParams])

  // Toggle a value in a multi-select array filter
  const toggleArrayFilter = useCallback(
    (key: "status" | "type" | "bedrooms", value: string, checked: boolean) => {
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
    (key: keyof PropertyFilterState, value?: string) => {
      updateFilters((prev) => {
        if (key === "location") {
          return { ...prev, location: "" }
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
    setFilters(DEFAULT_FILTERS)
    startTransition(() => {
      router.push(pathname, { scroll: false })
    })
  }, [router, pathname])

  const activeCount = countActiveFilters(filters)

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
            {STATUS_OPTIONS.map((option) => (
              <CheckboxFilter
                key={option.value}
                label={option.label}
                checked={filters.status.includes(option.value)}
                onChange={(checked) =>
                  toggleArrayFilter("status", option.value, checked)
                }
              />
            ))}
          </FilterSection>

          {/* Property Type Filter */}
          <FilterSection label="Property Type">
            {TYPE_OPTIONS.map((option) => (
              <CheckboxFilter
                key={option.value}
                label={option.label}
                checked={filters.type.includes(option.value)}
                onChange={(checked) =>
                  toggleArrayFilter("type", option.value, checked)
                }
              />
            ))}
          </FilterSection>

          {/* Location Filter */}
          <FilterSection label="Location">
            <Select
              value={filters.location || "all"}
              onValueChange={(value) =>
                updateFilters((prev) => ({
                  ...prev,
                  location: value === "all" ? "" : value,
                }))
              }
            >
              <SelectTrigger variant="glass">
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent variant="glass">
                <SelectItem value="all">All locations</SelectItem>
                {LOCATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          {/* Bedrooms Filter */}
          <FilterSection label="Bedrooms">
            {BEDROOM_OPTIONS.map((option) => (
              <CheckboxFilter
                key={option.value}
                label={option.label}
                checked={filters.bedrooms.includes(option.value)}
                onChange={(checked) =>
                  toggleArrayFilter("bedrooms", option.value, checked)
                }
              />
            ))}
          </FilterSection>
        </div>

        {/* Active Filter Pills */}
        <ActiveFilterPills filters={filters} onRemove={removeFilter} />
      </GlassCard>
    </>
  )
}

// ---------------------------------------------------------------------------
// Hook: Use property filters for data filtering
// ---------------------------------------------------------------------------

export function usePropertyFilters(): PropertyFilterState {
  const searchParams = useSearchParams()
  return parseFiltersFromParams(searchParams)
}

/**
 * Filter properties array based on current filter state.
 * Designed for client-side filtering of already-fetched data.
 */
export function filterProperties<
  T extends {
    status?: string
    segment?: string
    address?: string
    bedrooms?: number
  },
>(properties: T[], filters: PropertyFilterState): T[] {
  return properties.filter((property) => {
    // Status filter
    if (
      filters.status.length > 0 &&
      !filters.status.includes(property.status ?? "")
    ) {
      return false
    }

    // Type / segment filter
    if (
      filters.type.length > 0 &&
      !filters.type.includes((property.segment ?? "").toLowerCase())
    ) {
      return false
    }

    // Location filter (fuzzy match on address)
    if (
      filters.location &&
      !(property.address ?? "").toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false
    }

    // Bedrooms filter
    if (filters.bedrooms.length > 0) {
      const beds = property.bedrooms ?? 0
      const matches = filters.bedrooms.some((filter) => {
        if (filter === "4+") return beds >= 4
        return beds === parseInt(filter, 10)
      })
      if (!matches) return false
    }

    return true
  })
}
