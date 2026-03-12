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
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md border text-sm font-medium leading-none transition-[background-color,color,border-color,box-shadow,transform] duration-150",
        "touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "border-primary/90 bg-primary/94 text-primary-foreground shadow-soft hover:bg-primary",
        variant === "secondary" && "border-border/70 bg-secondary/72 text-secondary-foreground hover:bg-secondary/90",
        variant === "ghost" && "border-transparent bg-transparent text-foreground hover:bg-muted/70",
        variant === "outline" && "border-border/75 bg-card/68 text-card-foreground hover:bg-card/84",
        variant === "destructive" && "border-destructive/90 bg-destructive/94 text-destructive-foreground hover:bg-destructive",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-9 px-4",
        size === "lg" && "h-10 px-5 text-sm",
        className
      )}
      {...props}
    />
  );
}
