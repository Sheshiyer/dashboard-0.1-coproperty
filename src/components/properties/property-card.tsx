"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Bed, Bath, Users, MapPin, Home } from "lucide-react"
import { GlassCard } from "@/components/ui/glass"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { trackEvent } from "@/lib/analytics"
import type { PropertyCardData, PropertyStatus } from "@/types/property"
import { STATUS_CONFIG } from "@/types/property"
import { PropertyActionsMenu, type PropertyAction } from "./property-actions-menu"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PropertyCardProps {
  /** Property data to render */
  property: PropertyCardData
  /** Show loading skeleton instead of content */
  loading?: boolean
  /** Additional CSS classes for the outer wrapper */
  className?: string
  /** Callback when a quick action is selected from the dropdown menu */
  onAction?: (action: PropertyAction, propertyId: string) => void
  /** Whether this card is currently selected for bulk actions */
  isSelected?: boolean
  /** Toggle selection for bulk actions */
  onToggleSelect?: (id: string) => void
}

interface MetricProps {
  icon: React.ElementType
  value: string | number
  label: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract a short location string from a full address.
 * Takes the first two comma-separated parts (street + city).
 */
function shortLocation(address: string): string {
  if (!address) return "No address"
  const parts = address.split(",")
  return parts.slice(0, 2).join(",").trim() || address
}

/**
 * Resolve the badge variant for a given property status.
 */
function statusVariant(status: string) {
  const config = STATUS_CONFIG[status as PropertyStatus]
  return config?.variant ?? ("glass" as const)
}

/**
 * Resolve the display label for a given property status.
 */
function statusLabel(status: string) {
  const config = STATUS_CONFIG[status as PropertyStatus]
  return config?.label ?? status
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Single metric row inside the card */
function Metric({ icon: Icon, value, label }: MetricProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/40 dark:bg-white/5">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="font-heading font-semibold text-sm leading-tight truncate">
          {value}
        </p>
        <p className="text-xs text-muted-foreground leading-tight">{label}</p>
      </div>
    </div>
  )
}

/** Skeleton placeholder while data is loading */
function PropertyCardSkeleton({ className }: { className?: string }) {
  return (
    <GlassCard className={cn("animate-pulse overflow-hidden", className)}>
      {/* Image skeleton */}
      <div className="h-48 w-full bg-muted/50 rounded-t-lg" />

      {/* Content skeleton */}
      <div className="p-6 space-y-3">
        {/* Title */}
        <div className="h-5 w-2/3 bg-muted/50 rounded" />
        {/* Location */}
        <div className="h-4 w-1/2 bg-muted/50 rounded" />

        {/* Metrics grid - 3 items only */}
        <div className="space-y-3 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-8 w-8 bg-muted/50 rounded-md shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-12 bg-muted/50 rounded" />
                <div className="h-3 w-16 bg-muted/40 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}

// ---------------------------------------------------------------------------
// Fallback image component (no external dependency)
// ---------------------------------------------------------------------------

function PropertyImage({
  src,
  alt,
}: {
  src: string | undefined
  alt: string
}) {
  const [hasError, setHasError] = React.useState(false)

  if (!src || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/30 dark:bg-white/5">
        <Home className="h-12 w-12 text-muted-foreground/40" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover transition-transform duration-300 group-hover:scale-105"
      onError={() => setHasError(true)}
    />
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PropertyCard({ property, loading, className, onAction, isSelected, onToggleSelect }: PropertyCardProps) {
  if (loading) {
    return <PropertyCardSkeleton className={className} />
  }

  const {
    id,
    name,
    internal_code,
    address,
    imageUrl,
    bedrooms,
    bathrooms,
    max_guests,
    status,
    segment,
  } = property

  const displayName = name || internal_code || "Unnamed Property"

  const cardContent = (
    <GlassCard
      className={cn(
        "group overflow-hidden hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 cursor-pointer h-full",
        isSelected && "ring-2 ring-property-primary/60 shadow-property-primary/20"
      )}
    >
      {/* ---- Image ---- */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
        <PropertyImage src={imageUrl} alt={displayName} />

        {/* Selection Checkbox - top left corner */}
        {onToggleSelect && (
          <div
            className={cn(
              "absolute top-3 left-3 z-20 transition-opacity duration-200",
              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md backdrop-blur-lg bg-white/80 dark:bg-white/10 border border-white/30 dark:border-white/20 shadow-sm">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(id)}
                aria-label={`Select ${displayName}`}
              />
            </div>
          </div>
        )}

        {/* Quick Actions - next to checkbox or top left if no selection */}
        <div className={cn(
          "absolute top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          onToggleSelect ? "left-12" : "left-3"
        )}>
          <PropertyActionsMenu propertyId={id} onAction={onAction} />
        </div>

        {/* Badges overlay */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant={statusVariant(status)} size="sm">
            {statusLabel(status)}
          </Badge>
          {segment && (
            <Badge variant="glass" size="sm" className="capitalize">
              {segment}
            </Badge>
          )}
        </div>
      </div>

        {/* ---- Content ---- */}
        <div className="p-6">
          {/* Heading */}
          <h3 className="font-heading font-semibold text-lg leading-snug truncate">
            {displayName}
          </h3>

          {/* Location */}
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{shortLocation(address)}</span>
          </p>

          {/* Metrics - simplified to show only available data */}
          <div className="mt-4 space-y-3">
            <Metric icon={Bed} value={bedrooms} label="Bedrooms" />
            <Metric icon={Bath} value={bathrooms} label="Bathrooms" />
            <Metric
              icon={Users}
              value={max_guests}
              label="Max Guests"
            />
          </div>
        </div>
    </GlassCard>
  )

  return (
    <Link
      href={`/properties/${id}`}
      className={cn("block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg", className)}
      onClick={() => trackEvent("property_viewed", { propertyId: id })}
    >
      {cardContent}
    </Link>
  )
}

/**
 * Re-export the skeleton for use in Suspense boundaries
 * and loading states outside the card.
 */
export { PropertyCardSkeleton }
export type { PropertyAction } from "./property-actions-menu"
