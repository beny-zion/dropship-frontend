import * as React from "react"
import { cn } from "@/lib/utils/utils"

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-xs font-light tracking-wide text-neutral-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block",
      className
    )}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }