"use client";

import { useState } from "react";
import { AlertTriangle, PencilLine, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { useAttendanceRecords, usePreferences, useSubjects } from "@/hooks/use-app-data";
import { useAuth } from "@/hooks/use-auth";
import { getAttendanceMetrics } from "@/lib/attendance";
import { createId } from "@/lib/id";
import { getTodayKey, nowIso } from "@/lib/time";
import { removeEntity, upsertEntity } from "@/services/local-store";

export default function AttendancePage() {
  const { localUserId } = useAuth();
  const subjects = useSubjects();
  const records = useAttendanceRecords();
  const preferences = usePreferences();
  const [form, setForm] = useState<{ subject_id: string; date: string; status: "attended" | "missed" | "canceled" }>({ subject_id: "", date: getTodayKey(), status: "attended" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const saveAttendance = async (event: React.FormEvent) => {
    event.preventDefault();
    const now = nowIso();
    await upsertEntity("attendanceRecords", {
      id: editingId ?? createId("attendance"),
      user_id: localUserId,
      created_at: now,
      updated_at: now,
      deleted_at: null,
      ...form
    });
    setEditingId(null);
    setForm({ subject_id: "", date: getTodayKey(), status: "attended" });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader title="Attendance" description="Track attended, missed, and canceled classes with threshold visibility." />

        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{editingId ? "Edit attendance record" : "Add attendance record"}</CardTitle>
                <CardDescription>Mark individual classes and monitor threshold risk by subject.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={saveAttendance}>
                <Field label="Subject">
                  <Select value={form.subject_id} onChange={(event) => setForm((current) => ({ ...current, subject_id: event.target.value }))} required>
                    <option value="">Select subject</option>
                    {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                  </Select>
                </Field>
                <Field label="Date"><Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} /></Field>
                <Field label="Status">
                  <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as typeof form.status }))}>
                    <option value="attended">Attended</option>
                    <option value="missed">Missed</option>
                    <option value="canceled">Canceled</option>
                  </Select>
                </Field>
                <Button type="submit">{editingId ? "Update record" : "Save record"}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Subject overview</CardTitle>
                <CardDescription>Default threshold is {preferences.attendance_threshold}% and can be changed in settings.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjects.length === 0 ? (
                <EmptyState title="No subjects to track" description="Create subjects first, then log attendance against them." />
              ) : (
                subjects.map((subject) => {
                  const metrics = getAttendanceMetrics(subject, records, preferences.attendance_threshold);
                  return (
                    <div key={subject.id} className="rounded-2xl border border-border/70 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.color }} />
                            <p className="font-medium">{subject.name}</p>
                            {metrics.warning ? <Badge tone="danger" className="gap-1"><AlertTriangle className="h-3 w-3" />Below threshold</Badge> : <Badge tone="success">On track</Badge>}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">Attended {metrics.attended} • Missed {metrics.missed} • Target {metrics.threshold}%</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-3xl font-semibold">{metrics.percentage}%</p>
                          <p className="text-sm text-muted-foreground">{metrics.classesNeeded} classes needed</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Progress value={metrics.percentage} />
                        <p className="text-sm text-muted-foreground">{metrics.warning ? `Attend ${metrics.classesNeeded} consecutive classes to recover.` : "Attendance is above the configured threshold."}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent attendance log</CardTitle>
              <CardDescription>Quick edit and delete controls for recent records.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {records.length === 0 ? (
              <EmptyState title="No attendance records yet" description="The records you add will show up here with edit controls." />
            ) : (
              [...records]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 12)
                .map((record) => {
                  const subject = subjects.find((item) => item.id === record.subject_id);
                  return (
                    <div key={record.id} className="flex items-center justify-between rounded-2xl border border-border/70 p-4">
                      <div>
                        <p className="font-medium">{subject?.name ?? "Subject"}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{record.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={record.status === "attended" ? "success" : record.status === "missed" ? "danger" : "secondary"}>{record.status}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingId(record.id);
                            setForm({ subject_id: record.subject_id, date: record.date, status: record.status });
                          }}
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => void removeEntity("attendanceRecords", record.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  );
                })
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
