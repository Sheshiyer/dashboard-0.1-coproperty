"use client"

import { Button } from "@/components/ui/button"
import { syncData } from "@/lib/actions/sync"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast" // We need to create this hook logic or use a simpler alert

export function SyncButton() {
    const [isSyncing, setIsSyncing] = useState(false)

    const { toast } = useToast()

    async function handleSync() {
        setIsSyncing(true)
        const result = await syncData()
        setIsSyncing(false)

        if (result.success) {
            toast({ title: "Sync Complete", description: result.message })
        } else {
            toast({ title: "Sync Failed", description: result.message, variant: "destructive" })
        }
    }

    return (
        <Button onClick={handleSync} disabled={isSyncing} variant="outline" size="sm" aria-label={isSyncing ? "Syncing data" : "Sync data now"}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} aria-hidden="true" />
            <span aria-live="polite">{isSyncing ? "Syncing..." : "Sync Now"}</span>
        </Button>
    )
}
