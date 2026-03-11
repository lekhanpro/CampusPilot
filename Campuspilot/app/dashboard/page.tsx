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
  const upcomingAssignments = getUpcomingAssignments(assignments).slice(0, 4);
  const attendanceSummary = subjects.slice(0, 4).map((subject) => ({ subject, metrics: getAttendanceMetrics(subject, attendanceRecords) }));
  const upcomingExams = exams.filter((exam) => !exam.deleted_at).sort((a, b) => a.exam_date.localeCompare(b.exam_date)).slice(0, 3);
  const weeklyProgress = getWeeklyProductivity(assignments, pomodoroSessions);
  const todayFocus = pomodoroSessions
    .filter((session) => session.started_at.startsWith(new Date().toISOString().slice(0, 10)))
    .reduce((sum, session) => sum + session.duration_minutes, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="The next thing to attend, submit, revise, and focus on."
          actions={
            <>
              <Link href="/ai-planner"><Button className="gap-2"><BrainCircuit className="h-4 w-4" />AI planner</Button></Link>
              <Link href="/pomodoro"><Button variant="outline" className="gap-2"><Clock3 className="h-4 w-4" />Start focus</Button></Link>
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Today’s classes", value: todaySessions.length, helper: todaySessions[0] ? `${todaySessions[0].start_time} next` : "Nothing scheduled" },
            { label: "Tasks due soon", value: upcomingAssignments.length, helper: upcomingAssignments[0]?.title ?? "All clear" },
            { label: "Focus minutes", value: todayFocus, helper: "Completed today" },
            { label: "Upcoming exams", value: upcomingExams.length, helper: upcomingExams[0] ? formatExamCountdown(upcomingExams[0].exam_date) : "No exams added" }
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="space-y-2 p-5">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="font-display text-4xl font-semibold">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.helper}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Today agenda</CardTitle>
                <CardDescription>Classes and near-term commitments.</CardDescription>
              </div>
              <Link href="/calendar"><Button variant="ghost" size="sm">View calendar</Button></Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaySessions.length === 0 ? (
                <EmptyState title="No classes today" description="Add timetable sessions to see your agenda here." actionLabel="Open timetable" onAction={() => { window.location.href = "/timetable"; }} />
              ) : (
                todaySessions.map((session) => {
                  const subject = subjects.find((item) => item.id === session.subject_id);
                  return (
                    <div key={session.id} className="flex items-center justify-between rounded-2xl border border-border/70 p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: subject?.color ?? "#2563eb" }} />
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
                <CardDescription>Prioritized by due date.</CardDescription>
              </div>
              <Link href="/assignments"><Button variant="ghost" size="sm">Manage</Button></Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingAssignments.length === 0 ? (
                <EmptyState title="Nothing due right now" description="Assignments you add will appear here with due dates and priority." />
              ) : (
                upcomingAssignments.map((assignment) => {
                  const subject = subjects.find((item) => item.id === assignment.subject_id);
                  return (
                    <div key={assignment.id} className="rounded-2xl border border-border/70 p-4">
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

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Attendance snapshot</CardTitle>
                <CardDescription>Threshold visibility by subject.</CardDescription>
              </div>
              <Link href="/attendance"><Button variant="ghost" size="sm">Details</Button></Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {attendanceSummary.length === 0 ? (
                <EmptyState title="No attendance yet" description="Create subjects and mark attendance to track risk early." />
              ) : (
                attendanceSummary.map(({ subject, metrics }) => (
                  <div key={subject.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.color }} />
                        <span>{subject.name}</span>
                      </div>
                      <span className={metrics.warning ? "text-destructive" : "text-muted-foreground"}>{metrics.percentage}%</span>
                    </div>
                    <Progress value={metrics.percentage} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Exam countdowns</CardTitle>
                <CardDescription>Keep revision windows visible.</CardDescription>
              </div>
              <Link href="/exams"><Button variant="ghost" size="sm">Open exams</Button></Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingExams.length === 0 ? (
                <EmptyState title="No exams scheduled" description="Add exam dates and syllabus coverage to plan ahead." />
              ) : (
                upcomingExams.map((exam) => (
                  <div key={exam.id} className="rounded-2xl border border-border/70 p-4">
                    <p className="font-medium">{exam.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{exam.exam_date}</p>
                    <p className="mt-3 text-sm font-medium text-primary">{formatExamCountdown(exam.exam_date)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Weekly progress</CardTitle>
                <CardDescription>Completed tasks and focus time.</CardDescription>
              </div>
              <Link href="/analytics"><Button variant="ghost" size="sm">Analytics</Button></Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {weeklyProgress.map((day) => (
                <div key={day.day} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{day.day}</span>
                    <span className="text-muted-foreground">{day.completedTasks} tasks • {day.focusMinutes} min</span>
                  </div>
                  <Progress value={Math.min(100, day.focusMinutes)} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            { href: "/timetable", label: "Plan timetable", icon: CalendarClock, copy: "Weekly sessions and today agenda" },
            { href: "/assignments", label: "Capture tasks", icon: CheckCircle2, copy: "Deadlines, priorities, and status" },
            { href: "/notes", label: "Open notes", icon: NotebookPen, copy: "Markdown-friendly subject notes" },
            { href: "/attendance", label: "Check attendance", icon: GraduationCap, copy: "Threshold warnings and required classes" }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href as "/timetable" | "/assignments" | "/notes" | "/attendance"}>
                <Card className="h-full transition hover:-translate-y-1">
                  <CardContent className="space-y-3 p-5">
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.copy}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">Open <ArrowRight className="h-4 w-4" /></span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
