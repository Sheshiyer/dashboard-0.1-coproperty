import { Suspense } from "react"
import { getProperties } from "@/lib/data/properties"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PropertiesContent } from "./properties-content"
import { PropertiesSkeleton } from "@/components/skeleton/properties-skeleton"

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

            <Suspense fallback={<PropertiesSkeleton />}>
                <PropertiesContent properties={properties} />
            </Suspense>
        </div>
    )
}
