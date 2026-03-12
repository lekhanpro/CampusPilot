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
        "inline-flex items-center justify-center rounded-md border text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "border-primary/90 bg-primary/92 text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:bg-primary",
        variant === "secondary" && "border-border/70 bg-secondary/65 text-secondary-foreground backdrop-blur-md hover:bg-secondary/85",
        variant === "ghost" && "border-transparent bg-transparent text-foreground hover:bg-muted/70",
        variant === "outline" && "border-border/75 bg-card/58 text-card-foreground backdrop-blur-md hover:bg-card/78",
        variant === "destructive" && "border-destructive/90 bg-destructive/92 text-destructive-foreground hover:-translate-y-0.5 hover:bg-destructive",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-9 px-4",
        size === "lg" && "h-10 px-5 text-sm",
        className
      )}
      {...props}
    />
  );
}
