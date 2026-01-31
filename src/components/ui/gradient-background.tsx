import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

// ============================================================================
// AuroraBackground - Full-page animated gradient background
// ============================================================================

export type AuroraVariant = "blue" | "purple" | "mesh";

export interface AuroraBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AuroraVariant;
  opacity?: "low" | "medium" | "high";
}

export function AuroraBackground({
  variant = "blue",
  opacity = "low",
  className,
  ...props
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 -z-10",
        // Gradient variants
        variant === "blue" && "bg-gradient-aurora-blue",
        variant === "purple" && "bg-gradient-aurora-purple",
        variant === "mesh" && "bg-gradient-aurora-mesh",
        // Large background size for smooth animation
        "bg-[length:200%_200%]",
        // Smooth gradient flow animation
        "animate-gradient-flow",
        // Respect reduced motion preferences
        "motion-reduce:animate-none",
        // Opacity variants
        opacity === "low" && "opacity-10 dark:opacity-20",
        opacity === "medium" && "opacity-20 dark:opacity-30",
        opacity === "high" && "opacity-30 dark:opacity-40",
        className
      )}
      {...props}
    />
  );
}

// ============================================================================
// GradientAccent - Decorative gradient element (orbs, blobs)
// ============================================================================

export type GradientAccentSize = "sm" | "md" | "lg" | "xl";
export type GradientAccentShape = "circle" | "blob" | "ellipse";

export interface GradientAccentProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AuroraVariant;
  size?: GradientAccentSize;
  shape?: GradientAccentShape;
  blur?: boolean;
  animate?: boolean;
}

export function GradientAccent({
  variant = "blue",
  size = "md",
  shape = "circle",
  blur = true,
  animate = true,
  className,
  ...props
}: GradientAccentProps) {
  return (
    <div
      className={cn(
        "absolute pointer-events-none",
        // Gradient variants
        variant === "blue" && "bg-gradient-aurora-blue",
        variant === "purple" && "bg-gradient-aurora-purple",
        variant === "mesh" && "bg-gradient-aurora-mesh",
        // Size variants
        size === "sm" && "w-32 h-32",
        size === "md" && "w-48 h-48",
        size === "lg" && "w-64 h-64",
        size === "xl" && "w-96 h-96",
        // Shape variants
        shape === "circle" && "rounded-full",
        shape === "blob" && "rounded-[40%_60%_70%_30%/50%_40%_60%_50%]",
        shape === "ellipse" && "rounded-full aspect-[2/1]",
        // Blur effect for atmospheric look
        blur && "blur-3xl",
        // Animation
        animate && "bg-[length:200%_200%] animate-gradient-flow motion-reduce:animate-none",
        // Opacity for subtle effect
        "opacity-20 dark:opacity-30",
        className
      )}
      {...props}
    />
  );
}

// ============================================================================
// GradientText - Text with gradient effect
// ============================================================================

export type GradientTextSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

export interface GradientTextProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: AuroraVariant;
  size?: GradientTextSize;
  animate?: boolean;
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
}

export function GradientText({
  variant = "blue",
  size = "md",
  animate = true,
  as: Component = "span",
  className,
  children,
  ...props
}: GradientTextProps) {
  return (
    <Component
      className={cn(
        "inline-block",
        // Gradient variants
        variant === "blue" && "bg-gradient-aurora-blue",
        variant === "purple" && "bg-gradient-aurora-purple",
        variant === "mesh" && "bg-gradient-aurora-mesh",
        // Clip text to show gradient
        "bg-clip-text text-transparent",
        // Font sizes
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-lg",
        size === "xl" && "text-xl",
        size === "2xl" && "text-2xl",
        size === "3xl" && "text-3xl",
        // Font weight for better visibility
        "font-semibold",
        // Animation
        animate && "bg-[length:200%_200%] animate-gradient-flow motion-reduce:animate-none",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
