"use client";

import { useMemo, useState } from "react";
import { AlarmClock, Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useExams, useSubjects } from "@/hooks/use-app-data";
import { useAuth } from "@/hooks/use-auth";
import { createId } from "@/lib/id";
import { formatExamCountdown } from "@/lib/schedule";
import { getTodayKey, nowIso } from "@/lib/time";
import { removeEntity, upsertEntity } from "@/services/local-store";

const emptyExam = { subject_id: "", title: "", exam_date: getTodayKey(), syllabus: "", prep_status: "" };

export default function ExamsPage() {
  const { localUserId } = useAuth();
  const exams = useExams();
  const subjects = useSubjects();
  const [form, setForm] = useState(emptyExam);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedExams = useMemo(() => [...exams].sort((a, b) => a.exam_date.localeCompare(b.exam_date)), [exams]);

  const saveExam = async (event: React.FormEvent) => {
    event.preventDefault();
    const now = nowIso();
    await upsertEntity("exams", {
      id: editingId ?? createId("exam"),
      user_id: localUserId,
      created_at: now,
      updated_at: now,
      deleted_at: null,
      subject_id: form.subject_id || null,
      title: form.title,
      exam_date: form.exam_date,
      syllabus: form.syllabus,
      prep_status: form.prep_status
    });
    setEditingId(null);
    setForm(emptyExam);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader title="Exams" description="Track exam dates, syllabus coverage, and revision status with clear countdown urgency." />

        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{editingId ? "Edit exam" : "Add exam"}</CardTitle>
                <CardDescription>Capture exam date, syllabus scope, and preparation status.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={saveExam}>
                <Field label="Exam title"><Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required /></Field>
                <Field label="Subject">
                  <Select value={form.subject_id} onChange={(event) => setForm((current) => ({ ...current, subject_id: event.target.value }))}>
                    <option value="">General / multi-subject</option>
                    {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                  </Select>
                </Field>
                <Field label="Exam date"><Input type="date" value={form.exam_date} onChange={(event) => setForm((current) => ({ ...current, exam_date: event.target.value }))} /></Field>
                <Field label="Syllabus notes"><Textarea value={form.syllabus} onChange={(event) => setForm((current) => ({ ...current, syllabus: event.target.value }))} /></Field>
                <Field label="Preparation status"><Textarea value={form.prep_status} onChange={(event) => setForm((current) => ({ ...current, prep_status: event.target.value }))} placeholder="Unit 1 revised, mocks pending..." /></Field>
                <Button type="submit">{editingId ? "Update exam" : "Save exam"}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Upcoming exams</CardTitle>
                <CardDescription>Countdown, syllabus, and prep state in one view.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedExams.length === 0 ? (
                <EmptyState title="No exams tracked" description="Add your next exam and keep revision planning grounded in actual dates." />
              ) : (
                sortedExams.map((exam) => {
                  const subject = subjects.find((item) => item.id === exam.subject_id);
                  const countdown = formatExamCountdown(exam.exam_date);
                  const tone = countdown === "Today" || countdown.includes("1 day") ? "danger" : countdown === "Completed" ? "secondary" : "warning";
                  return (
                    <div key={exam.id} className="rounded-2xl border border-border/70 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{exam.title}</p>
                            {subject ? <Badge tone="secondary">{subject.name}</Badge> : null}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{exam.exam_date}</p>
                        </div>
                        <Badge tone={tone as "danger" | "secondary" | "warning"}>{countdown}</Badge>
                      </div>
                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl bg-muted/50 p-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Syllabus</p>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{exam.syllabus || "No syllabus notes yet."}</p>
                        </div>
                        <div className="rounded-xl bg-muted/50 p-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Preparation</p>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{exam.prep_status || "No prep status yet."}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingId(exam.id);
                            setForm({
                              subject_id: exam.subject_id ?? "",
                              title: exam.title,
                              exam_date: exam.exam_date,
                              syllabus: exam.syllabus,
                              prep_status: exam.prep_status
                            });
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => void removeEntity("exams", exam.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary"><AlarmClock className="h-5 w-5" /></div>
            <div>
              <p className="font-medium">Revision-aware countdowns</p>
              <p className="text-sm text-muted-foreground">Use the AI planner to turn these exam dates and syllabus notes into concrete study blocks.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
