"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Save,
  Check,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Info,
  AlertCircle,
  Clock,
  StickyNote,
  Bell,
} from "lucide-react"
import { format, subDays, subHours } from "date-fns"
import type { PropertyWithDetails } from "@/types/api"

// ============================================================================
// Types
// ============================================================================

type AlertType = "info" | "warning" | "critical"

interface PropertyAlert {
  id: string
  type: AlertType
  message: string
  active: boolean
  createdAt: Date
}

interface PropertyNotesProps {
  property: PropertyWithDetails
}

// ============================================================================
// Deterministic Seed Helper
// ============================================================================

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

// ============================================================================
// Mock Data Generator
// ============================================================================

function generateMockNotes(property: PropertyWithDetails): string {
  const name = property.name || "Property"
  const code = property.internal_code || "N/A"
  return `# ${name} - Internal Notes

## Check-in Procedures
- Key lockbox code: **4827** (updated monthly)
- Parking spot: **B-${code}** in underground garage
- WiFi password: posted on fridge magnet

## Maintenance Notes
- *HVAC filter* replaced on last inspection
- Water heater set to 120F
- Smoke detectors tested and certified

## Guest Communication
1. Send welcome message 24 hours before check-in
2. Confirm parking details with guest
3. Share local restaurant recommendations
4. Follow up after first night

## Inventory Checklist
- Towels: 6 bath, 4 hand, 4 washcloth
- Linens: 2 sets per bedroom
- Kitchen essentials fully stocked
- Toiletries restocked after each turnover`
}

function generateMockAlerts(propertyId: string): PropertyAlert[] {
  const seed = hashCode(propertyId)
  const now = new Date()

  const alertPool: Array<{ type: AlertType; message: string }> = [
    { type: "info", message: "Annual fire inspection due next month" },
    { type: "warning", message: "Guest reported slow WiFi - router may need replacement" },
    { type: "critical", message: "Water heater showing error code E3 - schedule repair" },
    { type: "info", message: "Property tax assessment updated for current fiscal year" },
    { type: "warning", message: "Neighbor construction noise expected weekdays 8am-5pm through March" },
    { type: "info", message: "New parking regulations in effect - update guest instructions" },
    { type: "critical", message: "Smoke detector in bedroom 2 battery low - replace immediately" },
    { type: "warning", message: "HVAC maintenance scheduled for next week" },
  ]

  const count = 3 + (seed % 3) // 3-5 alerts
  const alerts: PropertyAlert[] = []

  for (let i = 0; i < count; i++) {
    const idx = (seed + i * 7) % alertPool.length
    const pool = alertPool[idx]
    const daysAgo = ((seed + i * 13) % 30) + 1
    const hoursAgo = ((seed + i * 5) % 24)

    alerts.push({
      id: `alert-${propertyId}-${i}`,
      type: pool.type,
      message: pool.message,
      active: i < count - 1, // last alert is inactive
      createdAt: subHours(subDays(now, daysAgo), hoursAgo),
    })
  }

  return alerts
}

// ============================================================================
// Simple Markdown Renderer
// ============================================================================

function renderMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^### (.+)$/gm, '<h4 class="text-base font-semibold mt-4 mb-2">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="text-lg font-semibold mt-5 mb-2">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm leading-relaxed">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-sm leading-relaxed">$1</li>')
    // Paragraphs (blank lines)
    .replace(/\n\n/g, '<div class="h-3"></div>')
    // Line breaks
    .replace(/\n/g, "\n")
}

// ============================================================================
// Save Status Indicator
// ============================================================================

type SaveStatus = "idle" | "saving" | "saved"

function SaveIndicator({ status }: { status: SaveStatus }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {status === "idle" && (
        <span className="text-muted-foreground">Unsaved changes</span>
      )}
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-property-primary" />
          <span className="text-property-primary">Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
          <span className="text-green-600 dark:text-green-400">Saved</span>
        </>
      )}
    </div>
  )
}

// ============================================================================
// Alert Type Config
// ============================================================================

const alertTypeConfig: Record<
  AlertType,
  {
    label: string
    borderColor: string
    bgColor: string
    textColor: string
    icon: typeof Info
    badgeClass: string
  }
