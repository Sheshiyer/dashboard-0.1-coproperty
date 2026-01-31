"use client"

import { useState, useMemo } from "react"
import { GlassCard } from "@/components/ui/glass"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Calendar,
  DollarSign,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Users,
  FileText,
  Hash,
} from "lucide-react"
import { format, differenceInDays, isAfter, isBefore, isToday } from "date-fns"
import { cn } from "@/lib/utils"
import type { Reservation } from "@/types/api"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReservationTimelineProps {
  propertyId: string
  reservations: Reservation[]
}

type StatusVariant = "default" | "success" | "warning" | "secondary" | "glass"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ITEMS_PER_PAGE = 10

const platformColors: Record<string, string> = {
  airbnb: "bg-[#FF5A5F]/10 text-[#FF5A5F] border-[#FF5A5F]/20",
  "booking.com": "bg-[#003580]/10 text-[#003580] dark:text-[#4A90D9] border-[#003580]/20",
  booking: "bg-[#003580]/10 text-[#003580] dark:text-[#4A90D9] border-[#003580]/20",
  direct: "bg-property-primary/10 text-property-primary border-property-primary/20",
  vrbo: "bg-[#3B5998]/10 text-[#3B5998] dark:text-[#7B9FD4] border-[#3B5998]/20",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusVariant(status: string): StatusVariant {
  const s = status.toLowerCase()
  if (s === "confirmed" || s === "accepted") return "default"
  if (s === "checked-in" || s === "active" || s === "current") return "success"
  if (s === "pending" || s === "inquiry") return "warning"
  if (s === "checked-out" || s === "completed") return "secondary"
  if (s === "cancelled" || s === "declined") return "destructive" as StatusVariant
  return "glass"
}

function getStatusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function parseDateSafe(dateStr: string): Date {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date() : d
}

function getPlatformClass(platform: string): string {
  const key = platform.toLowerCase()
  return platformColors[key] || "bg-muted text-muted-foreground border-border/50"
}

function formatCurrency(amount: number, currency: string = "EUR"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount}`
  }
}

// ---------------------------------------------------------------------------
// Avatar (inline, no external dependency needed)
// ---------------------------------------------------------------------------

function GuestAvatar({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const initials = getInitials(name)
  // Deterministic color from name
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const hue = hash % 360

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold text-white text-xs shrink-0",
        className
      )}
      style={{
        backgroundColor: `hsl(${hue}, 55%, 50%)`,
        width: "40px",
        height: "40px",
      }}
      aria-label={name}
    >
      {initials}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between pt-4 border-t border-border/30">
      <p className="text-xs text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Reservation Item (expandable)
// ---------------------------------------------------------------------------

function ReservationItem({
  reservation,
  expanded,
  onToggle,
}: {
  reservation: Reservation
  expanded: boolean
  onToggle: () => void
}) {
  const checkIn = parseDateSafe(reservation.check_in_date)
  const checkOut = parseDateSafe(reservation.check_out_date)
  const nights = Math.max(1, differenceInDays(checkOut, checkIn))
  const statusVariant = getStatusVariant(reservation.status)
  const platformClass = getPlatformClass(reservation.platform)

  const isCurrentlyActive =
    (isToday(checkIn) || isBefore(checkIn, new Date())) &&
    (isToday(checkOut) || isAfter(checkOut, new Date()))

  return (
    <div
      className={cn(
        "rounded-lg border transition-all duration-200",
        isCurrentlyActive
          ? "border-success-500/30 bg-success-500/5"
          : "border-border/50 hover:bg-muted/30"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-property-primary/50 rounded-lg"
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <GuestAvatar name={reservation.guest_name} />

          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Row 1: Name + Revenue */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">
                  {reservation.guest_name}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <Badge variant={statusVariant} size="sm">
                    {getStatusLabel(reservation.status)}
                  </Badge>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                      platformClass
                    )}
                  >
                    {reservation.platform}
                  </span>
                </div>
              </div>
              <span className="font-semibold text-sm text-property-primary whitespace-nowrap">
                {formatCurrency(reservation.total_price, reservation.currency)}
              </span>
            </div>

            {/* Row 2: Dates + Nights */}
            <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 shrink-0" />
                <span>
                  {format(checkIn, "MMM d")} - {format(checkOut, "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />
                <span>
                  {nights} {nights === 1 ? "night" : "nights"}
                </span>
              </div>
              {reservation.guest_count > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 shrink-0" />
                  <span>
                    {reservation.guest_count}{" "}
                    {reservation.guest_count === 1 ? "guest" : "guests"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Expand chevron */}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 mt-1",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="pt-3 border-t border-border/30 ml-[52px] sm:ml-[56px]">
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              {/* Confirmation */}
              {reservation.confirmation_code && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Confirmation:{" "}
                    <span className="text-foreground font-medium">
                      {reservation.confirmation_code}
                    </span>
                  </span>
                </div>
              )}

              {/* Email */}
              {reservation.guest_email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{reservation.guest_email}</span>
                </div>
              )}

              {/* Phone */}
              {reservation.guest_phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>{reservation.guest_phone}</span>
                </div>
              )}

              {/* Payout */}
              {reservation.payout_amount > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Payout:{" "}
                    <span className="text-foreground font-medium">
                      {formatCurrency(
                        reservation.payout_amount,
                        reservation.currency
                      )}
                    </span>
                  </span>
                </div>
              )}

              {/* Guest count */}
              {reservation.guest_count > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {reservation.guest_count}{" "}
                    {reservation.guest_count === 1 ? "guest" : "guests"}
                  </span>
                </div>
              )}

              {/* Special requests */}
              {reservation.special_requests && (
                <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
                  <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span className="text-foreground">
                    {reservation.special_requests}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section (Upcoming / Past)
// ---------------------------------------------------------------------------

function ReservationSection({
  title,
  reservations,
  expandedId,
  onToggle,
  emptyMessage,
}: {
  title: string
  reservations: Reservation[]
  expandedId: string | null
  onToggle: (id: string) => void
  emptyMessage: string
}) {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(reservations.length / ITEMS_PER_PAGE)
  const paginated = reservations.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  return (
    <GlassCard className="p-6">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        {title}
        <span className="text-sm font-normal text-muted-foreground">
          ({reservations.length})
        </span>
      </h3>

      {reservations.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <>
          <div className="space-y-2">
            {paginated.map((reservation) => (
              <ReservationItem
                key={reservation.id}
                reservation={reservation}
                expanded={expandedId === reservation.id}
                onToggle={() => onToggle(reservation.id)}
              />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </GlassCard>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ReservationTimeline({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  propertyId: _propertyId,
  reservations,
}: ReservationTimelineProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  // Filter by search
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return reservations
    const q = searchQuery.toLowerCase().trim()
    return reservations.filter(
      (r) =>
        r.guest_name.toLowerCase().includes(q) ||
        r.confirmation_code?.toLowerCase().includes(q) ||
        r.platform?.toLowerCase().includes(q)
    )
  }, [reservations, searchQuery])

  // Split into upcoming and past
  const { upcoming, past } = useMemo(() => {
    const now = new Date()
    const up: Reservation[] = []
    const pa: Reservation[] = []

    for (const r of filtered) {
      const checkOut = parseDateSafe(r.check_out_date)
      if (isAfter(checkOut, now) || isToday(checkOut)) {
        up.push(r)
      } else {
        pa.push(r)
      }
    }

    // Upcoming: soonest first
    up.sort(
      (a, b) =>
        parseDateSafe(a.check_in_date).getTime() -
        parseDateSafe(b.check_in_date).getTime()
    )
    // Past: most recent first
    pa.sort(
      (a, b) =>
        parseDateSafe(b.check_out_date).getTime() -
        parseDateSafe(a.check_out_date).getTime()
    )

    return { upcoming: up, past: pa }
  }, [filtered])

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search by guest name, confirmation code, or platform..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          variant="glass"
        />
      </div>

      {/* Results summary when searching */}
      {searchQuery.trim() && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "result" : "results"} for{" "}
          &ldquo;{searchQuery}&rdquo;
        </p>
      )}

      {/* Upcoming Reservations */}
      <ReservationSection
        title="Upcoming Reservations"
        reservations={upcoming}
        expandedId={expandedId}
        onToggle={handleToggle}
        emptyMessage={
          searchQuery
            ? "No upcoming reservations match your search"
            : "No upcoming reservations"
        }
      />

      {/* Past Reservations */}
      <ReservationSection
        title="Past Reservations"
        reservations={past}
        expandedId={expandedId}
        onToggle={handleToggle}
        emptyMessage={
          searchQuery
            ? "No past reservations match your search"
            : "No past reservations yet"
        }
      />
    </div>
  )
}
