import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-0 transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
