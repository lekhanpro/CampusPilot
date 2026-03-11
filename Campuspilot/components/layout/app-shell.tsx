"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpenText, CalendarDays, Clock3, GraduationCap, Home, ListTodo, NotebookPen, Settings, Sparkles, Table2, UserCircle2 } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SyncIndicator } from "@/components/layout/sync-indicator";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/timetable", label: "Timetable", icon: Table2 },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/assignments", label: "Assignments", icon: ListTodo },
  { href: "/attendance", label: "Attendance", icon: GraduationCap },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/pomodoro", label: "Pomodoro", icon: Clock3 },
  { href: "/exams", label: "Exams", icon: BookOpenText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ai-planner", label: "AI Planner", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings }
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isGuest, user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-transparent pb-24 md:pb-0">
      <div className="mx-auto grid min-h-screen max-w-7xl md:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-border/80 bg-card/70 p-6 backdrop-blur md:block">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-xl font-semibold text-primary-foreground">C</div>
            <div>
              <p className="font-display text-xl font-semibold">{APP_NAME}</p>
              <p className="text-sm text-muted-foreground">Student productivity OS</p>
            </div>
          </Link>
          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 px-4 py-4 backdrop-blur md:px-8">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{isGuest ? "Guest mode" : "Sync account"}</p>
                <p className="font-medium">{user?.email ?? "Offline workspace"}</p>
              </div>
              <div className="flex items-center gap-2">
                <SyncIndicator />
                <ThemeToggle />
                {!isGuest ? (
                  <Button variant="outline" size="sm" onClick={() => void signOut()} className="gap-2">
                    <UserCircle2 className="h-4 w-4" />
                    Sign out
                  </Button>
                ) : (
                  <Link href="/auth/login">
                    <Button size="sm">Sign in</Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="mt-4 -mx-1 overflow-x-auto pb-1 md:hidden">
              <div className="flex gap-2 px-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
                        active ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </header>
          <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}