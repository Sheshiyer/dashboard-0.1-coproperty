"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  MoreVertical,
  Eye,
  Pencil,
  Copy,
  Archive,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PropertyActionsMenuProps {
  /** The property ID for routing and action callbacks */
  propertyId: string
  /** Optional callback when an action is selected */
  onAction?: (action: PropertyAction, propertyId: string) => void
  /** Additional CSS classes for the trigger button */
  className?: string
}

export type PropertyAction =
  | "view"
  | "edit"
  | "duplicate"
  | "archive"
  | "delete"

// ---------------------------------------------------------------------------
// Menu Item Definition
// ---------------------------------------------------------------------------

interface ActionItem {
  action: PropertyAction
  label: string
  icon: React.ElementType
  variant?: "default" | "destructive"
  requiresConfirm?: boolean
}

const ACTIONS: ActionItem[] = [
  { action: "view", label: "View Details", icon: Eye },
  { action: "edit", label: "Edit Property", icon: Pencil },
  { action: "duplicate", label: "Duplicate", icon: Copy },
]

const DANGER_ACTIONS: ActionItem[] = [
  { action: "archive", label: "Archive", icon: Archive },
  {
    action: "delete",
    label: "Delete",
    icon: Trash2,
    variant: "destructive",
    requiresConfirm: true,
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PropertyActionsMenu({
  propertyId,
  onAction,
  className,
}: PropertyActionsMenuProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  const handleAction = React.useCallback(
    (item: ActionItem) => {
      // Delete requires confirmation
      if (item.requiresConfirm) {
        const confirmed = window.confirm(
          `Are you sure you want to ${item.action} this property? This action cannot be undone.`
        )
        if (!confirmed) return
      }

      // Handle built-in navigation actions
      if (item.action === "view") {
        router.push(`/properties/${propertyId}`)
        return
      }

      if (item.action === "edit") {
        router.push(`/properties/${propertyId}/edit`)
        return
      }

      // Delegate other actions to parent callback
      onAction?.(item.action, propertyId)
    },
    [propertyId, onAction, router]
  )

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "p-1.5 rounded-lg transition-all duration-200",
            "bg-black/20 hover:bg-black/40 backdrop-blur-sm",
            "text-white/80 hover:text-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
            "cursor-pointer",
            className
          )}
          onClick={(e) => {
            // Prevent the card Link from navigating
            e.preventDefault()
            e.stopPropagation()
          }}
          aria-label="Property actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        variant="glass"
        align="end"
        sideOffset={8}
        className="w-48"
        // Prevent click events on content from propagating to the card Link
        onClick={(e) => e.stopPropagation()}
      >
        {ACTIONS.map((item) => (
          <DropdownMenuItem
            key={item.action}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer text-sm text-foreground hover:bg-primary/10 focus:bg-primary/10 transition-colors"
            onSelect={(e) => {
              e.preventDefault()
              handleAction(item)
            }}
          >
            <item.icon className="h-4 w-4 text-muted-foreground" />
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="my-1.5 bg-border/50" />

        {DANGER_ACTIONS.map((item) => (
          <DropdownMenuItem
            key={item.action}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer text-sm transition-colors",
              item.variant === "destructive"
                ? "text-red-600 dark:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10"
                : "text-foreground hover:bg-primary/10 focus:bg-primary/10"
            )}
            onSelect={(e) => {
              e.preventDefault()
              handleAction(item)
            }}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
