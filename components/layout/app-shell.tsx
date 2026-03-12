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
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="mx-auto grid min-h-screen max-w-[1320px] gap-4 px-3 py-3 md:grid-cols-[270px_1fr] md:px-4 md:py-4">
        <aside className="glass-card hidden md:block">
          <div className="sticky top-4 h-[calc(100vh-2.25rem)] overflow-y-auto p-4">
            <Link href="/dashboard" className="mb-5 flex items-center gap-3 rounded-xl px-2 py-2">
              <div className="glass-subtle flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold">CP</div>
              <div>
                <p className="text-sm font-semibold tracking-tight">{APP_NAME}</p>
                <p className="text-xs text-muted-foreground">Notion-style study cockpit</p>
              </div>
            </Link>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      active
                        ? "glass-subtle text-foreground shadow-soft"
                        : "text-muted-foreground hover:glass-subtle hover:text-foreground"
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

        <main className="flex min-h-screen flex-col gap-3">
          <header className="glass-card sticky top-3 z-30 px-4 py-3 md:px-6">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{isGuest ? "Guest Workspace" : "Cloud Workspace"}</p>
                <p className="truncate text-sm text-foreground/92">{user?.email ?? "Offline workspace"}</p>
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

          <div className="mx-auto w-full max-w-6xl flex-1 px-1 pb-3 md:px-0">{children}</div>
        </main>
      </div>

      <nav className="glass-card fixed inset-x-3 bottom-3 z-40 px-2 py-2 md:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors",
                  active ? "glass-subtle text-foreground" : "text-muted-foreground"
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
