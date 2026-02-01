"use client"

import { useState, useCallback, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import type { Reservation, Property } from "@/types/api"
import type { ReservationViewMode } from "@/types/reservation"
import { ReservationViewToggle } from "./reservation-view-toggle"
import { ReservationBulkActionsToolbar } from "./reservation-bulk-actions-toolbar"
import { DataTable } from "@/components/ui/data-table"
import { ReservationTimeline } from "@/components/properties/reservation-timeline"
import { ReservationCalendar } from "@/components/properties/reservation-calendar"
import { columns } from "@/app/(dashboard)/reservations/columns"
import { exportReservationsToCSV } from "@/lib/utils/reservation-export"
import { toast } from "@/components/ui/use-toast"

// ---------------------------------------------------------------------------
// Add checkbox column to existing columns
// ---------------------------------------------------------------------------

function createColumnsWithSelection(selectedIds: Set<string>, toggleSelection: (id: string) => void) {
  return [
    {
      id: "select",
      header: ({ table }: { table: { getRowModel: () => { rows: Array<{ original: { id: string } }> } } }) => {
        const allIds = table.getRowModel().rows.map((row) => row.original.id)
        const allSelected = allIds.length > 0 && allIds.every((id: string) => selectedIds.has(id))

        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => {
                if (allSelected) {
                  allIds.forEach((id: string) => selectedIds.has(id) && toggleSelection(id))
                } else {
                  allIds.forEach((id: string) => !selectedIds.has(id) && toggleSelection(id))
                }
              }}
              className="h-4 w-4 rounded border-gray-300 text-property-primary focus:ring-property-primary cursor-pointer"
            />
          </div>
        )
      },
      cell: ({ row }: { row: { original: { id: string } } }) => {
        const id = row.original.id
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedIds.has(id)}
              onChange={() => toggleSelection(id)}
              className="h-4 w-4 rounded border-gray-300 text-property-primary focus:ring-property-primary cursor-pointer"
            />
          </div>
        )
      },
      size: 40,
    },
    ...columns,
  ]
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReservationListProps {
  reservations: Reservation[]
  // properties are available but not currently used in this component
  // keeping for future features like property-based grouping
  properties?: Property[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReservationList({ reservations }: ReservationListProps) {
  const [viewMode, setViewMode] = useState<ReservationViewMode>("timeline")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // ---- Selection Handlers ----

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
    setSelectedIds(new Set(reservations.map((r) => r.id)))
  }, [reservations])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  // ---- Bulk Actions ----

  const handleCancel = useCallback(() => {
    const selectedReservations = reservations.filter((r) => selectedIds.has(r.id))
    console.log("Cancel reservations:", selectedReservations)
    toast({
      title: "Success",
      description: `Cancelled ${selectedIds.size} reservation(s)`,
    })
    // TODO: Implement actual cancellation logic
    deselectAll()
  }, [selectedIds, reservations, deselectAll])

  const handleChangeStatus = useCallback(
    (status: string) => {
      const selectedReservations = reservations.filter((r) => selectedIds.has(r.id))
      console.log("Change status to:", status, selectedReservations)
      toast({
        title: "Success",
        description: `Updated ${selectedIds.size} reservation(s) to ${status}`,
      })
      // TODO: Implement actual status change logic
      deselectAll()
    },
    [selectedIds, reservations, deselectAll]
  )

  const handleMessageGuest = useCallback(() => {
    const selectedReservations = reservations.filter((r) => selectedIds.has(r.id))
    console.log("Message guests for:", selectedReservations)
    toast({
      title: "Info",
      description: "Guest messaging feature coming soon",
    })
    // TODO: Implement guest messaging modal
  }, [selectedIds, reservations])

  const handleExport = useCallback(() => {
    const selectedReservations = reservations.filter((r) => selectedIds.has(r.id))
    exportReservationsToCSV(selectedReservations)
    toast({
      title: "Success",
      description: `Exported ${selectedIds.size} reservation(s) to CSV`,
    })
  }, [selectedIds, reservations])

  // ---- Memoized columns with selection ----

  const tableColumns = useMemo(() => {
    return createColumnsWithSelection(selectedIds, toggleSelection)
  }, [selectedIds, toggleSelection])

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex justify-end">
        <ReservationViewToggle
          onViewChange={setViewMode}
          defaultView="timeline"
        />
      </div>

      {/* Bulk Actions Toolbar (shows when items selected) */}
      <ReservationBulkActionsToolbar
        selectedCount={selectedIds.size}
        totalCount={reservations.length}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onCancel={handleCancel}
        onExport={handleExport}
        onChangeStatus={handleChangeStatus}
        onMessageGuest={handleMessageGuest}
      />

      {/* View Rendering */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === "table" && (
            <div className="rounded-xl border bg-card shadow">
              <div className="p-6">
                <DataTable columns={tableColumns} data={reservations} />
              </div>
            </div>
          )}

          {viewMode === "timeline" && (
            <ReservationTimeline
              propertyId="all"
              reservations={reservations}
            />
          )}

          {viewMode === "calendar" && (
            <ReservationCalendar
              propertyId="all"
              reservations={reservations}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
