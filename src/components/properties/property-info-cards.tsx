"use client"

import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass"
import { Badge } from "@/components/ui/badge"
import {
  Bed,
  Bath,
  Users,
  BedDouble,
  Wifi,
  UtensilsCrossed,
  Car,
  Waves,
  Tv,
  Wind,
  WashingMachine,
  DollarSign,
  Clock,
  Home,
  Ruler,
  type LucideIcon,
} from "lucide-react"
import type { Property } from "@/types/api"

// ============================================================================
// Types
// ============================================================================

interface PropertyInfoCardsProps {
  property: Property
}

interface AmenityItem {
  name: string
  available: boolean
  icon: LucideIcon
}

// ============================================================================
// InfoRow - Reusable key/value row with icon
// ============================================================================

function InfoRow({
  icon: Icon,
  label,
  value,
  valueClassName = "",
}: {
  icon: LucideIcon
  label: string
  value: string | number | undefined | null
  valueClassName?: string
}) {
  if (value === undefined || value === null) return null

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <span className={cn("text-sm font-medium", valueClassName)}>
        {value}
      </span>
    </div>
  )
}

// ============================================================================
// Card Section Header
// ============================================================================

function CardHeader({
  icon: Icon,
  title,
}: {
  icon: LucideIcon
  title: string
}) {
  return (
    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
      <Icon className="h-5 w-5 text-property-primary" />
      {title}
    </h3>
  )
}

// ============================================================================
// Capacity Card
// ============================================================================

function CapacityCard({ property }: { property: Property }) {
  return (
    <GlassCard className="p-6">
      <CardHeader icon={Users} title="Capacity" />
      <div className="space-y-3">
        <InfoRow icon={Bed} label="Bedrooms" value={property.bedrooms} />
        <InfoRow icon={Bath} label="Bathrooms" value={property.bathrooms} />
        {property.max_guests > 0 && (
          <InfoRow icon={Users} label="Max Guests" value={property.max_guests} />
        )}
        <InfoRow icon={BedDouble} label="Total Beds" value={property.bedrooms} />
      </div>
    </GlassCard>
  )
}

// ============================================================================
// Amenities Card
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AmenitiesCard({ property: _property }: { property: Property }) {
  // Mock amenities data - will be replaced with property.amenities when
  // the API provides this field. For now derive reasonable defaults from
  // the property segment / type.
  const amenities: AmenityItem[] = [
    { name: "WiFi", available: true, icon: Wifi },
    { name: "Kitchen", available: true, icon: UtensilsCrossed },
    { name: "Parking", available: true, icon: Car },
    { name: "Pool", available: false, icon: Waves },
    { name: "TV", available: true, icon: Tv },
    { name: "AC", available: true, icon: Wind },
    { name: "Washer", available: true, icon: WashingMachine },
  ].filter((a) => a.available)

  return (
    <GlassCard className="p-6">
      <CardHeader icon={Home} title="Amenities" />
      <div className="grid grid-cols-2 gap-3">
        {amenities.map((amenity) => (
          <div key={amenity.name} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-property-primary/10 flex items-center justify-center shrink-0">
              <amenity.icon className="h-4 w-4 text-property-primary" />
            </div>
            <span className="text-sm">{amenity.name}</span>
          </div>
        ))}
        {amenities.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-2">
            No amenities listed
          </p>
        )}
      </div>
    </GlassCard>
  )
}

// ============================================================================
// Pricing Card
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PricingCard({ _property }: { _property: Property }) {
  // Pricing data will come from a future API endpoint or property extension.
  // Using placeholder values that match the dashboard design language.
  return (
    <GlassCard className="p-6">
      <CardHeader icon={DollarSign} title="Pricing" />
      <div className="space-y-3">
        <InfoRow
          icon={DollarSign}
          label="Nightly Rate"
          value="$150"
          valueClassName="text-property-primary font-semibold"
        />
        <InfoRow icon={DollarSign} label="Cleaning Fee" value="$75" />
        <InfoRow icon={DollarSign} label="Weekend Rate" value="$200" />
        <div className="pt-2 border-t border-border/50">
          <Badge variant="glass" size="sm">
            10% monthly discount
          </Badge>
        </div>
      </div>
    </GlassCard>
  )
}

// ============================================================================
// Property Details Card
// ============================================================================

function DetailsCard({ property }: { property: Property }) {
  return (
    <GlassCard className="p-6">
      <CardHeader icon={Home} title="Details" />
      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Property Type</p>
          <Badge variant="glass" className="mt-1 capitalize">
            {property.segment?.replace(/_/g, " ") || "N/A"}
          </Badge>
        </div>
        <InfoRow icon={Ruler} label="Square Feet" value="1,200 sq ft" />
        <InfoRow
          icon={Clock}
          label="Check-in"
          value={property.check_in_time || "3:00 PM"}
        />
        <InfoRow
          icon={Clock}
          label="Check-out"
          value={property.check_out_time || "11:00 AM"}
        />
      </div>
    </GlassCard>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function PropertyInfoCards({ property }: PropertyInfoCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <CapacityCard property={property} />
      <AmenitiesCard property={property} />
      <PricingCard _property={property} />
      <DetailsCard property={property} />
    </div>
  )
}
