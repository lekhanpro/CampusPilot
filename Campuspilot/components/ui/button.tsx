import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md border text-sm font-medium leading-none text-foreground transition-[background-color,color,border-color,box-shadow,transform] duration-150",
        "touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "border-primary/90 bg-primary text-primary-foreground shadow-soft hover:bg-primary/92",
        variant === "secondary" && "border-border bg-secondary text-secondary-foreground hover:bg-secondary/88",
        variant === "ghost" && "border-transparent bg-transparent text-foreground hover:bg-muted/68",
        variant === "outline" && "border-border bg-card text-foreground hover:bg-muted/72",
        variant === "destructive" && "border-destructive/90 bg-destructive text-destructive-foreground hover:bg-destructive/92",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-9 px-4",
        size === "lg" && "h-10 px-5 text-sm",
        className
      )}
      {...props}
    />
  );
}
