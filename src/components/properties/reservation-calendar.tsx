"use client"

import { useState, useMemo, useCallback } from "react"
import { GlassCard } from "@/components/ui/glass"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Calendar,
  DollarSign,
  Globe,
  MessageSquare,
} from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  parseISO,
  addMonths,
  subMonths,
  differenceInDays,
} from "date-fns"
import type { Reservation } from "@/types/api"

// ============================================================================
// Types
// ============================================================================

type ReservationStatus = "confirmed" | "checked_in" | "checked_out" | "blocked" | "cancelled"

interface CalendarReservation {
  id: string
  guestName: string
  checkIn: Date
  checkOut: Date
  status: ReservationStatus
  platform: string
  revenue: number
  currency: string
  guestCount: number
  confirmationCode: string
  specialRequests?: string
}

interface ReservationCalendarProps {
  propertyId: string
  reservations?: Reservation[]
}

// ============================================================================
// Status Color Mapping
// ============================================================================

const STATUS_CONFIG: Record<ReservationStatus, {
  label: string
  cellBg: string
  cellBorder: string
  cellText: string
  badgeVariant: "default" | "success" | "secondary" | "error" | "outline"
  legendDot: string
}> = {
  confirmed: {
    label: "Confirmed",
    cellBg: "bg-primary-100 dark:bg-primary-900/30",
    cellBorder: "border-primary-400 dark:border-primary-600",
    cellText: "text-primary-700 dark:text-primary-300",
    badgeVariant: "default",
    legendDot: "bg-primary-400 dark:bg-primary-500",
  },
  checked_in: {
    label: "Checked In",
    cellBg: "bg-success-100 dark:bg-success-700/20",
    cellBorder: "border-success-500",
    cellText: "text-success-700 dark:text-success-500",
    badgeVariant: "success",
    legendDot: "bg-success-500",
  },
  checked_out: {
    label: "Checked Out",
    cellBg: "bg-gray-100 dark:bg-gray-800/50",
    cellBorder: "border-gray-300 dark:border-gray-600",
    cellText: "text-gray-500 dark:text-gray-400",
    badgeVariant: "outline",
    legendDot: "bg-gray-400 dark:bg-gray-500",
  },
  blocked: {
    label: "Blocked",
    cellBg: "bg-error-50 dark:bg-error-700/20",
    cellBorder: "border-error-400 dark:border-error-600",
    cellText: "text-error-700 dark:text-error-500",
    badgeVariant: "error",
    legendDot: "bg-error-500",
  },
  cancelled: {
    label: "Cancelled",
    cellBg: "bg-gray-50 dark:bg-gray-800/30",
    cellBorder: "border-gray-200 dark:border-gray-700",
    cellText: "text-gray-400 dark:text-gray-500",
    badgeVariant: "outline",
    legendDot: "bg-gray-300 dark:bg-gray-600",
  },
}

// ============================================================================
// Helpers
// ============================================================================

function normalizeStatus(status: string): ReservationStatus {
  const lower = status.toLowerCase().replace(/[-\s]/g, "_")
  if (lower.includes("checked_in") || lower.includes("checkedin")) return "checked_in"
  if (lower.includes("checked_out") || lower.includes("checkedout")) return "checked_out"
  if (lower.includes("block") || lower.includes("maintenance")) return "blocked"
  if (lower.includes("cancel")) return "cancelled"
  return "confirmed"
}

function transformReservation(r: Reservation): CalendarReservation {
  return {
    id: r.id,
    guestName: r.guest_name || "Guest",
    checkIn: parseISO(r.check_in_date),
    checkOut: parseISO(r.check_out_date),
    status: normalizeStatus(r.status),
    platform: r.platform || "Direct",
    revenue: r.payout_amount || r.total_price || 0,
    currency: r.currency || "USD",
    guestCount: r.guest_count || 1,
    confirmationCode: r.confirmation_code || "",
    specialRequests: r.special_requests,
  }
}

// Generate mock reservations for demonstration when no real data available
function generateMockReservations(currentMonth: Date): CalendarReservation[] {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  return [
    {
      id: "mock-1",
      guestName: "Sarah Johnson",
      checkIn: new Date(year, month, 3),
      checkOut: new Date(year, month, 7),
      status: "checked_out",
      platform: "Airbnb",
      revenue: 620,
      currency: "USD",
      guestCount: 2,
      confirmationCode: "HMA4X8K2",
      specialRequests: "Early check-in requested",
    },
    {
      id: "mock-2",
      guestName: "Michael Chen",
      checkIn: new Date(year, month, 8),
      checkOut: new Date(year, month, 12),
      status: "checked_in",
      platform: "Booking.com",
      revenue: 840,
      currency: "USD",
      guestCount: 3,
      confirmationCode: "BK9283741",
    },
    {
      id: "mock-3",
      guestName: "Maintenance",
      checkIn: new Date(year, month, 13),
      checkOut: new Date(year, month, 14),
      status: "blocked",
      platform: "Internal",
      revenue: 0,
      currency: "USD",
      guestCount: 0,
      confirmationCode: "MAINT-001",
      specialRequests: "Deep cleaning and AC maintenance",
    },
    {
      id: "mock-4",
      guestName: "Emma Williams",
      checkIn: new Date(year, month, 15),
      checkOut: new Date(year, month, 22),
      status: "confirmed",
      platform: "Airbnb",
      revenue: 1450,
      currency: "USD",
      guestCount: 4,
      confirmationCode: "HMRZ7N3P",
      specialRequests: "Need a crib for baby",
    },
    {
      id: "mock-5",
      guestName: "James Park",
      checkIn: new Date(year, month, 24),
      checkOut: new Date(year, month, 28),
      status: "confirmed",
      platform: "Vrbo",
      revenue: 780,
      currency: "USD",
      guestCount: 2,
      confirmationCode: "VR483921",
    },
  ]
}

// ============================================================================
// Reservation Detail Modal
// ============================================================================

function ReservationDetailModal({
  reservation,
  onClose,
}: {
  reservation: CalendarReservation
  onClose: () => void
}) {
  const config = STATUS_CONFIG[reservation.status]
  const nights = differenceInDays(reservation.checkOut, reservation.checkIn)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <GlassCard
        intensity="strong"
        className="relative z-10 w-full max-w-md p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground">
              {reservation.guestName}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {reservation.confirmationCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted/80 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Status Badge */}
        <Badge variant={config.badgeVariant} size="lg">
          {config.label}
        </Badge>

        {/* Details Grid */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="text-sm">
              <span className="text-foreground">
                {format(reservation.checkIn, "MMM d")} - {format(reservation.checkOut, "MMM d, yyyy")}
              </span>
              <span className="text-muted-foreground ml-1.5">
                ({nights} {nights === 1 ? "night" : "nights"})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-foreground">
              {reservation.guestCount} {reservation.guestCount === 1 ? "guest" : "guests"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-foreground">
              {reservation.platform}
            </span>
          </div>

          {reservation.revenue > 0 && (
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium text-foreground">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: reservation.currency,
                }).format(reservation.revenue)}
              </span>
            </div>
          )}

          {reservation.specialRequests && (
            <div className="flex items-start gap-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">
                {reservation.specialRequests}
              </span>
            </div>
          )}
        </div>

        {/* Close Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onClose}
        >
          Close
        </Button>
      </GlassCard>
    </div>
  )
}

// ============================================================================
// Main Calendar Component
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ReservationCalendar({ propertyId: _propertyId, reservations: rawReservations }: ReservationCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedReservation, setSelectedReservation] = useState<CalendarReservation | null>(null)
  const [hoveredReservationId, setHoveredReservationId] = useState<string | null>(null)

  // Transform API reservations or use mock data
  const calendarReservations = useMemo(() => {
    if (rawReservations && rawReservations.length > 0) {
      return rawReservations.map(transformReservation)
    }
    return generateMockReservations(currentMonth)
  }, [rawReservations, currentMonth])

  // Build the calendar grid: full weeks including padding days from adjacent months
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart) // Sunday
    const calendarEnd = endOfWeek(monthEnd) // Saturday
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  // Index reservations by date for O(1) lookup
  const reservationsByDate = useMemo(() => {
    const map = new Map<string, CalendarReservation[]>()
    for (const res of calendarReservations) {
      const days = eachDayOfInterval({ start: res.checkIn, end: res.checkOut })
      for (const day of days) {
        // Exclude the checkout day itself from the block (checkout is departure day)
        if (isSameDay(day, res.checkOut)) continue
        const key = format(day, "yyyy-MM-dd")
        const existing = map.get(key) || []
        existing.push(res)
        map.set(key, existing)
      }
    }
    return map
  }, [calendarReservations])

  // Navigation callbacks
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1))
  }, [])

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date())
  }, [])

  // Get reservation for a specific date
  const getReservationsForDate = useCallback(
    (date: Date): CalendarReservation[] => {
      const key = format(date, "yyyy-MM-dd")
      return reservationsByDate.get(key) || []
    },
    [reservationsByDate]
  )

  // Determine if a date is the start of a reservation span
  const isSpanStart = useCallback(
    (date: Date, reservation: CalendarReservation): boolean => {
      return isSameDay(date, reservation.checkIn)
    },
    []
  )

  // Determine if a date is the end of a reservation span (day before checkout)
  const isSpanEnd = useCallback(
    (date: Date, reservation: CalendarReservation): boolean => {
      const lastNight = new Date(reservation.checkOut)
      lastNight.setDate(lastNight.getDate() - 1)
      return isSameDay(date, lastNight)
    },
    []
  )

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <>
      <GlassCard className="p-4 sm:p-6">
        {/* Calendar Header with Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading font-semibold text-lg text-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousMonth}
              aria-label="Previous month"
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="h-8 px-3 text-xs font-medium"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              aria-label="Next month"
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable calendar container for mobile */}
        <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="min-w-[600px]">
            {/* Day Name Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-muted-foreground py-2 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const inCurrentMonth = isSameMonth(day, currentMonth)
                const today = isToday(day)
                const dayReservations = getReservationsForDate(day)
                const primaryReservation = dayReservations[0] || null
                const statusConfig = primaryReservation
                  ? STATUS_CONFIG[primaryReservation.status]
                  : null
                const isStart = primaryReservation
                  ? isSpanStart(day, primaryReservation)
                  : false
                const isEnd = primaryReservation
                  ? isSpanEnd(day, primaryReservation)
                  : false
                const isHovered =
                  primaryReservation &&
                  hoveredReservationId === primaryReservation.id

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "relative min-h-[72px] sm:min-h-[80px] p-1.5 sm:p-2 rounded-lg transition-all duration-150",
                      // Base styling
                      !inCurrentMonth && "opacity-30",
                      // Today ring indicator
                      today && "ring-2 ring-property-primary ring-offset-1 ring-offset-background",
                      // Reservation styling
                      primaryReservation && statusConfig
                        ? cn(
                            statusConfig.cellBg,
                            "border",
                            statusConfig.cellBorder,
                            "cursor-pointer",
                            isHovered && "opacity-80 scale-[0.98]",
                            // Span rounding: remove rounding on continuation edges
                            isStart && !isEnd && "rounded-r-none",
                            isEnd && !isStart && "rounded-l-none",
                            !isStart && !isEnd && "rounded-none",
                          )
                        : cn(
                            "border border-border/30 dark:border-border/20",
                            "hover:bg-muted/30 dark:hover:bg-muted/10",
                          ),
                    )}
                    onClick={() => {
                      if (primaryReservation) {
                        setSelectedReservation(primaryReservation)
                      }
                    }}
                    onMouseEnter={() => {
                      if (primaryReservation) {
                        setHoveredReservationId(primaryReservation.id)
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredReservationId(null)
                    }}
                    title={
                      primaryReservation
                        ? `${primaryReservation.guestName} (${statusConfig?.label}) - ${primaryReservation.platform}`
                        : format(day, "EEEE, MMMM d")
                    }
                  >
                    {/* Day Number */}
                    <div
                      className={cn(
                        "text-xs sm:text-sm font-medium mb-0.5",
                        today && "text-property-primary font-bold",
                        !today && inCurrentMonth && "text-foreground",
                        !today && !inCurrentMonth && "text-muted-foreground",
                        primaryReservation && statusConfig && statusConfig.cellText,
                      )}
                    >
                      {format(day, "d")}
                    </div>

                    {/* Reservation Info - Only show on span start or first visible day of the week */}
                    {primaryReservation && (isStart || day.getDay() === 0) && (
                      <div
                        className={cn(
                          "text-[10px] sm:text-xs leading-tight truncate font-medium",
                          statusConfig?.cellText,
                        )}
                      >
                        {primaryReservation.guestName}
                      </div>
                    )}

                    {/* Check-in / Check-out indicator */}
                    {primaryReservation && isStart && (
                      <div
                        className={cn(
                          "text-[9px] sm:text-[10px] leading-tight truncate mt-0.5",
                          statusConfig?.cellText,
                          "opacity-70",
                        )}
                      >
                        Check-in
                      </div>
                    )}
                    {primaryReservation && isEnd && !isStart && (
                      <div
                        className={cn(
                          "text-[9px] sm:text-[10px] leading-tight truncate mt-0.5",
                          statusConfig?.cellText,
                          "opacity-70",
                        )}
                      >
                        Check-out
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6 pt-4 border-t border-border/30 dark:border-border/20">
          {(Object.entries(STATUS_CONFIG) as [ReservationStatus, typeof STATUS_CONFIG[ReservationStatus]][])
            .filter(([key]) => key !== "cancelled")
            .map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className={cn("h-3 w-3 rounded-sm", config.legendDot)}
                />
                <span className="text-xs text-muted-foreground">
                  {config.label}
                </span>
              </div>
            ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            {
              label: "Total Reservations",
              value: calendarReservations.filter(
                (r) => r.status !== "blocked" && r.status !== "cancelled"
              ).length,
            },
            {
              label: "Nights Booked",
              value: calendarReservations
                .filter((r) => r.status !== "blocked" && r.status !== "cancelled")
                .reduce(
                  (sum, r) => sum + differenceInDays(r.checkOut, r.checkIn),
                  0
                ),
            },
            {
              label: "Revenue",
              value: new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(
                calendarReservations
                  .filter((r) => r.status !== "blocked" && r.status !== "cancelled")
                  .reduce((sum, r) => sum + r.revenue, 0)
              ),
            },
            {
              label: "Blocked Days",
              value: calendarReservations
                .filter((r) => r.status === "blocked")
                .reduce(
                  (sum, r) => sum + differenceInDays(r.checkOut, r.checkIn),
                  0
                ),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-2 rounded-md bg-muted/30 dark:bg-muted/10"
            >
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Detail Modal */}
      {selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </>
  )
}
