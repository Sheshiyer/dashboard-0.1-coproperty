"use client"

import * as React from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/query-client"

/**
 * React Query Provider
 *
 * Wraps the application in QueryClientProvider using the centralized
 * queryClient instance. Must be a client component because React Query
 * uses React context internally.
 *
 * The queryClient is instantiated once as a module-level singleton to
 * preserve cache across navigations within the same session.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
