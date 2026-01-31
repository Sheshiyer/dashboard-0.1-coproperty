import { Suspense } from "react"
import { getProperties } from "@/lib/data/properties"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PropertiesContent } from "./properties-content"

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

            <Suspense fallback={<div className="h-24 w-full bg-muted/20 animate-pulse rounded" />}>
                <PropertiesContent properties={properties} />
            </Suspense>
        </div>
    )
}
