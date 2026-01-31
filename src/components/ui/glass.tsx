import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Glass Morphism Utility Components for Co.Property Dashboard
 *
 * These components provide reusable glass morphism effects with:
 * - Backdrop blur effects (10-20px)
 * - Transparent backgrounds with proper opacity
 * - Subtle borders with semi-transparent white
 * - Soft depth shadows
 * - Full light/dark mode compatibility
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Additional CSS classes to apply
   */
  className?: string;
  /**
   * Content to render inside the glass card
   */
  children?: React.ReactNode;
  /**
   * Intensity of the glass effect
   * @default "medium"
   */
  intensity?: "light" | "medium" | "strong";
}

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Additional CSS classes to apply
   */
  className?: string;
  /**
   * Content to render inside the glass panel
   */
  children?: React.ReactNode;
  /**
   * Intensity of the glass effect
   * @default "medium"
   */
  intensity?: "light" | "medium" | "strong";
}

export interface GlassNavbarProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Additional CSS classes to apply
   */
  className?: string;
  /**
   * Content to render inside the glass navbar
   */
  children?: React.ReactNode;
  /**
   * Whether the navbar should be sticky
   * @default true
   */
  sticky?: boolean;
  /**
   * Intensity of the glass effect
   * @default "strong"
   */
  intensity?: "light" | "medium" | "strong";
}

// ============================================================================
// Glass Effect Variants
// ============================================================================

const glassVariants = {
  light: {
    backdrop: "backdrop-blur-lg", // 16px blur
    bgLight: "bg-white/90", // High opacity for light mode visibility
    bgDark: "dark:bg-white/5", // Subtle for dark mode
    border: "border border-white/30 dark:border-white/10",
    shadow: "shadow-lg shadow-primary/5",
  },
  medium: {
    backdrop: "backdrop-blur-xl", // 24px blur
    bgLight: "bg-white/80", // Medium-high opacity for light mode
    bgDark: "dark:bg-white/10", // Medium opacity for dark mode
    border: "border border-white/20 dark:border-white/15",
    shadow: "shadow-xl shadow-primary/5",
  },
  strong: {
    backdrop: "backdrop-blur-2xl", // 40px blur
    bgLight: "bg-white/70", // Medium opacity for light mode
    bgDark: "dark:bg-white/15", // Stronger opacity for dark mode
    border: "border border-white/30 dark:border-white/20",
    shadow: "shadow-2xl shadow-primary/10",
  },
};

// ============================================================================
// GlassCard Component
// ============================================================================

/**
 * GlassCard - A card component with glass morphism effect
 *
 * Perfect for content cards, feature boxes, and standalone UI elements.
 *
 * @example
 * ```tsx
 * <GlassCard intensity="medium" className="p-6">
 *   <h3>Property Overview</h3>
 *   <p>Content goes here</p>
 * </GlassCard>
 * ```
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, intensity = "medium", ...props }, ref) => {
    const variant = glassVariants[intensity];

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "rounded-lg transition-all duration-300",
          // Glass effect
          variant.backdrop,
          variant.bgLight,
          variant.bgDark,
          variant.border,
          variant.shadow,
          // Hover effect
          "hover:shadow-2xl hover:shadow-primary/10",
          "hover:border-white/40 dark:hover:border-white/25",
          // Custom classes
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

// ============================================================================
// GlassPanel Component
// ============================================================================

/**
 * GlassPanel - A larger panel/container component with glass morphism effect
 *
 * Ideal for sections, sidebars, and larger content areas.
 *
 * @example
 * ```tsx
 * <GlassPanel intensity="light" className="p-8">
 *   <header>Panel Header</header>
 *   <section>Panel Content</section>
 * </GlassPanel>
 * ```
 */
export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, children, intensity = "medium", ...props }, ref) => {
    const variant = glassVariants[intensity];

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "rounded-xl transition-all duration-300",
          // Glass effect
          variant.backdrop,
          variant.bgLight,
          variant.bgDark,
          variant.border,
          variant.shadow,
          // Panel-specific styling
          "overflow-hidden",
          // Custom classes
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = "GlassPanel";

// ============================================================================
// GlassNavbar Component
// ============================================================================

/**
 * GlassNavbar - A navigation bar component with glass morphism effect
 *
 * Designed for top navigation bars with optional sticky positioning.
 * Provides strong glass effect for better visibility over content.
 *
 * @example
 * ```tsx
 * <GlassNavbar sticky={true} className="px-6 py-4">
 *   <nav>Navigation items here</nav>
 * </GlassNavbar>
 * ```
 */
export const GlassNavbar = React.forwardRef<HTMLElement, GlassNavbarProps>(
  ({ className, children, sticky = true, intensity = "strong", ...props }, ref) => {
    const variant = glassVariants[intensity];

    return (
      <nav
        ref={ref}
        className={cn(
          // Base styles
          "w-full transition-all duration-300",
          // Positioning
          sticky && "sticky top-0 z-50",
          // Glass effect
          variant.backdrop,
          variant.bgLight,
          variant.bgDark,
          // Border only on bottom for navbar
          "border-b border-white/30 dark:border-white/20",
          variant.shadow,
          // Navbar-specific styling
          "supports-[backdrop-filter]:bg-white/60",
          "dark:supports-[backdrop-filter]:bg-white/10",
          // Custom classes
          className
        )}
        {...props}
      >
        {children}
      </nav>
    );
  }
);

GlassNavbar.displayName = "GlassNavbar";

// ============================================================================
// Additional Utility Components
// ============================================================================

/**
 * GlassButton - A button component with glass morphism effect
 *
 * Useful for CTAs and interactive elements that need glass styling.
 */
export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "ghost";
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "px-4 py-2 rounded-lg font-medium transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-primary/50",
          // Glass effect
          variant === "default" && [
            "backdrop-blur-xl",
            "bg-white/80 dark:bg-white/10",
            "border border-white/30 dark:border-white/20",
            "shadow-lg shadow-primary/5",
            "hover:bg-white/90 dark:hover:bg-white/15",
            "hover:shadow-xl hover:shadow-primary/10",
            "active:scale-95",
          ],
          variant === "ghost" && [
            "backdrop-blur-lg",
            "bg-white/50 dark:bg-white/5",
            "border border-white/20 dark:border-white/10",
            "hover:bg-white/70 dark:hover:bg-white/10",
            "active:scale-95",
          ],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";

/**
 * GlassBadge - A badge component with glass morphism effect
 *
 * Perfect for tags, labels, and status indicators.
 */
export interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  children?: React.ReactNode;
}

export const GlassBadge = React.forwardRef<HTMLSpanElement, GlassBadgeProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
          "transition-all duration-200",
          // Glass effect
          "backdrop-blur-lg",
          "bg-white/70 dark:bg-white/10",
          "border border-white/40 dark:border-white/20",
          "shadow-md shadow-primary/5",
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

GlassBadge.displayName = "GlassBadge";

// ============================================================================
// Export all components
// ============================================================================

export default {
  GlassCard,
  GlassPanel,
  GlassNavbar,
  GlassButton,
  GlassBadge,
};
