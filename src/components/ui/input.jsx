import * as React from "react"
import { cn } from "@/lib/utils/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full border border-neutral-300 bg-white px-3 py-2 text-sm font-light placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }