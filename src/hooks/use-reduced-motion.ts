"use client"

import { useState, useEffect } from "react"

/**
 * useReducedMotion - Hook to detect the user's prefers-reduced-motion setting.
 *
 * Returns `true` when the user has enabled "Reduce Motion" in their OS settings
 * (macOS: System Settings > Accessibility > Display > Reduce Motion).
 *
 * Use this to conditionally disable Framer Motion animations or replace
 * them with instant transitions.
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion()
 *
 * return (
 *   <motion.div
 *     initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
 *     animate={{ opacity: 1, y: 0 }}
 *     transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}
 *   >
 *     Content
 *   </motion.div>
 * )
 * ```
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    function handleChange(event: MediaQueryListEvent) {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return prefersReducedMotion
}

/**
 * getMotionProps - Utility to conditionally return Framer Motion props.
 *
 * When reduced motion is preferred, returns empty objects so animations
 * are effectively disabled without breaking component structure.
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion()
 * const { initial, animate, transition } = getMotionProps(prefersReducedMotion, {
 *   initial: { opacity: 0, y: 12 },
 *   animate: { opacity: 1, y: 0 },
 *   transition: { duration: 0.4 },
 * })
 * ```
 */
export function getMotionProps(
  prefersReducedMotion: boolean,
  props: {
    initial?: Record<string, unknown> | false
    animate?: Record<string, unknown>
    exit?: Record<string, unknown>
    transition?: Record<string, unknown>
    whileHover?: Record<string, unknown>
    whileTap?: Record<string, unknown>
  }
) {
  if (prefersReducedMotion) {
    return {
      initial: false,
      animate: props.animate,
      exit: undefined,
      transition: { duration: 0 },
      whileHover: undefined,
      whileTap: undefined,
    }
  }

  return props
}
