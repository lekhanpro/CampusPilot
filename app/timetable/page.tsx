"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useClassSessions, useSubjects } from "@/hooks/use-app-data";
import { SUBJECT_COLORS } from "@/lib/constants";
import { createId } from "@/lib/id";
import { formatTimeLabel, nowIso } from "@/lib/time";
import { getTodaySessions, weekDayLabels } from "@/lib/schedule";
import { removeEntity, upsertEntity } from "@/services/local-store";

const emptySubject = { name: "", teacher: "", color: SUBJECT_COLORS[0], attendance_target: 75 };
const emptySession = { subject_id: "", day_of_week: 1, start_time: "09:00", end_time: "10:00", room: "" };

export default function TimetablePage() {
  const { localUserId } = useAuth();
  const subjects = useSubjects();
  const sessions = useClassSessions();
  const [subjectForm, setSubjectForm] = useState(emptySubject);
  const [sessionForm, setSessionForm] = useState(emptySession);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  const sessionsByDay = useMemo(
    () => weekDayLabels.map((label, index) => ({
      label,
      index,
      sessions: sessions.filter((session) => session.day_of_week === index).sort((a, b) => a.start_time.localeCompare(b.start_time))
    })),
    [sessions]
  );

  const saveSubject = async (event: React.FormEvent) => {
    event.preventDefault();
    const now = nowIso();
    await upsertEntity("subjects", {
      id: editingSubjectId ?? createId("subject"),
      user_id: localUserId,
      created_at: now,
      updated_at: now,
      deleted_at: null,
      ...subjectForm
    });
    setEditingSubjectId(null);
    setSubjectForm(emptySubject);
  };

  const saveSession = async (event: React.FormEvent) => {
    event.preventDefault();
    const now = nowIso();
    await upsertEntity("classSessions", {
      id: editingSessionId ?? createId("session"),
      user_id: localUserId,
      created_at: now,
      updated_at: now,
      deleted_at: null,
      ...sessionForm
    });
    setEditingSessionId(null);
    setSessionForm(emptySession);
  };

  const todayAgenda = getTodaySessions(sessions);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader title="Timetable" description="Build a weekly schedule and keep today’s agenda visible." />

        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>{editingSubjectId ? "Edit subject" : "Add subject"}</CardTitle>
                  <CardDescription>Subjects power timetable, assignments, attendance, notes, and exams.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4" onSubmit={saveSubject}>
                  <Field label="Subject name"><Input value={subjectForm.name} onChange={(event) => setSubjectForm((current) => ({ ...current, name: event.target.value }))} required /></Field>
                  <Field label="Teacher"><Input value={subjectForm.teacher} onChange={(event) => setSubjectForm((current) => ({ ...current, teacher: event.target.value }))} /></Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Color">
                      <div className="flex flex-wrap gap-2">
                        {SUBJECT_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`h-9 w-9 rounded-full border-2 ${subjectForm.color === color ? "border-foreground" : "border-transparent"}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setSubjectForm((current) => ({ ...current, color }))}
                          />
                        ))}
                      </div>
                    </Field>
                    <Field label="Attendance target %"><Input type="number" min={50} max={100} value={subjectForm.attendance_target} onChange={(event) => setSubjectForm((current) => ({ ...current, attendance_target: Number(event.target.value) }))} /></Field>
                  </div>
                  <Button type="submit">{editingSubjectId ? "Update subject" : "Save subject"}</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>{editingSessionId ? "Edit class session" : "Add class session"}</CardTitle>
                  <CardDescription>Create the recurring weekly sessions used across the app.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4" onSubmit={saveSession}>
                  <Field label="Subject">
                    <Select value={sessionForm.subject_id} onChange={(event) => setSessionForm((current) => ({ ...current, subject_id: event.target.value }))} required>
                      <option value="">Select subject</option>
                      {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                    </Select>
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Day">
                      <Select value={String(sessionForm.day_of_week)} onChange={(event) => setSessionForm((current) => ({ ...current, day_of_week: Number(event.target.value) }))}>
                        {weekDayLabels.map((label, index) => <option key={label} value={index}>{label}</option>)}
                      </Select>
                    </Field>
                    <Field label="Room"><Input value={sessionForm.room} onChange={(event) => setSessionForm((current) => ({ ...current, room: event.target.value }))} /></Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Start time"><Input type="time" value={sessionForm.start_time} onChange={(event) => setSessionForm((current) => ({ ...current, start_time: event.target.value }))} /></Field>
                    <Field label="End time"><Input type="time" value={sessionForm.end_time} onChange={(event) => setSessionForm((current) => ({ ...current, end_time: event.target.value }))} /></Field>
                  </div>
                  <Button type="submit" disabled={!sessionForm.subject_id}>{editingSessionId ? "Update session" : "Save session"}</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Today agenda</CardTitle>
                  <CardDescription>Your live view of classes scheduled for today.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayAgenda.length === 0 ? (
                  <EmptyState title="No classes today" description="Once you add sessions, today’s agenda will stay pinned here." />
                ) : (
                  todayAgenda.map((session) => {
                    const subject = subjects.find((item) => item.id === session.subject_id);
                    return (
                      <div key={session.id} className="rounded-2xl border border-border/70 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: subject?.color ?? "#2563eb" }} />
                              <p className="font-medium">{subject?.name ?? "Class"}</p>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{formatTimeLabel(session.start_time)} - {formatTimeLabel(session.end_time)} {session.room ? `• ${session.room}` : ""}</p>
                          </div>
                          <Badge tone="secondary">{subject?.teacher || "Teacher"}</Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Weekly grid</CardTitle>
                  <CardDescription>Mobile-friendly day-wise schedule.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessions.length === 0 ? (
                  <EmptyState title="No timetable yet" description="Create a subject and at least one class session to build your weekly grid." />
                ) : (
                  sessionsByDay.map((day) => (
                    <div key={day.label} className="space-y-3 rounded-2xl border border-border/70 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{day.label}</h3>
                        <Badge tone="secondary">{day.sessions.length} sessions</Badge>
                      </div>
                      {day.sessions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No sessions.</p>
                      ) : (
                        day.sessions.map((session) => {
                          const subject = subjects.find((item) => item.id === session.subject_id);
                          return (
                            <div key={session.id} className="flex items-center justify-between gap-4 rounded-xl bg-muted/50 p-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: subject?.color ?? "#2563eb" }} />
                                  <p className="font-medium">{subject?.name ?? "Class"}</p>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">{formatTimeLabel(session.start_time)} - {formatTimeLabel(session.end_time)} {session.room ? `• ${session.room}` : ""}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingSessionId(session.id);
                                    setSessionForm({
                                      subject_id: session.subject_id,
                                      day_of_week: session.day_of_week,
                                      start_time: session.start_time,
                                      end_time: session.end_time,
                                      room: session.room
                                    });
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => void removeEntity("classSessions", session.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Subjects</CardTitle>
                  <CardDescription>Edit color, teacher, and attendance targets.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {subjects.length === 0 ? (
                  <EmptyState title="No subjects" description="Subjects are the backbone of the rest of the planner." />
                ) : (
                  subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center justify-between rounded-2xl border border-border/70 p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.color }} />
                          <p className="font-medium">{subject.name}</p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{subject.teacher || "No teacher set"} • target {subject.attendance_target}%</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSubjectId(subject.id);
                            setSubjectForm({
                              name: subject.name,
                              teacher: subject.teacher,
                              color: subject.color,
                              attendance_target: subject.attendance_target
                            });
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => void removeEntity("subjects", subject.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
