import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "default"
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "success" | "warning" | "danger" | "secondary";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        tone === "default" && "border-primary/20 bg-primary/10 text-primary",
        tone === "success" && "border-success/25 bg-success/15 text-success",
        tone === "warning" && "border-warning/25 bg-warning/20 text-yellow-900 dark:text-yellow-100",
        tone === "danger" && "border-destructive/25 bg-destructive/15 text-destructive",
        tone === "secondary" && "border-border bg-muted text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}
