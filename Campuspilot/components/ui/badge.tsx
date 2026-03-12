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
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium backdrop-blur-md",
        tone === "default" && "border-primary/25 bg-primary/14 text-primary",
        tone === "success" && "border-success/28 bg-success/18 text-success",
        tone === "warning" && "border-warning/30 bg-warning/20 text-yellow-900 dark:text-yellow-100",
        tone === "danger" && "border-destructive/28 bg-destructive/16 text-destructive",
        tone === "secondary" && "border-border/70 bg-card/60 text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}
