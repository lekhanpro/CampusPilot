"use client";

import { useEffect, useMemo, useRef } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { useAssignments, usePomodoroSessions, usePreferences, useSubjects } from "@/hooks/use-app-data";
import { useAuth } from "@/hooks/use-auth";
import { usePomodoroStore } from "@/hooks/use-pomodoro-store";
import { createId } from "@/lib/id";
import { nowIso } from "@/lib/time";
import { upsertEntity } from "@/services/local-store";

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function PomodoroPage() {
  const { localUserId } = useAuth();
  const preferences = usePreferences();
  const subjects = useSubjects();
  const assignments = useAssignments();
  const sessions = usePomodoroSessions();
  const { mode, durationMinutes, linkedAssignmentId, linkedSubjectId, remainingSeconds, reset, running, startTimer, configureTimer, pause, tick, startedAt } = usePomodoroStore();
  const completedStamp = useRef<string | null>(null);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => tick(), 1000);
    return () => window.clearInterval(interval);
  }, [running, tick]);

  useEffect(() => {
    if (remainingSeconds > 0 || !startedAt || completedStamp.current === startedAt) return;
    completedStamp.current = startedAt;
    void upsertEntity("pomodoroSessions", {
      id: createId("pomodoro"),
      user_id: localUserId,
      subject_id: linkedSubjectId,
      assignment_id: linkedAssignmentId,
      session_type: mode,
      duration_minutes: durationMinutes,
      completed: true,
      started_at: startedAt,
      ended_at: nowIso(),
      created_at: startedAt,
      updated_at: nowIso(),
      deleted_at: null
    }).finally(() => reset());
  }, [durationMinutes, linkedAssignmentId, linkedSubjectId, localUserId, mode, remainingSeconds, reset, startedAt]);

  const todayFocus = useMemo(
    () => sessions.filter((session) => session.started_at.startsWith(new Date().toISOString().slice(0, 10))).reduce((sum, session) => sum + session.duration_minutes, 0),
    [sessions]
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader title="Pomodoro" description="Persistent focus timer with subject or task linking, daily totals, and saved session history." />

        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Focus timer</CardTitle>
                <CardDescription>Timer state is persisted locally, so refresh and reopen are safe.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-[2rem] bg-slate-950 p-8 text-center text-white">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{mode.replace("_", " ")}</p>
                <p className="mt-4 font-display text-7xl font-semibold">{formatSeconds(remainingSeconds)}</p>
                <p className="mt-3 text-sm text-slate-400">{durationMinutes} minute session</p>
                <div className="mt-6 flex justify-center gap-3">
                  {running ? (
                    <Button variant="secondary" size="lg" onClick={pause} className="gap-2"><Pause className="h-4 w-4" />Pause</Button>
                  ) : (
                    <Button size="lg" onClick={() => startTimer({ mode, durationMinutes, linkedAssignmentId, linkedSubjectId })} className="gap-2"><Play className="h-4 w-4" />Start</Button>
                  )}
                  <Button variant="outline" size="lg" onClick={reset} className="gap-2"><RotateCcw className="h-4 w-4" />Reset</Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Button onClick={() => startTimer({ mode: "work", durationMinutes: preferences.pomodoro_work_minutes, linkedAssignmentId, linkedSubjectId })}>Work</Button>
                <Button variant="outline" onClick={() => startTimer({ mode: "short_break", durationMinutes: preferences.pomodoro_short_break_minutes })}>Short break</Button>
                <Button variant="outline" onClick={() => startTimer({ mode: "long_break", durationMinutes: preferences.pomodoro_long_break_minutes })}>Long break</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Link current session</CardTitle>
                  <CardDescription>Attach focus blocks to a subject or assignment for analytics.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="Subject">
                  <Select value={linkedSubjectId ?? ""} onChange={(event) => configureTimer({ linkedSubjectId: event.target.value || null })}>
                    <option value="">No subject</option>
                    {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                  </Select>
                </Field>
                <Field label="Assignment">
                  <Select value={linkedAssignmentId ?? ""} onChange={(event) => configureTimer({ linkedAssignmentId: event.target.value || null })}>
                    <option value="">No assignment</option>
                    {assignments.map((assignment) => <option key={assignment.id} value={assignment.id}>{assignment.title}</option>)}
                  </Select>
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Today’s focus</CardTitle>
                  <CardDescription>Completed focus time recorded from finished sessions.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-display text-5xl font-semibold">{todayFocus}</p>
                    <p className="text-sm text-muted-foreground">minutes completed today</p>
                  </div>
                  <Badge tone="secondary">{sessions.length} total sessions</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Session history</CardTitle>
                  <CardDescription>Recent completed Pomodoro blocks.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {sessions.length === 0 ? (
                  <EmptyState title="No focus history yet" description="Completed focus sessions will appear here automatically." />
                ) : (
                  [...sessions].sort((a, b) => b.started_at.localeCompare(a.started_at)).slice(0, 12).map((session) => {
                    const subject = subjects.find((item) => item.id === session.subject_id);
                    const assignment = assignments.find((item) => item.id === session.assignment_id);
                    return (
                      <div key={session.id} className="rounded-2xl border border-border/70 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">{session.duration_minutes} min {session.session_type.replace("_", " ")}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{new Date(session.started_at).toLocaleString()}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {subject ? <Badge tone="secondary">{subject.name}</Badge> : null}
                            {assignment ? <Badge>{assignment.title}</Badge> : null}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
