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
        "inline-flex items-center justify-center rounded-md border text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "border-primary bg-primary text-primary-foreground hover:opacity-90",
        variant === "secondary" && "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/85",
        variant === "ghost" && "border-transparent bg-transparent text-foreground hover:bg-muted",
        variant === "outline" && "border-border bg-card text-card-foreground hover:bg-muted/70",
        variant === "destructive" && "border-destructive bg-destructive text-destructive-foreground hover:opacity-90",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-9 px-4",
        size === "lg" && "h-10 px-5 text-sm",
        className
      )}
      {...props}
    />
  );
}