> = {
  info: {
    label: "Info",
    borderColor: "border-l-blue-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600 dark:text-blue-400",
    icon: Info,
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  warning: {
    label: "Warning",
    borderColor: "border-l-yellow-500",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-600 dark:text-yellow-400",
    icon: AlertTriangle,
    badgeClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  },
  critical: {
    label: "Critical",
    borderColor: "border-l-red-500",
    bgColor: "bg-red-500/10",
    textColor: "text-red-600 dark:text-red-400",
    icon: AlertCircle,
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800",
  },
}

// ============================================================================
// Toggle Switch Component
// ============================================================================

function ToggleSwitch({
  checked,
  onToggle,
  label,
}: {
  checked: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked
          ? "bg-property-primary"
          : "bg-gray-300 dark:bg-gray-600"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  )
}

// ============================================================================
// Notes Editor Toolbar
// ============================================================================

function NotesToolbar({
  onInsert,
}: {
  onInsert: (syntax: string, wrap?: boolean) => void
}) {
  return (
    <div className="flex items-center gap-1 p-2 border-b border-white/20 dark:border-white/10">
      <button
        type="button"
        onClick={() => onInsert("**", true)}
        className="p-1.5 rounded-md hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onInsert("*", true)}
        className="p-1.5 rounded-md hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </button>
      <div className="w-px h-5 bg-border/50 mx-1" />
      <button
        type="button"
        onClick={() => onInsert("- ")}
        className="p-1.5 rounded-md hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onInsert("1. ")}
        className="p-1.5 rounded-md hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </button>
    </div>
  )
}

// ============================================================================
// Alert Card
// ============================================================================

function AlertCard({
  alert,
  onToggle,
  onEdit,
  onDelete,
}: {
  alert: PropertyAlert
  onToggle: (id: string) => void
  onEdit: (alert: PropertyAlert) => void
  onDelete: (id: string) => void
}) {
  const config = alertTypeConfig[alert.type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "relative rounded-lg border-l-4 p-4 transition-all duration-200",
        config.borderColor,
        "backdrop-blur-lg bg-white/60 dark:bg-white/5",
        "border border-white/20 dark:border-white/10",
        !alert.active && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={cn(
              "shrink-0 h-8 w-8 rounded-lg flex items-center justify-center",
              config.bgColor
            )}
          >
            <Icon className={cn("h-4 w-4", config.textColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                  config.badgeClass
                )}
              >
                {config.label}
              </span>
              {!alert.active && (
                <Badge variant="glass" size="sm" className="opacity-70">
                  Inactive
                </Badge>
              )}
            </div>
            <p className="text-sm leading-relaxed">{alert.message}</p>
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(alert.createdAt, "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ToggleSwitch
            checked={alert.active}
            onToggle={() => onToggle(alert.id)}
            label={`Toggle alert ${alert.active ? "off" : "on"}`}
          />
          <button
            type="button"
            onClick={() => onEdit(alert)}
            className="p-1.5 rounded-md hover:bg-white/50 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
            title="Edit alert"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(alert.id)}
            className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
            title="Delete alert"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Alert Form Dialog
// ============================================================================

function AlertFormDialog({
  open,
  onOpenChange,
  editingAlert,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingAlert: PropertyAlert | null
  onSave: (data: { type: AlertType; message: string; active: boolean }) => void
}) {
  const [type, setType] = useState<AlertType>(editingAlert?.type ?? "info")
  const [message, setMessage] = useState(editingAlert?.message ?? "")
  const [active, setActive] = useState(editingAlert?.active ?? true)

  useEffect(() => {
    if (open) {
      setType(editingAlert?.type ?? "info")
      setMessage(editingAlert?.message ?? "")
      setActive(editingAlert?.active ?? true)
    }
  }, [open, editingAlert])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    onSave({ type, message: message.trim(), active })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-white/20 dark:border-white/10">
        <DialogHeader>
          <DialogTitle>
            {editingAlert ? "Edit Alert" : "Create New Alert"}
          </DialogTitle>
          <DialogDescription>
            {editingAlert
              ? "Update the alert details below."
              : "Add a new alert for this property. Alerts help track important notices and action items."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="alert-type">Alert Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as AlertType)}>
              <SelectTrigger variant="glass" id="alert-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent variant="glass">
                <SelectItem value="info">
                  <span className="flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-blue-500" />
                    Info
                  </span>
                </SelectItem>
                <SelectItem value="warning">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                    Warning
                  </span>
                </SelectItem>
                <SelectItem value="critical">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    Critical
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alert-message">Message</Label>
            <Textarea
              id="alert-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the alert or notice..."
              className="min-h-[100px] backdrop-blur-xl bg-white/80 dark:bg-white/10 border-white/30 dark:border-white/20"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="alert-active" className="cursor-pointer">
              Active
            </Label>
            <ToggleSwitch
              checked={active}
              onToggle={() => setActive(!active)}
              label="Toggle alert active state"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!message.trim()}>
              {editingAlert ? "Update Alert" : "Create Alert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Main Component: PropertyNotes
// ============================================================================

export function PropertyNotes({ property }: PropertyNotesProps) {
  // -- State --
  const [notes, setNotes] = useState(() => generateMockNotes(property))
  const [alerts, setAlerts] = useState<PropertyAlert[]>(() =>
    generateMockAlerts(property.id)
  )
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved")
  const [lastUpdated, setLastUpdated] = useState<Date>(
    () => subHours(new Date(), 2)
  )
  const [showPreview, setShowPreview] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAlert, setEditingAlert] = useState<PropertyAlert | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // -- Auto-save simulation --
  const triggerAutoSave = useCallback(() => {
    setSaveStatus("saving")
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    saveTimerRef.current = setTimeout(() => {
      setSaveStatus("saved")
      setLastUpdated(new Date())
    }, 1200)
  }, [])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  // -- Notes handlers --
  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNotes(e.target.value)
      setSaveStatus("idle")
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
      saveTimerRef.current = setTimeout(() => {
        triggerAutoSave()
      }, 1500)
    },
    [triggerAutoSave]
  )

  const handleToolbarInsert = useCallback(
    (syntax: string, wrap?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = notes.substring(start, end)

      let newText: string
      let cursorOffset: number

      if (wrap && selectedText) {
        newText =
          notes.substring(0, start) +
          syntax +
          selectedText +
          syntax +
          notes.substring(end)
        cursorOffset = end + syntax.length * 2
      } else if (wrap) {
        newText =
          notes.substring(0, start) +
          syntax +
          "text" +
          syntax +
          notes.substring(end)
        cursorOffset = start + syntax.length + 4
      } else {
        // Line prefix (list items)
        const lineStart = notes.lastIndexOf("\n", start - 1) + 1
        newText =
          notes.substring(0, lineStart) +
          syntax +
          notes.substring(lineStart)
        cursorOffset = start + syntax.length
      }

      setNotes(newText)
      setSaveStatus("idle")

      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(cursorOffset, cursorOffset)
      })

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
      saveTimerRef.current = setTimeout(() => {
        triggerAutoSave()
      }, 1500)
    },
    [notes, triggerAutoSave]
  )

  const handleManualSave = useCallback(() => {
    triggerAutoSave()
  }, [triggerAutoSave])

  // -- Alert handlers --
  const handleToggleAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    )
  }, [])

  const handleEditAlert = useCallback((alert: PropertyAlert) => {
    setEditingAlert(alert)
    setDialogOpen(true)
  }, [])

  const handleDeleteAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const handleCreateAlert = useCallback(() => {
    setEditingAlert(null)
    setDialogOpen(true)
  }, [])

  const handleSaveAlert = useCallback(
    (data: { type: AlertType; message: string; active: boolean }) => {
      if (editingAlert) {
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === editingAlert.id
              ? { ...a, type: data.type, message: data.message, active: data.active }
              : a
          )
        )
      } else {
        const newAlert: PropertyAlert = {
          id: `alert-${property.id}-${Date.now()}`,
          type: data.type,
          message: data.message,
          active: data.active,
          createdAt: new Date(),
        }
        setAlerts((prev) => [newAlert, ...prev])
      }
      setDialogOpen(false)
      setEditingAlert(null)
    },
    [editingAlert, property.id]
  )

  // -- Computed --
  const activeAlertCount = alerts.filter((a) => a.active).length

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* Notes Editor Section (60%) */}
      {/* ================================================================ */}
      <GlassCard className="overflow-hidden">
        {/* Notes Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-property-primary/10 flex items-center justify-center">
              <StickyNote className="h-5 w-5 text-property-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Property Notes</h3>
              <p className="text-xs text-muted-foreground">
                Last updated {format(lastUpdated, "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SaveIndicator status={saveStatus} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs"
            >
              {showPreview ? "Edit" : "Preview"}
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={handleManualSave}
              className="text-xs"
            >
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        {!showPreview && <NotesToolbar onInsert={handleToolbarInsert} />}

        {/* Editor / Preview */}
        <div className="p-4">
          {showPreview ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none min-h-[320px] p-4 rounded-lg bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(notes) }}
            />
          ) : (
            <Textarea
              ref={textareaRef}
              value={notes}
              onChange={handleNotesChange}
              className="min-h-[320px] font-mono text-sm resize-y backdrop-blur-lg bg-white/40 dark:bg-white/5 border-white/20 dark:border-white/10 focus-visible:ring-property-primary"
              placeholder="Write your property notes here using markdown syntax..."
            />
          )}
        </div>

        {/* Footer hints */}
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground">
            Supports markdown: **bold**, *italic*, - bullet lists, 1. numbered lists
          </p>
        </div>
      </GlassCard>

      {/* ================================================================ */}
      {/* Alerts Section (40%) */}
      {/* ================================================================ */}
      <GlassCard className="overflow-hidden">
        {/* Alerts Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-property-primary/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-property-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Property Alerts</h3>
              <p className="text-xs text-muted-foreground">
                {activeAlertCount} active alert{activeAlertCount !== 1 ? "s" : ""} of{" "}
                {alerts.length} total
              </p>
            </div>
          </div>
          <Button size="sm" onClick={handleCreateAlert}>
            <Plus className="h-3.5 w-3.5" />
            Add Alert
          </Button>
        </div>

        {/* Alert List */}
        <div className="p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No alerts for this property
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Create an alert to track important notices
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onToggle={handleToggleAlert}
                onEdit={handleEditAlert}
                onDelete={handleDeleteAlert}
              />
            ))
          )}
        </div>
      </GlassCard>

      {/* Alert Form Dialog */}
      <AlertFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingAlert={editingAlert}
        onSave={handleSaveAlert}
      />
    </div>
  )
}
