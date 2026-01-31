"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
  Sparkles,
  Clock,
  Calendar,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Camera,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  X,
  Search,
} from "lucide-react"
import {
  format,
  subDays,
  addDays,
  isAfter,
} from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

type CleaningStatus = "scheduled" | "completed" | "inspected"
type IssueSeverity = "low" | "medium" | "high"

interface CleaningPhoto {
  id: string
  url: string
  label: "before" | "after"
  caption: string
}

interface CleaningIssue {
  id: string
  description: string
  severity: IssueSeverity
  resolved: boolean
}

interface CleaningSession {
  id: string
  propertyId: string
  date: Date
  cleanerName: string
  cleanerAvatar: string
  startTime: string
  endTime: string
  durationMinutes: number
  status: CleaningStatus
  photos: CleaningPhoto[]
  issues: CleaningIssue[]
  checklist: { total: number; completed: number }
  notes?: string
}

interface CleaningHistoryProps {
  property: {
    id: string
    name: string
  }
}

type StatusFilter = "all" | CleaningStatus
type DateFilter = "all" | "7days" | "14days" | "30days" | "upcoming"

// ============================================================================
// Constants
// ============================================================================

const STATUS_CONFIG: Record<
  CleaningStatus,
  { label: string; variant: "default" | "success" | "secondary"; icon: typeof Sparkles }
> = {
  scheduled: { label: "Scheduled", variant: "default", icon: Calendar },
  completed: { label: "Completed", variant: "success", icon: CheckCircle2 },
  inspected: { label: "Inspected", variant: "secondary", icon: ClipboardCheck },
}

const SEVERITY_CONFIG: Record<
  IssueSeverity,
  { label: string; className: string }
> = {
  low: {
    label: "Low",
    className: "text-muted-foreground bg-muted/50 border-muted-foreground/20",
  },
  medium: {
    label: "Medium",
    className: "text-warning-500 bg-warning-500/10 border-warning-500/20",
  },
  high: {
    label: "High",
    className: "text-error-500 bg-error-500/10 border-error-500/20",
  },
}

const CLEANING_PHOTOS = [
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80",
  "https://images.unsplash.com/photo-1527515545081-5db817172677?w=600&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
  "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80",
]

const CLEANER_NAMES = [
  "Maria Santos",
  "Elena Petrova",
  "Sophie Laurent",
  "Ana Garcia",
  "Lucia Romano",
  "Petra Novak",
  "Ines Dubois",
  "Katarina Bergman",
]

const ISSUE_DESCRIPTIONS = [
  "Stain on living room carpet requires deep cleaning",
  "Bathroom grout needs resealing in shower area",
  "Kitchen exhaust fan making unusual noise",
  "Minor scuff marks on hallway wall",
  "Bedside lamp flickering intermittently",
  "Window latch in bedroom not closing properly",
  "Dishwasher drainage slow - may need maintenance",
  "Towel rack in guest bathroom is loose",
]

// ============================================================================
// Mock Data Generator (deterministic based on propertyId)
// ============================================================================

function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index * 127.1) * 43758.5453
  return x - Math.floor(x)
}

