import * as React from "react"
import { cn } from "@/lib/utils/utils"

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  const handleChange = (e) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <input
      type="checkbox"
      ref={ref}
      checked={checked}
      onChange={handleChange}
      className={cn(
        "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        className
      )}
      {...props}
    />
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };
