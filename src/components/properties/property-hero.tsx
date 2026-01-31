"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { GlassCard } from "@/components/ui/glass"
import { Button } from "@/components/ui/button"
import { Bed, Bath, Users, ChevronLeft, ChevronRight, X, ZoomIn, Images } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { Property } from "@/types/api"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PropertyHeroProps {
  property: Property
  images?: string[]
}

// ---------------------------------------------------------------------------
// Placeholder images used when no real images are provided
// ---------------------------------------------------------------------------

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PropertyHero({ property, images = [] }: PropertyHeroProps) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const propertyImages =
    images.length > 0 ? images : PLACEHOLDER_IMAGES

  // -----------------------------------------------------------------------
  // Navigation helpers (stable references via useCallback)
  // -----------------------------------------------------------------------

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length)
  }, [propertyImages.length])

  const prevImage = useCallback(() => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + propertyImages.length) % propertyImages.length,
    )
  }, [propertyImages.length])

  // -----------------------------------------------------------------------
  // Keyboard navigation (Arrow keys + Escape)
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!galleryOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevImage()
      if (e.key === "ArrowRight") nextImage()
      // Escape is handled natively by Radix Dialog
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [galleryOpen, nextImage, prevImage])

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <>
      {/* ================================================================= */}
      {/* Hero Section                                                       */}
      {/* ================================================================= */}
      <section id="hero" aria-label="Property hero">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* -------------------------------------------------------------- */}
          {/* Main Featured Image                                             */}
          {/* -------------------------------------------------------------- */}
          <div
            className="lg:col-span-2 relative h-64 sm:h-80 lg:h-96 rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => {
              setCurrentImageIndex(0)
              setGalleryOpen(true)
            }}
            role="button"
            tabIndex={0}
            aria-label="Open image gallery"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setCurrentImageIndex(0)
                setGalleryOpen(true)
              }
            }}
          >
            <Image
              src={propertyImages[0]}
              alt={property.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Hover zoom overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="h-12 w-12 rounded-full backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 flex items-center justify-center shadow-lg">
                  <ZoomIn className="h-6 w-6 text-foreground" />
                </div>
              </div>
            </div>

            {/* Quick Stats Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <GlassCard intensity="strong" className="p-3 sm:p-4">
                <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">
                      {property.bedrooms}
                    </span>
                    <span className="text-xs text-muted-foreground">Beds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">
                      {property.bathrooms}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Baths
                    </span>
                  </div>
                  {property.max_guests > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-sm">
                        {property.max_guests}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Guests
                      </span>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Image count badge - mobile */}
            <div className="absolute top-4 right-4 lg:hidden">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-xl bg-black/50 text-white text-xs font-medium">
                <Images className="h-3.5 w-3.5" />
                {propertyImages.length}
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Thumbnail Grid (desktop only)                                   */}
          {/* -------------------------------------------------------------- */}
          <div className="hidden lg:grid grid-rows-2 gap-3">
            {propertyImages.slice(1, 3).map((img, i) => (
              <div
                key={img}
                className="relative rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => {
                  setCurrentImageIndex(i + 1)
                  setGalleryOpen(true)
                }}
                role="button"
                tabIndex={0}
                aria-label={`View image ${i + 2} of ${propertyImages.length}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setCurrentImageIndex(i + 1)
                    setGalleryOpen(true)
                  }
                }}
              >
                <Image
                  src={img}
                  alt={`${property.name} - Image ${i + 2}`}
                  fill
                  sizes="33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Show "+N more" overlay on last visible thumbnail */}
                {i === 1 && propertyImages.length > 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-colors group-hover:bg-black/40">
                    <span className="text-white font-semibold text-sm">
                      +{propertyImages.length - 3} more
                    </span>
                  </div>
                )}
                {/* Hover effect for first thumbnail */}
                {(i === 0 || (i === 1 && propertyImages.length <= 3)) && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* Gallery Lightbox Modal                                              */}
      {/* ================================================================= */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/90 backdrop-blur-sm" />
          <DialogPrimitive.Content
            className="fixed inset-0 z-50 flex flex-col outline-none"
            aria-label="Image gallery"
            onPointerDownOutside={(e) => {
              // Allow clicking on navigation buttons without closing
              const target = e.target as HTMLElement
              if (target.closest("button")) {
                e.preventDefault()
              }
            }}
          >
            {/* Visually hidden title for accessibility */}
            <DialogPrimitive.Title className="sr-only">
              {property.name} - Image Gallery
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Browse images of {property.name}. Use arrow keys to navigate.
            </DialogPrimitive.Description>

            {/* ----------------------------------------------------------- */}
            {/* Top Bar: Counter + Close                                     */}
            {/* ----------------------------------------------------------- */}
            <div className="flex items-center justify-between p-4 relative z-10">
              {/* Image counter */}
              <div className="px-3 py-1.5 rounded-full backdrop-blur-xl bg-white/10 border border-white/10 text-white text-sm font-medium">
                {currentImageIndex + 1} of {propertyImages.length}
              </div>

              {/* Close button */}
              <button
                onClick={() => setGalleryOpen(false)}
                className="h-10 w-10 rounded-full backdrop-blur-xl bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Close gallery"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* Main Image Area                                              */}
            {/* ----------------------------------------------------------- */}
            <div
              className="flex-1 relative flex items-center justify-center px-4 pb-4 min-h-0"
              onClick={(e) => {
                // Click on backdrop (not buttons/images) closes
                if (e.target === e.currentTarget) {
                  setGalleryOpen(false)
                }
              }}
            >
              {/* Current image */}
              <div className="relative w-full h-full max-w-5xl mx-auto">
                <Image
                  key={currentImageIndex}
                  src={propertyImages[currentImageIndex]}
                  alt={`${property.name} - Image ${currentImageIndex + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>

              {/* Navigation arrows */}
              {propertyImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 sm:left-6 h-10 w-10 sm:h-12 sm:w-12 rounded-full backdrop-blur-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      prevImage()
                    }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 sm:right-6 h-10 w-10 sm:h-12 sm:w-12 rounded-full backdrop-blur-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      nextImage()
                    }}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </>
              )}
            </div>

            {/* ----------------------------------------------------------- */}
            {/* Thumbnail Strip                                              */}
            {/* ----------------------------------------------------------- */}
            <div className="p-4 backdrop-blur-xl bg-black/40 border-t border-white/10">
              <div className="flex gap-2 overflow-x-auto justify-center max-w-3xl mx-auto scrollbar-thin">
                {propertyImages.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setCurrentImageIndex(i)}
                    className={cn(
                      "relative h-14 w-20 sm:h-16 sm:w-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200",
                      currentImageIndex === i
                        ? "border-white ring-1 ring-white/30 opacity-100"
                        : "border-transparent opacity-50 hover:opacity-80",
                    )}
                    aria-label={`View image ${i + 1}`}
                    aria-current={currentImageIndex === i ? "true" : undefined}
                  >
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  )
}
