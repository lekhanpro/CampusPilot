import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary",
          className
        )}
        {...props}
      />
    );
  }
);

Select.displayName = "Select";
