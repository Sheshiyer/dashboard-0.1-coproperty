"use client"

import { useState, useMemo, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/app/(dashboard)/properties/columns"
import { PropertyCard } from "@/components/properties/property-card"
import { BulkActionsToolbar } from "@/components/properties/bulk-actions-toolbar"
import {
  PropertyViewToggle,
  type ViewMode,
} from "@/components/properties/property-view-toggle"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { Property } from "@/types/api"
import type { PropertyCardData } from "@/types/property"

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a plain Property to PropertyCardData.
 * The card component handles missing optional fields gracefully.
 */
function toCardData(property: Property): PropertyCardData {
  return {
    ...property,
    imageUrl: property.picture
  }
}

/**
 * Generate a CSV string from an array of properties.
 */
function generateCSV(properties: Property[]): string {
  const headers = [
    "ID",
    "Name",
    "Internal Code",
    "Address",
    "Status",
    "Segment",
    "Bedrooms",
    "Bathrooms",
    "Max Guests",
    "Check-In Time",
    "Check-Out Time",
  ]

  const escapeField = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return ""
    const str = String(value)
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const rows = properties.map((p) =>
    [
      p.id,
      p.name,
      p.internal_code,
      p.address,
      p.status,
      p.segment ?? "",
      p.bedrooms,
      p.bathrooms,
      p.max_guests,
      p.check_in_time,
      p.check_out_time,
    ]
      .map(escapeField)
      .join(",")
  )

  return [headers.join(","), ...rows].join("\n")
}

/**
 * Trigger a CSV file download in the browser.
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface CardGridProps {
  properties: PropertyCardData[]
  gridClassName: string
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
}

function CardGrid({ properties, gridClassName, selectedIds, onToggleSelect }: CardGridProps) {
  return (
    <motion.div
      key="card-grid"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={gridClassName}
    >
      {properties.map((property) => (
        <motion.div key={property.id} variants={itemVariants}>
          <PropertyCard
            property={property}
            isSelected={selectedIds.has(property.id)}
            onToggleSelect={onToggleSelect}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface PropertyListProps {
  /** Property data to render */
  properties: Property[]
  /** Additional CSS classes for the outer wrapper */
  className?: string
}

export function PropertyList({ properties, className }: PropertyListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const cardData = useMemo(
    () => properties.map(toCardData),
    [properties]
  )

  // ---- Selection handlers ----

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(properties.map((p) => p.id)))
  }, [properties])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  // ---- Bulk action handlers ----

  const handleArchive = useCallback(() => {
    const ids = Array.from(selectedIds)
    console.log("[BulkAction] Archive:", ids)
    // TODO: API call to archive properties
    deselectAll()
  }, [selectedIds, deselectAll])

  const handleDelete = useCallback(() => {
    const ids = Array.from(selectedIds)
    console.log("[BulkAction] Delete:", ids)
    // TODO: API call to delete properties
    deselectAll()
  }, [selectedIds, deselectAll])

  const handleExport = useCallback(() => {
    const selected = properties.filter((p) => selectedIds.has(p.id))
    const csv = generateCSV(selected)
    const timestamp = new Date().toISOString().slice(0, 10)
    downloadCSV(csv, `properties-export-${timestamp}.csv`)
  }, [properties, selectedIds])

  const handleChangeStatus = useCallback(
    (status: string) => {
      const ids = Array.from(selectedIds)
      console.log("[BulkAction] Change Status:", { ids, status })
      // TODO: API call to update property statuses
      deselectAll()
    },
    [selectedIds, deselectAll]
  )

  return (
    <div className={cn("space-y-6", className)}>
      {/* View Toggle - right-aligned */}
      <div className="flex justify-end">
        <PropertyViewToggle onViewChange={setViewMode} />
      </div>

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedIds.size}
        totalCount={properties.length}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onArchive={handleArchive}
        onDelete={handleDelete}
        onExport={handleExport}
        onChangeStatus={handleChangeStatus}
      />

      {/* View Content */}
      <AnimatePresence mode="wait">
        {viewMode === "table" && (
          <motion.div
            key="table-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border bg-card shadow"
          >
            <div className="p-6">
              {/* Table with selection checkboxes */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground">
                  <Checkbox
                    checked={
                      selectedIds.size === properties.length &&
                      properties.length > 0
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectAll()
                      } else {
                        deselectAll()
                      }
                    }}
                    aria-label="Select all properties"
                  />
                  <span>
                    {selectedIds.size > 0
                      ? `${selectedIds.size} of ${properties.length} selected`
                      : "Select all"}
                  </span>
                </div>
                <DataTable columns={columns} data={properties} />
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === "cards" && (
          <CardGrid
            key="cards-view"
            properties={cardData}
            gridClassName="grid grid-cols-1 lg:grid-cols-2 gap-6"
            selectedIds={selectedIds}
            onToggleSelect={toggleSelection}
          />
        )}

        {viewMode === "grid" && (
          <CardGrid
            key="grid-view"
            properties={cardData}
            gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            selectedIds={selectedIds}
            onToggleSelect={toggleSelection}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
