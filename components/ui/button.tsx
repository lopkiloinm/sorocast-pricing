import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-md hover:from-yellow-400 hover:to-amber-500 hover:shadow-lg hover:shadow-yellow-500/30 focus-visible:shadow-yellow-500/30",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md hover:from-red-500 hover:to-rose-600 hover:shadow-lg hover:shadow-red-500/30 focus-visible:shadow-red-500/30",
        outline:
          "border border-zinc-700 bg-transparent text-zinc-300 hover:bg-yellow-500/10 hover:border-yellow-500/70 hover:text-yellow-300 hover:shadow-[0_0_12px_0px_theme(colors.yellow.500/0.25)] focus-visible:shadow-[0_0_12px_0px_theme(colors.yellow.500/0.25)]",
        secondary:
          "bg-gradient-to-r from-zinc-800 to-zinc-700 text-zinc-200 shadow-sm hover:from-zinc-700 hover:to-zinc-600 hover:shadow-md hover:shadow-zinc-500/20 focus-visible:shadow-zinc-500/20",
        ghost:
          "text-zinc-300 hover:bg-yellow-500/10 hover:text-yellow-300 hover:shadow-[0_0_10px_0px_theme(colors.yellow.500/0.2)] focus-visible:shadow-[0_0_10px_0px_theme(colors.yellow.500/0.2)]",
        link: "text-yellow-400 underline-offset-4 hover:text-yellow-300 hover:underline hover:decoration-yellow-300/70",
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
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
