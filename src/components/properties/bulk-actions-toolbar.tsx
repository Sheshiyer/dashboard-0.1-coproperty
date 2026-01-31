"use client"

import * as React from "react"
import { Archive, Trash2, Download, Check, X, AlertTriangle } from "lucide-react"
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

export interface BulkActionsToolbarProps {
  /** Number of currently selected properties */
  selectedCount: number
  /** Total number of properties available */
  totalCount: number
  /** Select all properties */
  onSelectAll: () => void
  /** Clear all selections */
  onDeselectAll: () => void
  /** Archive all selected properties */
  onArchive: () => void
  /** Delete all selected properties */
  onDelete: () => void
  /** Export selected properties as CSV */
  onExport: () => void
  /** Change status for all selected properties */
  onChangeStatus: (status: string) => void
}

type DestructiveAction = "archive" | "delete"

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
  archive: {
    title: "Archive Properties",
    description: (count) =>
      `Are you sure you want to archive ${count} ${count === 1 ? "property" : "properties"}? Archived properties can be restored later.`,
    confirmLabel: "Archive",
    variant: "default",
  },
  delete: {
    title: "Delete Properties",
    description: (count) =>
      `Are you sure you want to permanently delete ${count} ${count === 1 ? "property" : "properties"}? This action cannot be undone.`,
    confirmLabel: "Delete",
    variant: "destructive",
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BulkActionsToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onArchive,
  onDelete,
  onExport,
  onChangeStatus,
}: BulkActionsToolbarProps) {
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
    if (confirmDialog.action === "archive") {
      onArchive()
    } else if (confirmDialog.action === "delete") {
      onDelete()
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
                    <SelectTrigger variant="glass" className="w-40">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent variant="glass">
                      <SelectItem value="active">Set Active</SelectItem>
                      <SelectItem value="inactive">Set Inactive</SelectItem>
                      <SelectItem value="maintenance">Set Maintenance</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Archive */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openConfirm("archive")}
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    Archive
                  </Button>

                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openConfirm("delete")}
                    className="text-error-500 hover:bg-error-500/10"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
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
