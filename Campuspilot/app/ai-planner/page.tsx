"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { BrainCircuit, RefreshCcw } from "lucide-react";
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
import { useAppSnapshot, useStudyPlans } from "@/hooks/use-app-data";
import { useAuth } from "@/hooks/use-auth";
import { createId } from "@/lib/id";
import { getTodayKey, nowIso } from "@/lib/time";
import { upsertEntity } from "@/services/local-store";

type PlanMode = "study_plan" | "prioritization" | "recovery";

export default function AiPlannerPage() {
  const { localUserId } = useAuth();
  const snapshot = useAppSnapshot();
  const studyPlans = useStudyPlans();
  const [mode, setMode] = useState<PlanMode>("study_plan");
  const [availableHours, setAvailableHours] = useState(3);
  const [dailyDate, setDailyDate] = useState(getTodayKey());
  const [weakSubjects, setWeakSubjects] = useState("");
  const [notes, setNotes] = useState("");

  const studyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          availableHours,
          weakSubjects: weakSubjects.split(",").map((item) => item.trim()).filter(Boolean),
          notes,
          snapshot: {
            subjects: snapshot.subjects,
            assignments: snapshot.assignments,
            exams: snapshot.exams,
            attendanceRecords: snapshot.attendanceRecords,
            classSessions: snapshot.classSessions,
            preferences: snapshot.preferences
          }
        })
      });
      if (!response.ok) throw new Error(`Study plan request failed with ${response.status}`);
      return response.json();
    },
    onSuccess: async (data) => {
      const now = nowIso();
      await upsertEntity("studyPlans", {
        id: createId("plan"),
        user_id: localUserId,
        title: `${mode.replace("_", " ")} ${new Date().toLocaleString()}`,
        input_snapshot_json: JSON.stringify({ mode, availableHours, weakSubjects, notes }),
        output_json: JSON.stringify(data),
        created_at: now,
        updated_at: now,
        deleted_at: null
      });
    }
  });

  const dailyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/daily-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dailyDate,
          availableHours,
          snapshot: {
            subjects: snapshot.subjects,
            assignments: snapshot.assignments,
            exams: snapshot.exams,
            classSessions: snapshot.classSessions,
            preferences: snapshot.preferences
          }
        })
      });
      if (!response.ok) throw new Error(`Daily plan request failed with ${response.status}`);
      return response.json();
    },
    onSuccess: async (data) => {
      const now = nowIso();
      await upsertEntity("studyPlans", {
        id: createId("plan"),
        user_id: localUserId,
        title: `daily plan ${dailyDate}`,
        input_snapshot_json: JSON.stringify({ dailyDate, availableHours }),
        output_json: JSON.stringify(data),
        created_at: now,
        updated_at: now,
        deleted_at: null
      });
    }
  });

  const latestPlan = useMemo(() => {
    const candidate = dailyMutation.data ?? studyMutation.data;
    return candidate ? JSON.stringify(candidate, null, 2) : null;
  }, [dailyMutation.data, studyMutation.data]);

  const errorMessage = studyMutation.error instanceof Error
    ? studyMutation.error.message
    : dailyMutation.error instanceof Error
      ? dailyMutation.error.message
      : null;

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader title="AI Planner" description="Groq-powered study planning grounded in your actual timetable, deadlines, exams, and attendance risk." />

        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Generate plan</CardTitle>
                <CardDescription>Choose a planning mode, set your available hours, and add any relevant context.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Field label="Planning mode">
                <Select value={mode} onChange={(event) => setMode(event.target.value as PlanMode)}>
                  <option value="study_plan">Study plan</option>
                  <option value="prioritization">Smart prioritization</option>
                  <option value="recovery">Recovery plan</option>
                </Select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Available hours"><Input type="number" min={1} max={16} value={availableHours} onChange={(event) => setAvailableHours(Number(event.target.value))} /></Field>
                <Field label="Daily plan date"><Input type="date" value={dailyDate} onChange={(event) => setDailyDate(event.target.value)} /></Field>
              </div>
              <Field label="Weak subjects"><Input value={weakSubjects} onChange={(event) => setWeakSubjects(event.target.value)} placeholder="maths, dbms, physics" /></Field>
              <Field label="Additional context"><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Mention energy level, backlog, upcoming viva, or attendance concerns." /></Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button onClick={() => studyMutation.mutate()} disabled={studyMutation.isPending} className="gap-2"><BrainCircuit className="h-4 w-4" />{studyMutation.isPending ? "Generating..." : "Generate study/prioritization plan"}</Button>
                <Button variant="outline" onClick={() => dailyMutation.mutate()} disabled={dailyMutation.isPending} className="gap-2"><RefreshCcw className="h-4 w-4" />{dailyMutation.isPending ? "Building..." : "Generate daily plan"}</Button>
              </div>
              {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Generated output</CardTitle>
                <CardDescription>Strict JSON response suitable for deterministic rendering and later extensions.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {latestPlan ? (
                <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">{latestPlan}</pre>
              ) : (
                <EmptyState title="No generated plan yet" description="Use the actions on the left to request a study plan, daily plan, prioritization, or recovery schedule." />
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Saved plan history</CardTitle>
              <CardDescription>Each generated plan is saved locally and can later be synced when you are signed in.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {studyPlans.length === 0 ? (
              <EmptyState title="No saved plans" description="Generated plans will be stored here with their input snapshot and raw JSON output." />
            ) : (
              [...studyPlans].sort((a, b) => b.created_at.localeCompare(a.created_at)).map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-border/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{plan.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{new Date(plan.created_at).toLocaleString()}</p>
                    </div>
                    <Badge tone="secondary">Saved</Badge>
                  </div>
                  <details className="mt-4 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
                    <summary className="cursor-pointer font-medium text-foreground">View payload</summary>
                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs">{plan.output_json}</pre>
                  </details>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
