"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { type LucideIcon } from "lucide-react"

/**
 * EmptyState - A reusable empty state component for when pages have no data.
 *
 * Follows the glassmorphism design system with subtle backgrounds,
 * lucide-react icon illustrations, and optional CTA buttons.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Home}
 *   title="No properties found"
 *   description="Get started by adding your first property."
 *   actionLabel="Add Property"
 *   onAction={() => router.push("/properties/new")}
 * />
 * ```
 */

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lucide icon to display as illustration */
  icon: LucideIcon
  /** Main title text */
  title: string
  /** Supporting description text */
  description: string
  /** Optional action button label */
  actionLabel?: string
  /** Optional action button click handler */
  onAction?: () => void
  /** Optional action button href (renders as link) */
  actionHref?: string
  /** Optional secondary action button label */
  secondaryActionLabel?: string
  /** Optional secondary action handler */
  onSecondaryAction?: () => void
  /** Size variant */
  size?: "sm" | "md" | "lg"
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  secondaryActionLabel,
  onSecondaryAction,
  size = "md",
  className,
  ...props
}: EmptyStateProps) {
  const iconSizes = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-20 w-20",
  }

  const containerPadding = {
    sm: "py-8",
    md: "py-16",
    lg: "py-24",
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        containerPadding[size],
        className
      )}
      {...props}
    >
      {/* Icon container with glass effect */}
      <div className="mb-6 rounded-2xl p-4 backdrop-blur-sm bg-muted/30 border border-border/50">
        <Icon
          className={cn(
            iconSizes[size],
            "text-muted-foreground/60"
          )}
          strokeWidth={1.5}
        />
      </div>

      {/* Title */}
      <h3
        className={cn(
          "font-heading font-semibold text-foreground mb-2",
          size === "sm" && "text-base",
          size === "md" && "text-lg",
          size === "lg" && "text-xl"
        )}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={cn(
          "text-muted-foreground max-w-md mb-6",
          size === "sm" && "text-sm",
          size === "md" && "text-sm",
          size === "lg" && "text-base"
        )}
      >
        {description}
      </p>

      {/* Action buttons */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3">
          {actionLabel && (
            <Button
              onClick={onAction}
              {...(actionHref ? { asChild: true } : {})}
            >
              {actionHref ? (
                <a href={actionHref}>{actionLabel}</a>
              ) : (
                actionLabel
              )}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export { EmptyState }
export type { EmptyStateProps }
