import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 ease-in-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[#006A4E] focus-visible:ring-[2px] focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[#0B3D2E] text-white hover:bg-[#006A4E] hover:shadow-lg hover:shadow-[#006A4E]/30 hover:-translate-y-0.5 active:scale-[0.98] active:bg-[#073225]",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-500/40",
        outline:
          "border-2 border-[#0B3D2E] bg-transparent text-[#0B3D2E] hover:bg-[#006A4E] hover:text-white hover:border-[#006A4E] hover:shadow-lg hover:shadow-[#006A4E]/30 hover:-translate-y-0.5 active:scale-[0.98] active:bg-[#073225]",
        secondary:
          "bg-[#0B3D2E] text-white hover:bg-[#006A4E] focus-visible:ring-[#006A4E]/30",
        ghost:
          "bg-transparent text-[#0B3D2E] hover:bg-[#006A4E] hover:text-white",
        link: "text-[#0B3D2E] underline-offset-4 hover:text-[#006A4E] hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2 has-[>svg]:px-4",
        sm: "h-8 rounded-full px-4 has-[>svg]:px-3 text-xs",
        lg: "h-12 rounded-full px-8 has-[>svg]:px-6 text-base",
        icon: "size-10 rounded-full",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"
  
  // Filter out fdprocessedid to prevent hydration mismatches
  const filteredProps = { ...props };
  if ('fdprocessedid' in filteredProps) {
    delete filteredProps.fdprocessedid;
  }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...filteredProps}
    />
  )
}

export { Button, buttonVariants }
