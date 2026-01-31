"use client"

import { useState, useEffect, useCallback } from "react"
import { List, LayoutGrid, Grid3x3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ViewMode = "table" | "cards" | "grid"

const STORAGE_KEY = "property-view-preference"

const VIEW_OPTIONS: {
  mode: ViewMode
  icon: typeof List
  label: string
}[] = [
  { mode: "table", icon: List, label: "Table view" },
  { mode: "cards", icon: LayoutGrid, label: "Cards view (2 columns)" },
  { mode: "grid", icon: Grid3x3, label: "Grid view (3-4 columns)" },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Read the saved view preference from localStorage.
 * Returns null when running server-side or if no preference is saved.
 */
function loadPreference(): ViewMode | null {
  if (typeof window === "undefined") return null
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "table" || saved === "cards" || saved === "grid") {
      return saved
    }
  } catch {
    // localStorage may be blocked (e.g. private browsing on some browsers)
  }
  return null
}

/**
 * Persist view preference to localStorage.
 */
function savePreference(mode: ViewMode): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // Silently ignore storage errors
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface PropertyViewToggleProps {
  /** Callback when the active view changes */
  onViewChange: (view: ViewMode) => void
  /** Default view if nothing is saved in localStorage */
  defaultView?: ViewMode
  /** Additional CSS classes for the outer wrapper */
  className?: string
}

export function PropertyViewToggle({
  onViewChange,
  defaultView = "cards",
  className,
}: PropertyViewToggleProps) {
  const [activeView, setActiveView] = useState<ViewMode>(defaultView)

  // Load saved preference on mount
  useEffect(() => {
    const saved = loadPreference()
    if (saved) {
      setActiveView(saved)
      onViewChange(saved)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeView = useCallback(
    (mode: ViewMode) => {
      setActiveView(mode)
      savePreference(mode)
      onViewChange(mode)
    },
    [onViewChange]
  )

  return (
    <div
      role="group"
      aria-label="View mode"
      className={cn(
        "inline-flex items-center gap-1 rounded-lg p-1",
        "backdrop-blur-xl bg-white/80 dark:bg-gray-900/60",
        "border border-white/30 dark:border-white/15",
        "shadow-lg shadow-black/5",
        className
      )}
    >
      {VIEW_OPTIONS.map(({ mode, icon: Icon, label }) => {
        const isActive = activeView === mode

        return (
          <Button
            key={mode}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => changeView(mode)}
            aria-pressed={isActive}
            aria-label={label}
            className={cn(
              "relative h-8 w-8 p-0 transition-all duration-200",
              isActive
                ? "bg-property-primary text-white shadow-md hover:bg-property-primary/90"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{label}</span>
          </Button>
        )
      })}
    </div>
  )
}
