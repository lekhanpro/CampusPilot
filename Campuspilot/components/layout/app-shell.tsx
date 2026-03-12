"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpenText,
  CalendarDays,
  Clock3,
  GraduationCap,
  Home,
  ListTodo,
  NotebookPen,
  Settings,
  Sparkles,
  Table2,
  UserCircle2
} from "lucide-react";
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

const mobileNavItems = navItems.filter((item) => ["/dashboard", "/timetable", "/assignments", "/analytics", "/settings"].includes(item.href));

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isGuest, user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="mx-auto grid min-h-screen max-w-[1280px] md:grid-cols-[250px_1fr]">
        <aside className="hidden border-r border-border/80 bg-muted/35 md:block">
          <div className="sticky top-0 h-screen overflow-y-auto p-5">
            <Link href="/dashboard" className="mb-6 flex items-center gap-3 rounded-lg px-2 py-1.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-sm font-semibold">CP</div>
              <div>
                <p className="text-sm font-semibold tracking-tight">{APP_NAME}</p>
                <p className="text-xs text-muted-foreground">Student workspace</p>
              </div>
            </Link>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 border-b border-border/70 bg-background/92 px-4 py-3 backdrop-blur md:px-8">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">{isGuest ? "Guest Mode" : "Cloud Sync"}</p>
                <p className="truncate text-sm text-foreground/90">{user?.email ?? "Offline workspace"}</p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <SyncIndicator />
                <ThemeToggle />
                {!isGuest ? (
                  <Button variant="outline" size="sm" onClick={() => void signOut()} className="gap-2">
                    <UserCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign out</span>
                  </Button>
                ) : (
                  <Link href="/auth/login">
                    <Button size="sm">Sign in</Button>
                  </Link>
                )}
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium",
                  active ? "bg-muted text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