function generateCleaningSessions(propertyId: string): CleaningSession[] {
  const seed = propertyId
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)

  const sessions: CleaningSession[] = []
  const now = new Date()

  for (let i = 0; i < 15; i++) {
    const r = (idx: number) => seededRandom(seed, i * 100 + idx)

    // Spread sessions across past 30 days and 5 days into the future
    const dayOffset = i < 12 ? -Math.floor(r(0) * 28 + 1) : Math.floor(r(0) * 5 + 1)
    const sessionDate = dayOffset < 0 ? subDays(now, -dayOffset) : addDays(now, dayOffset)

    // Determine status based on whether it's future or past
    let status: CleaningStatus
    if (dayOffset > 0) {
      status = "scheduled"
    } else if (r(1) > 0.4) {
      status = "inspected"
    } else {
      status = "completed"
    }

    const cleanerIndex = Math.floor(r(2) * CLEANER_NAMES.length)
    const startHour = Math.floor(r(3) * 4 + 9) // 9am to 12pm
    const durationMinutes = Math.floor(r(4) * 90 + 60) // 60 to 150 min
    const endHour = startHour + Math.floor(durationMinutes / 60)
    const endMinute = durationMinutes % 60

    // Generate photos (2-4 per session for completed/inspected)
    const photos: CleaningPhoto[] = []
    if (status !== "scheduled") {
      const photoCount = Math.floor(r(5) * 3 + 2) // 2-4 photos
      for (let p = 0; p < photoCount; p++) {
        const photoIdx = Math.floor(r(10 + p) * CLEANING_PHOTOS.length)
        photos.push({
          id: `photo-${i}-${p}`,
          url: CLEANING_PHOTOS[photoIdx],
          label: p < Math.ceil(photoCount / 2) ? "before" : "after",
          caption:
            p < Math.ceil(photoCount / 2)
              ? `Before cleaning - Area ${p + 1}`
              : `After cleaning - Area ${p + 1}`,
        })
      }
    }

    // Generate issues (0-2 per session)
    const issues: CleaningIssue[] = []
    const issueCount = r(6) > 0.6 ? Math.floor(r(7) * 2 + 1) : 0
    for (let j = 0; j < issueCount; j++) {
      const issueIdx = Math.floor(r(20 + j) * ISSUE_DESCRIPTIONS.length)
      const severityRoll = r(30 + j)
      const severity: IssueSeverity =
        severityRoll > 0.7 ? "high" : severityRoll > 0.3 ? "medium" : "low"
      issues.push({
        id: `issue-${i}-${j}`,
        description: ISSUE_DESCRIPTIONS[issueIdx],
        severity,
        resolved: status === "inspected" && r(40 + j) > 0.3,
      })
    }

    const checklistTotal = Math.floor(r(8) * 5 + 12) // 12-16 items
    const checklistCompleted =
      status === "scheduled"
        ? 0
        : status === "inspected"
          ? checklistTotal
          : Math.floor(checklistTotal * (r(9) * 0.2 + 0.8))

    sessions.push({
      id: `clean-${propertyId.slice(0, 6)}-${i.toString().padStart(3, "0")}`,
      propertyId,
      date: sessionDate,
      cleanerName: CLEANER_NAMES[cleanerIndex],
      cleanerAvatar: "",
      startTime: `${startHour.toString().padStart(2, "0")}:00`,
      endTime: `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`,
      durationMinutes,
      status,
      photos,
      issues,
      checklist: { total: checklistTotal, completed: checklistCompleted },
      notes:
        r(50) > 0.7
          ? "Extra attention given to kitchen and bathroom areas."
          : undefined,
    })
  }

  // Sort by date descending (most recent first)
  sessions.sort((a, b) => b.date.getTime() - a.date.getTime())
  return sessions
}

// ============================================================================
// CSV Export Utility
// ============================================================================

function exportCleaningCsv(sessions: CleaningSession[]) {
  const lines: string[] = []
  lines.push("Date,Cleaner,Start,End,Duration (min),Status,Photos,Issues,Checklist")

  for (const s of sessions) {
    lines.push(
      [
        format(s.date, "yyyy-MM-dd"),
        `"${s.cleanerName}"`,
        s.startTime,
        s.endTime,
        s.durationMinutes,
        s.status,
        s.photos.length,
        s.issues.length,
        `${s.checklist.completed}/${s.checklist.total}`,
      ].join(",")
    )
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "cleaning-history.csv"
  link.click()
  URL.revokeObjectURL(url)
}

// ============================================================================
// Helper Components
// ============================================================================

function CleanerAvatar({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const hue = (hash * 47) % 360

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold text-white text-xs shrink-0",
        className
      )}
      style={{
        backgroundColor: `hsl(${hue}, 50%, 45%)`,
        width: "40px",
        height: "40px",
      }}
      aria-label={name}
    >
      {initials}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
      <p className="text-muted-foreground text-sm font-medium mb-1">
        No cleaning sessions found
      </p>
      <p className="text-muted-foreground/70 text-xs">
        Adjust your filters or check back later for cleaning history.
      </p>
    </div>
  )
}

