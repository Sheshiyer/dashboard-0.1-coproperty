"use client"

import * as React from "react"
import { XCircle, Download, Check, X, AlertTriangle, Mail } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GlassCard } from "@/components/ui/glass"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReservationBulkActionsToolbarProps {
  /** Number of currently selected reservations */
  selectedCount: number
  /** Total number of reservations available */
  totalCount: number
  /** Select all reservations */
  onSelectAll: () => void
  /** Clear all selections */
  onDeselectAll: () => void
  /** Cancel all selected reservations */
  onCancel: () => void
  /** Export selected reservations as CSV */
  onExport: () => void
  /** Change status for all selected reservations */
  onChangeStatus: (status: string) => void
  /** Message guests for selected reservations */
  onMessageGuest: () => void
}

type DestructiveAction = "cancel"

interface ConfirmDialogState {
  open: boolean
  action: DestructiveAction | null
}

// ---------------------------------------------------------------------------
// Confirmation dialog config
// ---------------------------------------------------------------------------

const CONFIRM_CONFIG: Record<
  DestructiveAction,
  { title: string; description: (count: number) => string; confirmLabel: string; variant: "destructive" | "default" }
> = {
  cancel: {
    title: "Cancel Reservations",
    description: (count) =>
      `Are you sure you want to cancel ${count} ${count === 1 ? "reservation" : "reservations"}? This will notify the guests and may trigger refunds.`,
    confirmLabel: "Cancel Reservations",
    variant: "destructive",
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReservationBulkActionsToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onCancel,
  onExport,
  onChangeStatus,
  onMessageGuest,
}: ReservationBulkActionsToolbarProps) {
  const [confirmDialog, setConfirmDialog] = React.useState<ConfirmDialogState>({
    open: false,
    action: null,
  })

  const openConfirm = (action: DestructiveAction) => {
    setConfirmDialog({ open: true, action })
  }

  const closeConfirm = () => {
    setConfirmDialog({ open: false, action: null })
  }

  const executeConfirmedAction = () => {
    if (confirmDialog.action === "cancel") {
      onCancel()
    }
    closeConfirm()
  }

  const config = confirmDialog.action ? CONFIRM_CONFIG[confirmDialog.action] : null
  const allSelected = selectedCount === totalCount && totalCount > 0

  return (
    <>
      {/* Toolbar */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="sticky top-20 z-40 mb-6"
          >
            <GlassCard intensity="strong" className="p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Selection Info */}
                <div className="flex items-center gap-3">
                  <Badge variant="glass" size="lg" className="text-base font-semibold">
                    {selectedCount} selected
                  </Badge>

                  {allSelected ? (
                    <Button variant="ghost" size="sm" onClick={onDeselectAll}>
                      <X className="h-4 w-4 mr-1" />
                      Deselect All
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={onSelectAll}>
                      <Check className="h-4 w-4 mr-1" />
                      Select All ({totalCount})
                    </Button>
                  )}
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Change Status */}
                  <Select onValueChange={onChangeStatus}>
                    <SelectTrigger variant="glass" className="w-44">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent variant="glass">
                      <SelectItem value="confirmed">Set Confirmed</SelectItem>
                      <SelectItem value="checked_in">Set Checked In</SelectItem>
                      <SelectItem value="checked_out">Set Checked Out</SelectItem>
                      <SelectItem value="pending">Set Pending</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Message Guest */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMessageGuest}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Message Guest
                  </Button>

                  {/* Cancel */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openConfirm("cancel")}
                    className="text-error-500 hover:bg-error-500/10"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>

                  {/* Export */}
                  <Button variant="glass" size="sm" onClick={onExport}>
                    <Download className="h-4 w-4 mr-1" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && closeConfirm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning-500" />
              {config?.title}
            </DialogTitle>
            <DialogDescription>
              {config?.description(selectedCount)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeConfirm}>
              Cancel
            </Button>
            <Button
              variant={config?.variant ?? "default"}
              onClick={executeConfirmedAction}
            >
              {config?.confirmLabel} ({selectedCount})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
