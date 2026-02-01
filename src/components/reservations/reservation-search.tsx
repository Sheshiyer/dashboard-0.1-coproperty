"use client"

import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Search, X, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getSearchSuggestions, getGuestInitials } from "@/lib/utils/reservation-search"
import { RESERVATION_STATUS_CONFIG } from "@/types/reservation"
import type { Reservation } from "@/types/api"
import { format, parseISO, differenceInDays } from "date-fns"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReservationSearchProps {
  /** Array of reservations to search through */
  reservations: Reservation[]
  /** Callback fired when the debounced search query changes */
  onSearchChange?: (query: string) => void
  /** Maximum number of suggestions to display */
  maxSuggestions?: number
  /** Additional CSS classes for the root container */
  className?: string
  /** Placeholder text for the search input */
  placeholder?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Escape special regex characters in user input to prevent regex injection.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Highlight matching portions of text with a styled <mark> element.
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || query.length < 2) return text

  const escaped = escapeRegex(query)
  const regex = new RegExp(`(${escaped})`, "gi")
  const parts = text.split(regex)

  if (parts.length === 1) return text

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-property-primary/20 text-property-primary dark:bg-property-primary/30 dark:text-property-primary rounded-sm px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}

/**
 * Format date range for display
 */
function formatDateRange(checkIn: string, checkOut: string): string {
  try {
    const checkInDate = parseISO(checkIn)
    const checkOutDate = parseISO(checkOut)
    const nights = differenceInDays(checkOutDate, checkInDate)
    return `${format(checkInDate, 'MMM d')} - ${format(checkOutDate, 'MMM d')} • ${nights}N`
  } catch {
    return `${checkIn} - ${checkOut}`
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Guest avatar with initials
 */
function GuestAvatar({ guestName }: { guestName: string }) {
  const initials = getGuestInitials(guestName)

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-property-primary/10 text-property-primary font-semibold text-sm flex-shrink-0">
      {initials}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ReservationSearch({
  reservations,
  onSearchChange,
  maxSuggestions = 8,
  className,
  placeholder = "Search by guest name, confirmation code, or email...",
}: ReservationSearchProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debouncedQuery = useDebouncedValue(query, 300)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // ---- Filtering Logic ----

  const filteredReservations = React.useMemo(() => {
    if (debouncedQuery.length < 2) return []
    return getSearchSuggestions(reservations, debouncedQuery, maxSuggestions)
  }, [debouncedQuery, reservations, maxSuggestions])

  // ---- Notify parent of search changes ----

  useEffect(() => {
    onSearchChange?.(debouncedQuery)
  }, [debouncedQuery, onSearchChange])

  // ---- Reset selected index when filtered results change ----

  useEffect(() => {
    setSelectedIndex(-1)
  }, [filteredReservations])

  // ---- Scroll selected item into view ----

  useEffect(() => {
    if (selectedIndex < 0 || !dropdownRef.current) return
    const items = dropdownRef.current.querySelectorAll("[data-search-item]")
    const selectedItem = items[selectedIndex] as HTMLElement | undefined
    selectedItem?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex])

  // ---- Close dropdown on outside click ----

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ---- Keyboard navigation ----

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
        inputRef.current?.blur()
        return
      }

      if (!isOpen || filteredReservations.length === 0) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) =>
            Math.min(prev + 1, filteredReservations.length - 1)
          )
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, -1))
          break
        case "Enter":
          e.preventDefault()
          if (selectedIndex >= 0 && filteredReservations[selectedIndex]) {
            // Selection confirmed - could navigate or trigger callback
            setIsOpen(false)
            inputRef.current?.blur()
          }
          break
      }
    },
    [isOpen, filteredReservations, selectedIndex]
  )

  // ---- Clear search ----

  const clearSearch = useCallback(() => {
    setQuery("")
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }, [])

  // ---- Input change handler ----

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setQuery(value)
      setIsOpen(value.length >= 2)
      if (value.length < 2) {
        setSelectedIndex(-1)
      }
    },
    []
  )

  // ---- Focus handler ----

  const handleFocus = useCallback(() => {
    if (query.length >= 2) {
      setIsOpen(true)
    }
  }, [query])

  // ---- Suggestion selection ----

  const handleSuggestionClick = useCallback(() => {
    setIsOpen(false)
  }, [])

  // ---- Determine dropdown state ----

  const showDropdown = isOpen && debouncedQuery.length >= 2
  const hasResults = filteredReservations.length > 0

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-md", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="reservation-search-listbox"
          aria-activedescendant={
            selectedIndex >= 0
              ? `reservation-search-option-${selectedIndex}`
              : undefined
          }
          aria-autocomplete="list"
          aria-label="Search reservations"
          className={cn(
            // Layout
            "w-full pl-10 pr-10 py-2.5 text-sm",
            // Glass morphism
            "rounded-lg backdrop-blur-xl",
            "bg-white/80 dark:bg-white/10",
            "border border-white/20 dark:border-white/15",
            "shadow-lg shadow-primary/5",
            // Focus state
            "focus:outline-none focus:ring-2 focus:ring-property-primary/50",
            "focus:border-property-primary/30",
            // Text
            "text-foreground placeholder:text-muted-foreground",
            // Transition
            "transition-all duration-200"
          )}
        />
        {query && (
          <button
            onClick={clearSearch}
            type="button"
            aria-label="Clear search"
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              "p-1 rounded-full",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-white/20 dark:hover:bg-white/10",
              "transition-colors duration-150"
            )}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          id="reservation-search-listbox"
          role="listbox"
          aria-label="Reservation suggestions"
          className={cn(
            "absolute top-full mt-2 w-full z-50",
            // Glass morphism
            "rounded-lg backdrop-blur-xl",
            "bg-white/90 dark:bg-gray-900/80",
            "border border-white/20 dark:border-white/15",
            "shadow-2xl shadow-primary/10",
            // Scrolling
            "max-h-96 overflow-y-auto",
            // Animation
            "animate-in fade-in-0 zoom-in-95 duration-200"
          )}
        >
          {hasResults ? (
            <div className="p-1.5" role="presentation">
              {/* Results count */}
              <div className="px-3 py-2 text-xs text-muted-foreground font-medium">
                {filteredReservations.length} result
                {filteredReservations.length !== 1 ? "s" : ""} found
              </div>

              {/* Reservation suggestions */}
              {filteredReservations.map((reservation, index) => {
                const statusConfig = RESERVATION_STATUS_CONFIG[reservation.status] || {
                  label: reservation.status,
                  variant: 'default' as const,
                }

                return (
                  <button
                    key={reservation.id}
                    id={`reservation-search-option-${index}`}
                    role="option"
                    aria-selected={index === selectedIndex}
                    data-search-item
                    onClick={handleSuggestionClick}
                    type="button"
                    className={cn(
                      "w-full flex items-start gap-3 p-2.5 rounded-md text-left",
                      "transition-colors duration-150",
                      "hover:bg-white/60 dark:hover:bg-white/10",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-property-primary/50",
                      index === selectedIndex &&
                        "bg-property-primary/10 dark:bg-property-primary/20"
                    )}
                  >
                    {/* Guest avatar */}
                    <GuestAvatar guestName={reservation.guest_name} />

                    {/* Reservation info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {highlightMatch(reservation.guest_name, debouncedQuery)}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="font-mono">
                          {highlightMatch(
                            reservation.confirmation_code,
                            debouncedQuery
                          )}
                        </span>
                        <span>•</span>
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {formatDateRange(
                            reservation.check_in_date,
                            reservation.check_out_date
                          )}
                        </span>
                      </p>
                      {reservation.properties && (
                        <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                          {reservation.properties.name}
                        </p>
                      )}
                    </div>

                    {/* Status badge */}
                    <Badge variant={statusConfig.variant} size="sm" className="shrink-0">
                      {statusConfig.label}
                    </Badge>
                  </button>
                )
              })}
            </div>
          ) : (
            /* Empty state */
            <div className="p-8 text-center">
              <Search className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                No reservations found
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Try a different search term
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