// ============================================================================
// Photo Gallery with Lightbox
// ============================================================================

function PhotoGallery({ photos }: { photos: CleaningPhoto[] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }, [photos.length])

  const prevPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }, [photos.length])

  useEffect(() => {
    if (!lightboxOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevPhoto()
      if (e.key === "ArrowRight") nextPhoto()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [lightboxOpen, nextPhoto, prevPhoto])

  if (photos.length === 0) return null

  const beforePhotos = photos.filter((p) => p.label === "before")
  const afterPhotos = photos.filter((p) => p.label === "after")

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Camera className="h-3.5 w-3.5" />
          <span>Photos ({photos.length})</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Before Column */}
          {beforePhotos.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Before
              </p>
              <div className="grid gap-2">
                {beforePhotos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(photos.indexOf(photo))
                      setLightboxOpen(true)
                    }}
                    className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-property-primary/50"
                    aria-label={`View ${photo.caption}`}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.caption}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* After Column */}
          {afterPhotos.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                After
              </p>
              <div className="grid gap-2">
                {afterPhotos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(photos.indexOf(photo))
                      setLightboxOpen(true)
                    }}
                    className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-property-primary/50"
                    aria-label={`View ${photo.caption}`}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.caption}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/90 backdrop-blur-sm" />
          <DialogPrimitive.Content
            className="fixed inset-0 z-50 flex flex-col outline-none"
            aria-label="Cleaning photo gallery"
          >
            <DialogPrimitive.Title className="sr-only">
              Cleaning Photo Gallery
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Browse cleaning before and after photos. Use arrow keys to navigate.
            </DialogPrimitive.Description>

            {/* Top Bar */}
            <div className="flex items-center justify-between p-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-full backdrop-blur-xl bg-white/10 border border-white/10 text-white text-sm font-medium">
                  {currentIndex + 1} of {photos.length}
                </div>
                {photos[currentIndex] && (
                  <Badge
                    variant={photos[currentIndex].label === "before" ? "warning" : "success"}
                    size="sm"
                  >
                    {photos[currentIndex].label === "before" ? "Before" : "After"}
                  </Badge>
                )}
              </div>
              <button
                onClick={() => setLightboxOpen(false)}
                className="h-10 w-10 rounded-full backdrop-blur-xl bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Close gallery"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main Image */}
            <div
              className="flex-1 relative flex items-center justify-center px-4 pb-4 min-h-0"
              onClick={(e) => {
                if (e.target === e.currentTarget) setLightboxOpen(false)
              }}
            >
              {photos[currentIndex] && (
                <div className="relative w-full h-full max-w-5xl mx-auto">
                  <Image
                    key={currentIndex}
                    src={photos[currentIndex].url}
                    alt={photos[currentIndex].caption}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority
                  />
                </div>
              )}

              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 sm:left-6 h-10 w-10 sm:h-12 sm:w-12 rounded-full backdrop-blur-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      prevPhoto()
                    }}
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 sm:right-6 h-10 w-10 sm:h-12 sm:w-12 rounded-full backdrop-blur-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      nextPhoto()
                    }}
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Caption */}
            {photos[currentIndex] && (
              <div className="p-4 backdrop-blur-xl bg-black/40 border-t border-white/10 text-center">
                <p className="text-white text-sm">{photos[currentIndex].caption}</p>
              </div>
            )}
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  )
}

// ============================================================================
// Issues Section
// ============================================================================

function IssuesSection({ issues }: { issues: CleaningIssue[] }) {
  if (issues.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <AlertTriangle className="h-3.5 w-3.5" />
        <span>Reported Issues ({issues.length})</span>
      </div>

      <div className="space-y-2">
        {issues.map((issue) => {
          const config = SEVERITY_CONFIG[issue.severity]
          return (
            <div
              key={issue.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border text-sm",
                issue.resolved
                  ? "bg-muted/30 border-border/30 opacity-70"
                  : "bg-background/50 border-border/50"
              )}
            >
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 mt-0.5",
                  config.className
                )}
              >
                {config.label}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    issue.resolved && "line-through text-muted-foreground"
                  )}
                >
                  {issue.description}
                </p>
              </div>
              {issue.resolved && (
                <CheckCircle2 className="h-4 w-4 text-success-500 shrink-0 mt-0.5" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// Cleaning Session Item (expandable)
// ============================================================================

function CleaningSessionItem({
  session,
  expanded,
  onToggle,
}: {
  session: CleaningSession
  expanded: boolean
  onToggle: () => void
}) {
  const statusConfig = STATUS_CONFIG[session.status]
  const StatusIcon = statusConfig.icon
  const isUpcoming = isAfter(session.date, new Date())
  const issueCount = session.issues.filter((i) => !i.resolved).length

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-lg border transition-all duration-200",
        isUpcoming
          ? "border-property-primary/30 bg-property-primary/5"
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
          {/* Timeline dot / Avatar */}
          <CleanerAvatar name={session.cleanerName} />

          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Row 1: Date + Status */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm">
                  {format(session.date, "EEEE, MMM d, yyyy")}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <Badge variant={statusConfig.variant} size="sm">
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                  {issueCount > 0 && (
                    <Badge variant="warning" size="sm">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {issueCount} {issueCount === 1 ? "issue" : "issues"}
                    </Badge>
                  )}
                  {session.photos.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Camera className="h-3 w-3" />
                      {session.photos.length}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
                {session.durationMinutes} min
              </span>
            </div>

            {/* Row 2: Cleaner + Time */}
            <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 shrink-0" />
                <span>{session.cleanerName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />
                <span>
                  {session.startTime} - {session.endTime}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <ClipboardCheck className="h-3 w-3 shrink-0" />
                <span>
                  {session.checklist.completed}/{session.checklist.total}
                </span>
              </div>
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
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              <div className="pt-3 border-t border-border/30 ml-[52px] sm:ml-[56px] space-y-4">
                {/* Checklist progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Checklist Progress
                    </span>
                    <span className="font-medium">
                      {session.checklist.completed}/{session.checklist.total}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-success-500 transition-all duration-500"
                      style={{
                        width: `${(session.checklist.completed / session.checklist.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Notes */}
                {session.notes && (
                  <div className="text-sm text-muted-foreground italic border-l-2 border-property-primary/30 pl-3">
                    {session.notes}
                  </div>
                )}

                {/* Photos */}
                <PhotoGallery photos={session.photos} />

                {/* Issues */}
                <IssuesSection issues={session.issues} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================================================
// Summary Stats
// ============================================================================

function CleaningSummaryStats({ sessions }: { sessions: CleaningSession[] }) {
  const stats = useMemo(() => {
    const completed = sessions.filter(
      (s) => s.status === "completed" || s.status === "inspected"
    )
    const avgDuration =
      completed.length > 0
        ? Math.round(
            completed.reduce((sum, s) => sum + s.durationMinutes, 0) /
              completed.length
          )
        : 0
    const totalIssues = sessions.reduce(
      (sum, s) => sum + s.issues.length,
      0
    )
    const unresolvedIssues = sessions.reduce(
      (sum, s) => sum + s.issues.filter((i) => !i.resolved).length,
      0
    )
    const upcoming = sessions.filter((s) => s.status === "scheduled").length

    return { completed: completed.length, avgDuration, totalIssues, unresolvedIssues, upcoming }
  }, [sessions])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <GlassCard className="p-4 text-center">
        <p className="text-xs text-muted-foreground">Completed</p>
        <p className="text-2xl font-bold text-property-primary mt-1">
          {stats.completed}
        </p>
      </GlassCard>
      <GlassCard className="p-4 text-center">
        <p className="text-xs text-muted-foreground">Avg Duration</p>
        <p className="text-2xl font-bold text-foreground mt-1">
          {stats.avgDuration}
          <span className="text-sm font-normal text-muted-foreground ml-1">
            min
          </span>
        </p>
      </GlassCard>
      <GlassCard className="p-4 text-center">
        <p className="text-xs text-muted-foreground">Open Issues</p>
        <p
          className={cn(
            "text-2xl font-bold mt-1",
            stats.unresolvedIssues > 0 ? "text-warning-500" : "text-success-500"
          )}
        >
          {stats.unresolvedIssues}
        </p>
      </GlassCard>
      <GlassCard className="p-4 text-center">
        <p className="text-xs text-muted-foreground">Upcoming</p>
        <p className="text-2xl font-bold text-property-primary mt-1">
          {stats.upcoming}
        </p>
      </GlassCard>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function CleaningHistory({ property }: CleaningHistoryProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const allSessions = useMemo(
    () => generateCleaningSessions(property.id),
    [property.id]
  )

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  // Apply filters
  const filteredSessions = useMemo(() => {
    let result = allSessions

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter)
    }

    // Date filter
    const now = new Date()
    if (dateFilter === "7days") {
      const cutoff = subDays(now, 7)
      result = result.filter((s) => isAfter(s.date, cutoff))
    } else if (dateFilter === "14days") {
      const cutoff = subDays(now, 14)
      result = result.filter((s) => isAfter(s.date, cutoff))
    } else if (dateFilter === "30days") {
      const cutoff = subDays(now, 30)
      result = result.filter((s) => isAfter(s.date, cutoff))
    } else if (dateFilter === "upcoming") {
      result = result.filter((s) => isAfter(s.date, now))
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (s) =>
          s.cleanerName.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.issues.some((i) => i.description.toLowerCase().includes(q))
      )
    }

    return result
  }, [allSessions, statusFilter, dateFilter, searchQuery])

  // Split into upcoming and past
  const { upcoming, past } = useMemo(() => {
    const now = new Date()
    const up: CleaningSession[] = []
    const pa: CleaningSession[] = []
    for (const s of filteredSessions) {
      if (isAfter(s.date, now)) {
        up.push(s)
      } else {
        pa.push(s)
      }
    }
    // Upcoming: soonest first
    up.sort((a, b) => a.date.getTime() - b.date.getTime())
    return { upcoming: up, past: pa }
  }, [filteredSessions])

  const handleExport = () => {
    exportCleaningCsv(filteredSessions)
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <CleaningSummaryStats sessions={allSessions} />

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search cleaner or issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[200px]"
              variant="glass"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger variant="glass" className="w-[150px]">
              <Filter className="h-4 w-4 mr-2 opacity-50" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent variant="glass">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="inspected">Inspected</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <Select
            value={dateFilter}
            onValueChange={(v) => setDateFilter(v as DateFilter)}
          >
            <SelectTrigger variant="glass" className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2 opacity-50" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent variant="glass">
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="14days">Last 14 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export */}
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Results summary when searching */}
      {(searchQuery.trim() || statusFilter !== "all" || dateFilter !== "all") && (
        <p className="text-xs text-muted-foreground">
          {filteredSessions.length}{" "}
          {filteredSessions.length === 1 ? "session" : "sessions"} found
        </p>
      )}

      {/* Upcoming Cleanings */}
      {upcoming.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-property-primary" />
            Upcoming Cleanings
            <span className="text-sm font-normal text-muted-foreground">
              ({upcoming.length})
            </span>
          </h3>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {upcoming.map((session) => (
                <CleaningSessionItem
                  key={session.id}
                  session={session}
                  expanded={expandedId === session.id}
                  onToggle={() => handleToggle(session.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </GlassCard>
      )}

      {/* Past Cleanings */}
      <GlassCard className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-property-primary" />
          Cleaning History
          <span className="text-sm font-normal text-muted-foreground">
            ({past.length})
          </span>
        </h3>
        {past.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {past.map((session) => (
                <CleaningSessionItem
                  key={session.id}
                  session={session}
                  expanded={expandedId === session.id}
                  onToggle={() => handleToggle(session.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
