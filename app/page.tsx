import Link from "next/link";
import { ArrowRight, BarChart3, BrainCircuit, CalendarDays, Clock3, Download, NotebookPen, ShieldCheck } from "lucide-react";
import { APP_DESCRIPTION, APP_NAME, GITHUB_DESCRIPTION } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { title: "Timetable and calendar", description: "Weekly schedule, daily agenda, exams, and academic dates in one place.", icon: CalendarDays },
  { title: "Assignments and notes", description: "Subject-aware tasks, note search, and offline persistence backed by IndexedDB.", icon: NotebookPen },
  { title: "Pomodoro and analytics", description: "Focus sessions, weekly progress, attendance risk, and workload visibility.", icon: BarChart3 },
  { title: "Groq AI study planner", description: "Structured study plans, daily plans, prioritization, and recovery workflows.", icon: BrainCircuit }
];

export default function HomePage() {
  return (
    <main className="hero-grid min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-7 md:px-8 md:py-10">
        <header className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <div>
            <p className="text-lg font-semibold tracking-tight">{APP_NAME}</p>
            <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">{GITHUB_DESCRIPTION}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/login"><Button variant="ghost">Sign in</Button></Link>
            <Link href="/dashboard"><Button>Open app</Button></Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 md:grid-cols-[1.1fr_0.9fr] md:py-14">
          <div className="space-y-5">
            <span className="inline-flex rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Built for real semester pressure
            </span>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
                Plan classes, deadlines, attendance, and study blocks in one calm workspace.
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground">{APP_DESCRIPTION}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Launch workspace
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline">Explore features</Button>
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="bg-card">
                <CardContent className="space-y-2 p-4">
                  <Download className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Installable PWA</p>
                  <p className="text-xs text-muted-foreground">Works offline after first load.</p>
                </CardContent>
              </Card>
              <Card className="bg-card">
                <CardContent className="space-y-2 p-4">
                  <Clock3 className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Focus-aware planner</p>
                  <p className="text-xs text-muted-foreground">Pomodoro sessions tied to subjects and tasks.</p>
                </CardContent>
              </Card>
              <Card className="bg-card">
                <CardContent className="space-y-2 p-4">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Private by design</p>
                  <p className="text-xs text-muted-foreground">Guest mode first, Firebase sync when you opt in.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-card">
            <CardContent className="space-y-4 p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Today</p>
                  <p className="mt-1 text-xl font-semibold">Semester snapshot</p>
                </div>
                <span className="rounded-md border border-success/30 bg-success/15 px-2 py-1 text-xs font-medium text-success">Synced</span>
              </div>
              <div className="grid gap-2">
                {[
                  ["Classes", "3 scheduled"],
                  ["Assignments", "2 due soon"],
                  ["Attendance", "81% on track"],
                  ["Focus", "120 min today"]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-border bg-background px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-md border border-border bg-muted/35 px-3 py-3">
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">AI planner sample</p>
                <p className="mt-2 text-sm">6:00 PM - 7:30 PM: Revise Operating Systems and finish DBMS assignment draft.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="features" className="grid gap-3 pb-8 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/40 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-sm font-semibold">{feature.title}</h2>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </main>
  );
}
