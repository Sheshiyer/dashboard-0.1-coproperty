import { Suspense } from "react"
import { getProperties } from "@/lib/data/properties"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function PropertiesPage() {
    const properties = await getProperties()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Property
                </Button>
            </div>

            <div className="rounded-xl border bg-card shadow">
                <div className="p-6">
                    <Suspense fallback={<div className="h-24 w-full bg-muted/20 animate-pulse rounded" />}>
                        <DataTable columns={columns} data={properties} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
