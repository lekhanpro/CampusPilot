"use client";

import Link from "next/link";
import { ArrowRight, BrainCircuit, CalendarClock, CheckCircle2, Clock3, GraduationCap, NotebookPen } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { useAppSnapshot } from "@/hooks/use-app-data";
import { getAttendanceMetrics } from "@/lib/attendance";
import { getWeeklyProductivity } from "@/lib/analytics";
import { formatExamCountdown, getTodaySessions, getUpcomingAssignments } from "@/lib/schedule";

export default function DashboardPage() {
  const { subjects, classSessions, assignments, attendanceRecords, exams, pomodoroSessions } = useAppSnapshot();
  const todaySessions = getTodaySessions(classSessions);
  const upcomingAssignments = getUpcomingAssignments(assignments).slice(0, 5);
  const attendanceSummary = subjects.slice(0, 4).map((subject) => ({ subject, metrics: getAttendanceMetrics(subject, attendanceRecords) }));
  const upcomingExams = exams.filter((exam) => !exam.deleted_at).sort((a, b) => a.exam_date.localeCompare(b.exam_date)).slice(0, 4);
  const weeklyProgress = getWeeklyProductivity(assignments, pomodoroSessions);
  const todayFocus = pomodoroSessions
    .filter((session) => session.started_at.startsWith(new Date().toISOString().slice(0, 10)))
    .reduce((sum, session) => sum + session.duration_minutes, 0);

  const todayLabel = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());

  const summaryCards = [
    {
      label: "Today classes",
      value: String(todaySessions.length),
      helper: todaySessions[0] ? `${todaySessions[0].start_time} next` : "No class blocks",
      icon: CalendarClock
    },
    {
      label: "Due soon",
      value: String(upcomingAssignments.length),
      helper: upcomingAssignments[0]?.title ?? "Nothing urgent",
      icon: CheckCircle2
    },
    {
      label: "Focus minutes",
      value: String(todayFocus),
      helper: "Logged today",
      icon: Clock3
    },
    {
      label: "Upcoming exams",
      value: String(upcomingExams.length),
      helper: upcomingExams[0] ? formatExamCountdown(upcomingExams[0].exam_date) : "No exams yet",
      icon: GraduationCap
    }
  ] as const;

  const quickLaunch = [
    { href: "/timetable", label: "Plan timetable", icon: CalendarClock, copy: "Weekly sessions and agenda" },
    { href: "/assignments", label: "Capture tasks", icon: CheckCircle2, copy: "Deadlines and priorities" },
    { href: "/notes", label: "Open notes", icon: NotebookPen, copy: "Subject knowledge base" },
    { href: "/attendance", label: "Attendance", icon: GraduationCap, copy: "Threshold warnings" }
  ] as const;

  return (
    <AppShell>
      <div className="space-y-4">
        <PageHeader
          title="Dashboard"
          description="Your study cockpit for classes, deadlines, focus, and academic risk signals."
          actions={
            <>
              <Link href="/ai-planner"><Button className="gap-2"><BrainCircuit className="h-4 w-4" />AI planner</Button></Link>
              <Link href="/pomodoro"><Button variant="outline" className="gap-2"><Clock3 className="h-4 w-4" />Start focus</Button></Link>
            </>
          }
        />

        <Card>
          <CardContent className="space-y-4 p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">{todayLabel}</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Welcome back. Keep today structured.</h2>
                <p className="mt-1 text-sm text-muted-foreground">Review your agenda, clear urgent tasks, and protect focus blocks.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/calendar"><Button variant="secondary">Open calendar</Button></Link>
                <Link href="/assignments"><Button variant="outline">Review tasks</Button></Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="glass-subtle rounded-xl p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">{item.label}</p>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="mt-2 text-3xl font-semibold tracking-tight">{item.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Today agenda</CardTitle>
                  <CardDescription>Classes and near-term commitments in timeline order.</CardDescription>
                </div>
                <Link href="/calendar"><Button variant="ghost" size="sm">View calendar</Button></Link>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {todaySessions.length === 0 ? (
                  <EmptyState title="No classes today" description="Add timetable sessions to fill your academic timeline." actionLabel="Open timetable" onAction={() => { window.location.href = "/timetable"; }} />
                ) : (
                  todaySessions.map((session) => {
                    const subject = subjects.find((item) => item.id === session.subject_id);
                    return (
                      <div key={session.id} className="glass-subtle flex items-center justify-between gap-3 rounded-xl p-3.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: subject?.color ?? "#4f46e5" }} />
                            <p className="font-medium">{subject?.name ?? "Class"}</p>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{session.start_time} - {session.end_time}{session.room ? ` • ${session.room}` : ""}</p>
                        </div>
                        <Badge tone="secondary">{subject?.teacher || "Teacher"}</Badge>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Upcoming assignments</CardTitle>
                  <CardDescription>Sorted by urgency and due date.</CardDescription>
                </div>
                <Link href="/assignments"><Button variant="ghost" size="sm">Manage</Button></Link>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {upcomingAssignments.length === 0 ? (
                  <EmptyState title="Nothing due right now" description="Assignments you add will appear here with clear priority states." />
                ) : (
                  upcomingAssignments.map((assignment) => {
                    const subject = subjects.find((item) => item.id === assignment.subject_id);
                    return (
                      <div key={assignment.id} className="glass-subtle rounded-xl p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{assignment.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{subject?.name ?? "General"} • due {assignment.due_date}</p>
                          </div>
                          <Badge tone={assignment.priority === "high" ? "danger" : assignment.priority === "medium" ? "warning" : "secondary"}>
                            {assignment.priority}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Attendance and focus</CardTitle>
                  <CardDescription>Threshold risk and effort spent this week.</CardDescription>
                </div>
                <Link href="/attendance"><Button variant="ghost" size="sm">Details</Button></Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {attendanceSummary.length === 0 ? (
                  <EmptyState title="No attendance yet" description="Create subjects and mark attendance to start risk tracking." />
                ) : (
                  attendanceSummary.map(({ subject, metrics }) => (
                    <div key={subject.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
                          <span>{subject.name}</span>
                        </div>
                        <span className={metrics.warning ? "text-destructive" : "text-muted-foreground"}>{metrics.percentage}%</span>
                      </div>
                      <Progress value={metrics.percentage} />
                    </div>
                  ))
                )}

                <div className="glass-subtle rounded-xl p-3.5">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Weekly focus</p>
                  <div className="mt-2 space-y-2">
                    {weeklyProgress.map((day) => (
                      <div key={day.day} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{day.day}</span>
                          <span>{day.completedTasks} tasks • {day.focusMinutes} min</span>
                        </div>
                        <Progress value={Math.min(100, day.focusMinutes)} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Exam countdowns</CardTitle>
                  <CardDescription>Keep revision windows in sight.</CardDescription>
                </div>
                <Link href="/exams"><Button variant="ghost" size="sm">Open exams</Button></Link>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {upcomingExams.length === 0 ? (
                  <EmptyState title="No exams scheduled" description="Add exam dates and prep status to keep revision structured." />
                ) : (
                  upcomingExams.map((exam) => (
                    <div key={exam.id} className="glass-subtle rounded-xl p-3.5">
                      <p className="font-medium">{exam.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{exam.exam_date}</p>
                      <p className="mt-2 text-sm font-medium text-primary">{formatExamCountdown(exam.exam_date)}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Quick launch</CardTitle>
                  <CardDescription>Jump to your most-used workflow panels.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2">
                {quickLaunch.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} className="glass-subtle group rounded-xl p-3.5 transition hover:-translate-y-0.5">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Icon className="h-4 w-4 text-primary" />
                        {item.label}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{item.copy}</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">Open <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
