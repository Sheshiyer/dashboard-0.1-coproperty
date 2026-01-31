"use client"

import * as React from "react"
import Image from "next/image"
import { Home, Download, TrendingUp } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PropertyCardData, PropertyStatus } from "@/types/property"
import { STATUS_CONFIG } from "@/types/property"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PropertyComparisonModalProps {
  /** Array of 2-3 properties to compare side by side */
  properties: PropertyCardData[]
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback to close the modal */
  onClose: () => void
}

interface ComparisonField {
  key: string
  label: string
  render: (property: PropertyCardData) => React.ReactNode
  /** If true, higher numeric values are considered "better" for highlighting */
  higherIsBetter?: boolean
  /** If true, this field contains a renderable element (not text for diff) */
  isVisual?: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusLabel(status: string): string {
  const config = STATUS_CONFIG[status as PropertyStatus]
  return config?.label ?? status
}

function statusVariant(status: string) {
  const config = STATUS_CONFIG[status as PropertyStatus]
  return config?.variant ?? ("glass" as const)
}

/**
 * Determines if all values in an array are identical for diff highlighting.
 * Compares string representations for consistency.
 */
function allValuesMatch(values: React.ReactNode[]): boolean {
  if (values.length < 2) return true
  const strings = values.map((v) => {
    if (v === null || v === undefined) return ""
    if (typeof v === "string" || typeof v === "number") return String(v)
    return "__element__"
  })
  // For React elements, we cannot meaningfully compare
  if (strings.some((s) => s === "__element__")) return true
  return strings.every((s) => s === strings[0])
}

/**
 * Given an array of numeric-ish values, find the index of the best.
 * Returns -1 if not comparable.
 */
function findBestIndex(
  properties: PropertyCardData[],
  extractor: (p: PropertyCardData) => number | undefined,
  higherIsBetter: boolean,
): number {
  const values = properties.map(extractor)
  const validValues = values.filter(
    (v): v is number => v !== undefined && v !== null,
  )
  if (validValues.length < 2) return -1

  const bestValue = higherIsBetter
    ? Math.max(...validValues)
    : Math.min(...validValues)

  return values.indexOf(bestValue)
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PropertyThumbnail({
  src,
  alt,
}: {
  src: string | undefined
  alt: string
}) {
  const [hasError, setHasError] = React.useState(false)

  if (!src || hasError) {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded-lg bg-muted/30 dark:bg-white/5">
        <Home className="h-10 w-10 text-muted-foreground/40" />
      </div>
    )
  }

  return (
    <div className="relative h-32 w-full overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, 300px"
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  )
}

function BestIndicator() {
  return (
    <span className="ml-1.5 inline-flex items-center text-success-500">
      <TrendingUp className="h-3.5 w-3.5" />
    </span>
  )
}

/**
 * A single comparison row in the table.
 * Highlights cells whose values differ from other columns.
 */
function ComparisonRow({
  label,
  values,
  isDifferent,
  bestIndex,
}: {
  label: string
  values: React.ReactNode[]
  isDifferent: boolean
  bestIndex: number
}) {
  return (
    <tr
      className={cn(
        "border-b border-border/30 transition-colors",
        isDifferent && "bg-warning-500/5 dark:bg-warning-500/10",
      )}
    >
      <td className="p-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
        {label}
      </td>
      {values.map((value, i) => (
        <td
          key={i}
          className={cn(
            "p-3 text-sm",
            bestIndex === i && "font-semibold text-success-500",
          )}
        >
          <div className="flex items-center">
            {value}
            {bestIndex === i && <BestIndicator />}
          </div>
        </td>
      ))}
    </tr>
  )
}

/**
 * Mobile-friendly comparison card for a single property.
 * Used when the viewport is too narrow for the table layout.
 */
function MobilePropertyCard({
  property,
  fields,
  index,
}: {
  property: PropertyCardData
  fields: ComparisonField[]
  index: number
}) {
  const displayName = property.name || property.internal_code || "Unnamed"

  return (
    <div className="rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-property-primary text-white text-xs font-bold">
          {index + 1}
        </span>
        <h4 className="font-heading font-semibold text-base truncate">
          {displayName}
        </h4>
      </div>

      <PropertyThumbnail src={property.imageUrl} alt={displayName} />

      <dl className="space-y-2 mt-3">
        {fields
          .filter((f) => f.key !== "image")
          .map((field) => (
            <div
              key={field.key}
              className="flex justify-between items-center py-1 border-b border-border/20 last:border-0"
            >
              <dt className="text-xs text-muted-foreground">{field.label}</dt>
              <dd className="text-sm font-medium">{field.render(property)}</dd>
            </div>
          ))}
      </dl>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Comparison Fields Definition
// ---------------------------------------------------------------------------

const comparisonFields: ComparisonField[] = [
  {
    key: "image",
    label: "Property",
    isVisual: true,
    render: (p) => (
      <PropertyThumbnail
        src={p.imageUrl}
        alt={p.name || p.internal_code || "Property"}
      />
    ),
  },
  {
    key: "name",
    label: "Name",
    render: (p) => (
      <span className="font-semibold">
        {p.name || p.internal_code || "Unnamed"}
      </span>
    ),
  },
  {
    key: "address",
    label: "Location",
    render: (p) => (
      <span className="text-muted-foreground">{p.address || "--"}</span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (p) => (
      <Badge variant={statusVariant(p.status)} size="sm">
        {statusLabel(p.status)}
      </Badge>
    ),
  },
  {
    key: "type",
    label: "Property Type",
    render: (p) =>
      p.segment ? (
        <Badge variant="glass" size="sm" className="capitalize">
          {p.segment}
        </Badge>
      ) : (
        <span className="text-muted-foreground">--</span>
      ),
  },
  {
    key: "bedrooms",
    label: "Bedrooms",
    higherIsBetter: true,
    render: (p) => String(p.bedrooms ?? "--"),
  },
  {
    key: "bathrooms",
    label: "Bathrooms",
    higherIsBetter: true,
    render: (p) => String(p.bathrooms ?? "--"),
  },
  {
    key: "maxGuests",
    label: "Max Guests",
    higherIsBetter: true,
    render: (p) => String(p.max_guests ?? "--"),
  },
  {
    key: "checkIn",
    label: "Check-in Time",
    render: (p) => p.check_in_time || "--",
  },
  {
    key: "checkOut",
    label: "Check-out Time",
    render: (p) => p.check_out_time || "--",
  },
]

// Numeric extractors for "best value" highlighting
const numericExtractors: Partial<Record<
  string,
  (p: PropertyCardData) => number | undefined
>> = {
  bedrooms: (p) => p.bedrooms,
  bathrooms: (p) => p.bathrooms,
  maxGuests: (p) => p.max_guests,
}

// ---------------------------------------------------------------------------
// Export helpers (placeholder for PDF/CSV)
// ---------------------------------------------------------------------------

function exportComparison(
  properties: PropertyCardData[],
  format: "csv" | "pdf",
) {
  if (format === "csv") {
    const headers = ["Attribute", ...properties.map((_, i) => `Property ${i + 1}`)]
    const rows = comparisonFields
      .filter((f) => !f.isVisual)
      .map((field) => {
        const values = properties.map((p) => {
          const rendered = field.render(p)
          if (typeof rendered === "string") return rendered
          if (typeof rendered === "number") return String(rendered)
          // For React elements, extract text content as best we can
          return String(
            (p as unknown as Record<string, unknown>)[field.key] ?? "--",
          )
        })
        return [field.label, ...values]
      })

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `property-comparison-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  } else {
    // PDF export placeholder - would integrate with a PDF library
    console.log("PDF export not yet implemented")
  }
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function PropertyComparisonModal({
  properties,
  isOpen,
  onClose,
}: PropertyComparisonModalProps) {
  // Guard: must have at least 2 properties to compare
  if (properties.length < 2) return null

  // Limit to 3 properties max
  const compareList = properties.slice(0, 3)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "max-w-6xl max-h-[90vh] overflow-y-auto p-0",
          // Glass modal styling
          "backdrop-blur-2xl",
          "bg-white/90 dark:bg-gray-900/90",
          "border border-white/30 dark:border-white/15",
          "shadow-2xl shadow-primary/10",
        )}
      >
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-border/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-heading font-semibold">
                Property Comparison ({compareList.length})
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Side-by-side comparison of selected properties. Differences are
                highlighted.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportComparison(compareList, "csv")}
                className="hidden sm:inline-flex"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Desktop: Table layout */}
        <div className="hidden md:block overflow-x-auto px-6 pb-6 pt-2">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[140px]">
                  Attribute
                </th>
                {compareList.map((p, i) => (
                  <th
                    key={p.id}
                    className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[200px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-property-primary text-white text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span className="truncate">
                        {p.name || p.internal_code || `Property ${i + 1}`}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFields.map((field) => {
                const renderedValues = compareList.map((p) => field.render(p))
                const isDifferent = !allValuesMatch(renderedValues)
                const extractor = numericExtractors[field.key]
                const bestIndex =
                  extractor && field.higherIsBetter
                    ? findBestIndex(compareList, extractor, true)
                    : -1

                return (
                  <ComparisonRow
                    key={field.key}
                    label={field.label}
                    values={renderedValues}
                    isDifferent={isDifferent && !field.isVisual}
                    bestIndex={bestIndex}
                  />
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile: Stacked card layout */}
        <div className="md:hidden px-4 pb-4 pt-2 space-y-4">
          {compareList.map((property, i) => (
            <MobilePropertyCard
              key={property.id}
              property={property}
              fields={comparisonFields}
              index={i}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="border-t border-border/30 px-6 py-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-warning-500/10 border border-warning-500/30" />
            <span>Values differ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-success-500" />
            <span>Best value</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PropertyComparisonModal
