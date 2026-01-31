import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-property-primary text-white hover:bg-property-primary/90 shadow-sm",
                secondary:
                    "border-transparent bg-property-secondary text-white hover:bg-property-secondary/90 shadow-sm",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
                outline: "text-foreground border-current",
                success: "border-transparent bg-success-500 text-white hover:bg-success-600 shadow-sm",
                warning: "border-transparent bg-warning-500 text-white hover:bg-warning-600 shadow-sm",
                error: "border-transparent bg-error-500 text-white hover:bg-error-600 shadow-sm",
                glass: "backdrop-blur-lg bg-white/70 dark:bg-white/10 border-white/40 dark:border-white/20 shadow-md shadow-primary/5 hover:bg-white/80 dark:hover:bg-white/15",
            },
            size: {
                sm: "px-2 py-0.5 text-xs",
                md: "px-2.5 py-0.5 text-xs",
                lg: "px-3 py-1 text-sm",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, size, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
