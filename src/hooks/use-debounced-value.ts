"use client"

import { useState, useEffect } from "react"

/**
 * useDebouncedValue - Returns a debounced version of the input value.
 *
 * The returned value only updates after the specified delay has elapsed
 * since the last change to the input value. Useful for search inputs
 * where you want to avoid firing a filter/request on every keystroke.
 *
 * @param value - The value to debounce
 * @param delay - Debounce delay in milliseconds (default: 300)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [query, setQuery] = useState("")
 * const debouncedQuery = useDebouncedValue(query, 300)
 *
 * useEffect(() => {
 *   // This fires at most once every 300ms
 *   fetchResults(debouncedQuery)
 * }, [debouncedQuery])
 * ```
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
