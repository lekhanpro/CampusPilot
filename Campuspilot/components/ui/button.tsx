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
        "inline-flex items-center justify-center rounded-xl font-medium transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-primary text-primary-foreground shadow-soft hover:opacity-95",
        variant === "secondary" && "bg-secondary text-secondary-foreground hover:opacity-90",
        variant === "ghost" && "bg-transparent text-foreground hover:bg-muted",
        variant === "outline" && "border border-border bg-card text-card-foreground hover:bg-muted/70",
        variant === "destructive" && "bg-destructive text-destructive-foreground hover:opacity-90",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-4 text-sm",
        size === "lg" && "h-12 px-5 text-base",
        className
      )}
      {...props}
    />
  );
}
