import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-[2px] active:shadow-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_3px_0_0_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.12)] hover:bg-primary/90 hover:shadow-[0_4px_0_0_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.12)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_3px_0_0_rgba(0,0,0,0.25),inset_0_1px_0_0_rgba(255,255,255,0.15)] hover:bg-destructive/90 hover:shadow-[0_4px_0_0_rgba(0,0,0,0.25),inset_0_1px_0_0_rgba(255,255,255,0.15)]",
        outline:
          "border-2 border-input bg-background shadow-[0_3px_0_0_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.5)] hover:bg-accent hover:text-accent-foreground hover:shadow-[0_4px_0_0_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.5)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_3px_0_0_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.8)] hover:bg-secondary/80 hover:shadow-[0_4px_0_0_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.8)]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground shadow-none active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline shadow-none active:translate-y-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
