import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-28 w-full rounded-md border border-input/80 bg-card/55 px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground backdrop-blur-sm focus:border-ring focus:ring-2 focus:ring-ring/25",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
