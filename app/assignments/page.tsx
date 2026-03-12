"use client";

import { useMemo, useState } from "react";
import { CheckCheck, Pencil, Plus, Trash2 } from "lucide-react";
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
import { useAssignments, useSubjects } from "@/hooks/use-app-data";
import { useAuth } from "@/hooks/use-auth";
import { createId } from "@/lib/id";
import { getTodayKey, nowIso } from "@/lib/time";
import { removeEntity, upsertEntity } from "@/services/local-store";

type AssignmentForm = {
  subject_id: string;
  title: string;
  description: string;
  due_date: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "overdue";
  estimated_minutes: number;
};

const emptyAssignment: AssignmentForm = {
  subject_id: "",
  title: "",
  description: "",
  due_date: getTodayKey(),
  priority: "medium",
  status: "pending",
  estimated_minutes: 60
};

export default function AssignmentsPage() {
  const { localUserId } = useAuth();
  const assignments = useAssignments();
  const subjects = useSubjects();
  const [form, setForm] = useState<AssignmentForm>(emptyAssignment);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ subject: "all", priority: "all", status: "all", dueDate: "" });

  const filteredAssignments = useMemo(() => {
    const today = getTodayKey();
    return assignments
      .map((assignment) => ({
        ...assignment,
        derivedStatus: assignment.status !== "completed" && assignment.due_date < today ? "overdue" : assignment.status
      }))
      .filter((assignment) => (filters.subject === "all" ? true : assignment.subject_id === filters.subject))
      .filter((assignment) => (filters.priority === "all" ? true : assignment.priority === filters.priority))
      .filter((assignment) => (filters.status === "all" ? true : assignment.derivedStatus === filters.status))
      .filter((assignment) => (!filters.dueDate ? true : assignment.due_date === filters.dueDate))
      .sort((a, b) => a.due_date.localeCompare(b.due_date));
  }, [assignments, filters]);

  const saveAssignment = async (event: React.FormEvent) => {
    event.preventDefault();
    const now = nowIso();
    await upsertEntity("assignments", {
      id: editingId ?? createId("assignment"),
      user_id: localUserId,
      created_at: now,
      updated_at: now,
      deleted_at: null,
      ...form
    });
    setEditingId(null);
    setForm(emptyAssignment);
  };

  const markComplete = async (id: string) => {
    const assignment = assignments.find((item) => item.id === id);
    if (!assignment) return;
    await upsertEntity("assignments", { ...assignment, status: "completed", updated_at: nowIso() });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader title="Assignments" description="Track deadlines, triage urgency, and clear work with one tap." />

        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{editingId ? "Edit assignment" : "Add assignment"}</CardTitle>
                <CardDescription>Create tasks with subject, due date, priority, and estimated study time.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={saveAssignment}>
                <Field label="Title"><Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required /></Field>
                <Field label="Subject">
                  <Select value={form.subject_id} onChange={(event) => setForm((current) => ({ ...current, subject_id: event.target.value }))} required>
                    <option value="">Select subject</option>
                    {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                  </Select>
                </Field>
                <Field label="Description"><Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Due date"><Input type="date" value={form.due_date} onChange={(event) => setForm((current) => ({ ...current, due_date: event.target.value }))} /></Field>
                  <Field label="Estimated minutes"><Input type="number" min={15} value={form.estimated_minutes} onChange={(event) => setForm((current) => ({ ...current, estimated_minutes: Number(event.target.value) }))} /></Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Priority">
                    <Select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as AssignmentForm["priority"] }))}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Select>
                  </Field>
                  <Field label="Status">
                    <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AssignmentForm["status"] }))}>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In progress</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                    </Select>
                  </Field>
                </div>
                <Button type="submit" className="gap-2"><Plus className="h-4 w-4" />{editingId ? "Update assignment" : "Save assignment"}</Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Filters</CardTitle>
                  <CardDescription>Slice assignments by subject, date, priority, and status.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-4">
                <Field label="Subject"><Select value={filters.subject} onChange={(event) => setFilters((current) => ({ ...current, subject: event.target.value }))}><option value="all">All</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</Select></Field>
                <Field label="Priority"><Select value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}><option value="all">All</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></Select></Field>
                <Field label="Status"><Select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="all">All</option><option value="pending">Pending</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="overdue">Overdue</option></Select></Field>
                <Field label="Due date"><Input type="date" value={filters.dueDate} onChange={(event) => setFilters((current) => ({ ...current, dueDate: event.target.value }))} /></Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Task list</CardTitle>
                  <CardDescription>{filteredAssignments.length} assignments matching filters.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredAssignments.length === 0 ? (
                  <EmptyState title="No assignments found" description="Adjust filters or add your first task." />
                ) : (
                  filteredAssignments.map((assignment) => {
                    const subject = subjects.find((item) => item.id === assignment.subject_id);
                    return (
                      <div key={assignment.id} className="rounded-2xl border border-border/70 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{assignment.title}</p>
                              <Badge tone={assignment.derivedStatus === "completed" ? "success" : assignment.derivedStatus === "overdue" ? "danger" : "secondary"}>{assignment.derivedStatus.replace("_", " ")}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{subject?.name ?? "General"} • due {assignment.due_date} • {assignment.estimated_minutes} min</p>
                            {assignment.description ? <p className="mt-3 text-sm text-muted-foreground">{assignment.description}</p> : null}
                          </div>
                          <Badge tone={assignment.priority === "high" ? "danger" : assignment.priority === "medium" ? "warning" : "secondary"}>{assignment.priority}</Badge>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button variant="secondary" size="sm" onClick={() => void markComplete(assignment.id)} disabled={assignment.derivedStatus === "completed"} className="gap-2"><CheckCheck className="h-4 w-4" />Mark complete</Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingId(assignment.id);
                              setForm({
                                subject_id: assignment.subject_id,
                                title: assignment.title,
                                description: assignment.description,
                                due_date: assignment.due_date,
                                priority: assignment.priority,
                                status: assignment.status,
                                estimated_minutes: assignment.estimated_minutes
                              });
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => void removeEntity("assignments", assignment.id)}><Trash2 className="h-4 w-4" /></Button>
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