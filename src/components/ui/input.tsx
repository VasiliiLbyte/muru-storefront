import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-sm border border-input bg-background px-2 py-1 text-body text-foreground transition-[color,border-color,box-shadow] outline-none",
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/30",
        "disabled:cursor-not-allowed disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
}

export { Input }
