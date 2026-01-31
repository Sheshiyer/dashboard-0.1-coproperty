"use client"

import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Search, X, Home, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import type { PropertyCardData } from "@/types/property"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PropertySearchProps {
  /** Array of properties to search through */
  properties: PropertyCardData[]
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
 * Returns a React element with matched segments wrapped in highlight marks.
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
 * Extract a short location string from a full address.
 * Takes the first two comma-separated parts (street + city).
 */
function shortLocation(address: string): string {
  if (!address) return "No address"
  const parts = address.split(",")
  return parts.slice(0, 2).join(",").trim() || address
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * PropertyImage with error fallback - renders a placeholder icon
 * when the image URL is missing or fails to load.
 */
function SearchPropertyImage({
  src,
  alt,
}: {
  src: string | undefined
  alt: string
}) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/30 dark:bg-white/5 rounded-lg">
        <Home className="h-5 w-5 text-muted-foreground/40" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="48px"
      className="object-cover rounded-lg"
      onError={() => setHasError(true)}
    />
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function PropertySearch({
  properties,
  onSearchChange,
  maxSuggestions = 8,
  className,
  placeholder = "Search properties by name or location...",
}: PropertySearchProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debouncedQuery = useDebouncedValue(query, 300)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // ---- Filtering Logic ----

  const filteredProperties = React.useMemo(() => {
    if (debouncedQuery.length < 2) return []

    const lowerQuery = debouncedQuery.toLowerCase()
    return properties
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.address.toLowerCase().includes(lowerQuery) ||
          (p.internal_code && p.internal_code.toLowerCase().includes(lowerQuery))
      )
      .slice(0, maxSuggestions)
  }, [debouncedQuery, properties, maxSuggestions])

  // ---- Notify parent of search changes ----

  useEffect(() => {
    onSearchChange?.(debouncedQuery)
  }, [debouncedQuery, onSearchChange])

  // ---- Reset selected index when filtered results change ----

  useEffect(() => {
    setSelectedIndex(-1)
  }, [filteredProperties])

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

      if (!isOpen || filteredProperties.length === 0) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) =>
            Math.min(prev + 1, filteredProperties.length - 1)
          )
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, -1))
          break
        case "Enter":
          e.preventDefault()
          if (selectedIndex >= 0 && filteredProperties[selectedIndex]) {
            const property = filteredProperties[selectedIndex]
            // Use Next.js router-compatible navigation
            window.location.href = `/properties/${property.id}`
          }
          break
      }
    },
    [isOpen, filteredProperties, selectedIndex]
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
  const hasResults = filteredProperties.length > 0

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
          aria-controls="property-search-listbox"
          aria-activedescendant={
            selectedIndex >= 0
              ? `property-search-option-${selectedIndex}`
              : undefined
          }
          aria-autocomplete="list"
          aria-label="Search properties"
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
          id="property-search-listbox"
          role="listbox"
          aria-label="Property suggestions"
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
                {filteredProperties.length} result
                {filteredProperties.length !== 1 ? "s" : ""} found
              </div>

              {/* Property suggestions */}
              {filteredProperties.map((property, index) => (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  id={`property-search-option-${index}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  data-search-item
                  onClick={handleSuggestionClick}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-md",
                    "transition-colors duration-150",
                    "hover:bg-white/60 dark:hover:bg-white/10",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-property-primary/50",
                    index === selectedIndex &&
                      "bg-property-primary/10 dark:bg-property-primary/20"
                  )}
                >
                  {/* Property thumbnail */}
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0">
                    <SearchPropertyImage
                      src={property.imageUrl}
                      alt={property.name}
                    />
                  </div>

                  {/* Property info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {highlightMatch(
                        property.name || property.internal_code || "Unnamed",
                        debouncedQuery
                      )}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {highlightMatch(
                          shortLocation(property.address),
                          debouncedQuery
                        )}
                      </span>
                    </p>
                  </div>

                  {/* Bedrooms indicator */}
                  <span className="text-xs text-muted-foreground shrink-0">
                    {property.bedrooms}BR
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="p-8 text-center">
              <Search className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                No properties found
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
