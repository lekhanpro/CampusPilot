import Link from "next/link";
import { ArrowRight, BarChart3, BrainCircuit, CalendarDays, Clock3, Download, NotebookPen, ShieldCheck } from "lucide-react";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
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
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 md:px-8 md:py-12">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-2xl font-semibold">{APP_NAME}</p>
            <p className="text-sm text-muted-foreground">Offline-first student super app</p>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/login"><Button variant="ghost">Sign in</Button></Link>
            <Link href="/dashboard"><Button>Open app</Button></Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-20">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
              Built for real semester pressure
            </span>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-display text-5xl font-semibold leading-tight md:text-6xl">
                Navigate classes, deadlines, attendance, and study time without app hopping.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">{APP_DESCRIPTION}</p>
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
              <Card className="bg-card/80">
                <CardContent className="space-y-2 p-5">
                  <Download className="h-5 w-5 text-primary" />
                  <p className="font-medium">Installable PWA</p>
                  <p className="text-sm text-muted-foreground">Works offline after first load.</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80">
                <CardContent className="space-y-2 p-5">
                  <Clock3 className="h-5 w-5 text-primary" />
                  <p className="font-medium">Focus-aware planner</p>
                  <p className="text-sm text-muted-foreground">Pomodoro sessions tied to subjects and tasks.</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80">
                <CardContent className="space-y-2 p-5">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <p className="font-medium">Private by design</p>
                  <p className="text-sm text-muted-foreground">Guest mode first, Firebase sync when you opt in.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="overflow-hidden border-none bg-slate-950 text-white">
            <CardContent className="space-y-5 p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Today</p>
                  <p className="font-display text-3xl">Your semester cockpit</p>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">Synced</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Classes", "3 scheduled"],
                  ["Assignments", "2 due soon"],
                  ["Attendance", "81% on track"],
                  ["Focus", "120 min today"]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className="mt-2 text-lg font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-blue-500/20 via-cyan-500/10 to-emerald-500/20 p-4">
                <p className="text-sm text-slate-300">AI planner sample</p>
                <p className="mt-2 text-lg font-medium">6:00 PM - 7:30 PM: Revise Operating Systems + finish DBMS assignment draft.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="features" className="grid gap-4 pb-12 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-medium">{feature.title}</h2>
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
