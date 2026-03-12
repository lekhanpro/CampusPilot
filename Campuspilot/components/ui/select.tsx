import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-10 w-full rounded-md border border-input/80 bg-card/55 px-3 text-sm outline-none transition backdrop-blur-sm focus:border-ring focus:ring-2 focus:ring-ring/25",
          className
        )}
        {...props}
      />
    );
  }
);

Select.displayName = "Select";
