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
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "default" && "bg-primary/12 text-primary",
        tone === "success" && "bg-success/15 text-success",
        tone === "warning" && "bg-warning/20 text-yellow-900 dark:text-yellow-100",
        tone === "danger" && "bg-destructive/15 text-destructive",
        tone === "secondary" && "bg-muted text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}