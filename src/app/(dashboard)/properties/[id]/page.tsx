import { notFound } from "next/navigation"
import { getProperty } from "@/lib/data/properties"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, ChevronRight } from "lucide-react"
import Link from "next/link"
import { PropertyDetailTabs } from "./property-detail-tabs"
import { PropertyHero } from "@/components/properties/property-hero"

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params
  const property = await getProperty(id)

  if (!property) {
    notFound()
  }

  const propertyName = property.name || property.building_name || "Untitled Property"
  const statusColor =
    property.status === "active" ? "success" : "secondary"

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Back Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/properties">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Properties</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Link
              href="/properties"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Properties</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground truncate max-w-[200px]">
              {propertyName}
            </span>
          </nav>
        </div>
      </div>

      {/* Page Header with Property Name and Status */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {propertyName}
          </h1>
          {property.address && (
            <p className="text-muted-foreground text-sm">
              {property.address}
              {property.room_number ? ` - ${property.room_number}` : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusColor} size="lg" className="capitalize">
            {property.status}
          </Badge>
          {property.segment && (
            <Badge variant="glass" size="lg" className="capitalize">
              {property.segment.replace(/_/g, " ")}
            </Badge>
          )}
        </div>
      </div>

      {/* Hero Section with Image Gallery */}
      <PropertyHero property={property} />

      {/* Tabbed Navigation */}
      <PropertyDetailTabs property={property} />
    </div>
  )
}
