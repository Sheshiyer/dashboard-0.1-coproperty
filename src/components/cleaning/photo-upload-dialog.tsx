"use client"

import { useState, useCallback, useRef } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass"
import {
    Camera,
    Upload,
    X,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    Trash2,
    Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

export interface CleaningPhoto {
    id: string
    jobId: string
    type: "before" | "after"
    dataUrl: string
    caption?: string
    timestamp: string
}

interface PhotoUploadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    jobId: string
    propertyName: string
    existingPhotos?: CleaningPhoto[]
    onSave: (jobId: string, photos: CleaningPhoto[]) => Promise<void>
}

// ============================================================================
// Photo Gallery Viewer (lightbox)
// ============================================================================

interface PhotoGalleryProps {
    photos: CleaningPhoto[]
    initialIndex?: number
    onClose: () => void
}

function PhotoGallery({ photos, initialIndex = 0, onClose }: PhotoGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const current = photos[currentIndex]

    if (!current) return null

    return (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
            >
                <X className="h-6 w-6" />
            </button>

            {/* Photo counter */}
            <div className="absolute top-4 left-4 text-white/80 text-sm">
                {currentIndex + 1} / {photos.length}
            </div>

            {/* Navigation */}
            {currentIndex > 0 && (
                <button
                    onClick={() => setCurrentIndex((i) => i - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 rounded-full p-2"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
            )}
            {currentIndex < photos.length - 1 && (
                <button
                    onClick={() => setCurrentIndex((i) => i + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 rounded-full p-2"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            )}

            {/* Image */}
            <img
                src={current.dataUrl}
                alt={current.caption || `${current.type} photo`}
                className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
            />

            {/* Caption */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
                <Badge variant={current.type === "before" ? "warning" : "success"} size="lg">
                    {current.type === "before" ? "Before" : "After"}
                </Badge>
                {current.caption && (
                    <p className="text-white/80 text-sm mt-2">{current.caption}</p>
                )}
            </div>
        </div>
    )
}

// ============================================================================
// Photo Count Badge (exported for job card)
// ============================================================================

interface PhotoCountBadgeProps {
    count: number
    className?: string
}

export function PhotoCountBadge({ count, className }: PhotoCountBadgeProps) {
    if (count === 0) return null
    return (
        <div className={cn("flex items-center gap-1 text-muted-foreground", className)}>
            <Camera className="h-3 w-3" />
            <span className="text-[10px] tabular-nums">{count}</span>
        </div>
    )
}

// ============================================================================
// Photo Upload Dialog
// ============================================================================

export function PhotoUploadDialog({
    open,
    onOpenChange,
    jobId,
    propertyName,
    existingPhotos = [],
    onSave,
}: PhotoUploadDialogProps) {
    const [photos, setPhotos] = useState<CleaningPhoto[]>(existingPhotos)
    const [activeTab, setActiveTab] = useState<"before" | "after">("before")
    const [saving, setSaving] = useState(false)
    const [galleryIndex, setGalleryIndex] = useState<number | null>(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const beforePhotos = photos.filter((p) => p.type === "before")
    const afterPhotos = photos.filter((p) => p.type === "after")
    const activePhotos = activeTab === "before" ? beforePhotos : afterPhotos

    const handleFileSelect = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files
            if (!files || files.length === 0) return

            setUploading(true)
            const newPhotos: CleaningPhoto[] = []

            for (const file of Array.from(files)) {
                if (!file.type.startsWith("image/")) continue
                if (file.size > 10 * 1024 * 1024) continue // 10MB max

                const dataUrl = await new Promise<string>((resolve) => {
                    const reader = new FileReader()
                    reader.onload = () => resolve(reader.result as string)
                    reader.readAsDataURL(file)
                })

                // Compress if needed by resizing
                const compressed = await compressImage(dataUrl, 1200, 0.8)

                newPhotos.push({
                    id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                    jobId,
                    type: activeTab,
                    dataUrl: compressed,
                    timestamp: new Date().toISOString(),
                })
            }

            setPhotos((prev) => [...prev, ...newPhotos])
            setUploading(false)

            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        },
        [activeTab, jobId]
    )

    const removePhoto = useCallback((photoId: string) => {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId))
    }, [])

    const handleSave = useCallback(async () => {
        setSaving(true)
        try {
            await onSave(jobId, photos)
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to save photos:", error)
        } finally {
            setSaving(false)
        }
    }, [jobId, photos, onSave, onOpenChange])

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Camera className="h-5 w-5 text-property-primary" />
                            Cleaning Photos
                        </DialogTitle>
                        <DialogDescription>{propertyName}</DialogDescription>
                    </DialogHeader>

                    {/* Before/After Tabs */}
                    <div className="flex gap-2 px-1">
                        <button
                            onClick={() => setActiveTab("before")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                                activeTab === "before"
                                    ? "bg-warning-500 text-white shadow-md"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                            )}
                        >
                            Before
                            <Badge variant="outline" size="sm">
                                {beforePhotos.length}
                            </Badge>
                        </button>
                        <button
                            onClick={() => setActiveTab("after")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                                activeTab === "after"
                                    ? "bg-success-500 text-white shadow-md"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                            )}
                        >
                            After
                            <Badge variant="outline" size="sm">
                                {afterPhotos.length}
                            </Badge>
                        </button>
                    </div>

                    {/* Photo Grid */}
                    <div className="flex-1 overflow-y-auto min-h-0 px-1">
                        {activePhotos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <ImageIcon className="h-12 w-12 mb-3 opacity-40" />
                                <p className="text-sm">
                                    No {activeTab} photos yet
                                </p>
                                <p className="text-xs mt-1">
                                    Upload photos to document the cleaning
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {activePhotos.map((photo) => (
                                    <GlassCard
                                        key={photo.id}
                                        intensity="light"
                                        className="relative group overflow-hidden aspect-square"
                                    >
                                        <img
                                            src={photo.dataUrl}
                                            alt={`${photo.type} photo`}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                            <button
                                                onClick={() => {
                                                    const allIdx = photos.indexOf(photo)
                                                    setGalleryIndex(allIdx)
                                                }}
                                                className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30"
                                            >
                                                <ZoomIn className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => removePhoto(photo.id)}
                                                className="p-2 bg-red-500/60 backdrop-blur-sm rounded-full text-white hover:bg-red-500/80"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {/* Timestamp */}
                                        <div className="absolute bottom-1 left-1 right-1">
                                            <span className="text-[9px] text-white bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
                                                {new Date(photo.timestamp).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upload Button */}
                    <div className="px-1">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    Upload {activeTab} photos
                                </>
                            )}
                        </Button>
                    </div>

                    <DialogFooter>
                        <div className="mr-auto text-sm text-muted-foreground">
                            {photos.length} photo{photos.length !== 1 ? "s" : ""} total
                        </div>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} loading={saving}>
                            {saving ? "Saving..." : "Save Photos"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Gallery Lightbox */}
            {galleryIndex !== null && (
                <PhotoGallery
                    photos={photos}
                    initialIndex={galleryIndex}
                    onClose={() => setGalleryIndex(null)}
                />
            )}
        </>
    )
}

// ============================================================================
// Image Compression Utility
// ============================================================================

function compressImage(
    dataUrl: string,
    maxWidth: number,
    quality: number
): Promise<string> {
    return new Promise((resolve) => {
        const img = new window.Image()
        img.onload = () => {
            const canvas = document.createElement("canvas")
            let width = img.width
            let height = img.height

            if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
            }

            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext("2d")
            if (!ctx) {
                resolve(dataUrl)
                return
            }
            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL("image/jpeg", quality))
        }
        img.onerror = () => resolve(dataUrl)
        img.src = dataUrl
    })
}
