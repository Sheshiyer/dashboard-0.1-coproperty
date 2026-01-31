import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
    "flex h-10 w-full rounded-md px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "border border-input bg-background ring-offset-background focus-visible:ring-2 focus-visible:ring-property-primary focus-visible:ring-offset-2",
                glass:
                    "backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-white/30 dark:border-white/20 shadow-lg shadow-primary/5 focus-visible:bg-white/90 dark:focus-visible:bg-white/15 focus-visible:border-white/40 dark:focus-visible:border-white/25 focus-visible:shadow-xl focus-visible:shadow-primary/10",
            },
            inputSize: {
                default: "h-10",
                sm: "h-9 text-xs",
                lg: "h-11",
            },
            error: {
                true: "border-error-500 focus-visible:ring-error-500",
                false: "",
            },
        },
        defaultVariants: {
            variant: "default",
            inputSize: "default",
            error: false,
        },
    }
)

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, variant, inputSize, error, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(inputVariants({ variant, inputSize, error }), className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input, inputVariants }
