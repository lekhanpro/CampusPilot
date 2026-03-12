"use client";

import { useMemo, useState } from "react";
import { addMonths, format, isSameMonth, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAssignments, useClassSessions, useExams, useSubjects } from "@/hooks/use-app-data";
import { formatMonthLabel, toAgendaEvents, weekDayLabels } from "@/lib/schedule";
import { getMonthGrid, getTodayKey } from "@/lib/time";

export default function CalendarPage() {
  const assignments = useAssignments();
  const exams = useExams();
  const classSessions = useClassSessions();
  const subjects = useSubjects();
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getTodayKey());

  const days = useMemo(() => getMonthGrid(month), [month]);
  const agenda = toAgendaEvents({ date: selectedDate, sessions: classSessions, assignments, exams, subjects });

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader title="Calendar" description="Monthly overview with classes, deadlines, exams, and the selected day agenda." />

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <div className="flex w-full items-center justify-between gap-3">
                <div>
                  <CardTitle>{formatMonthLabel(month)}</CardTitle>
                  <CardDescription>Tap a day to inspect classes, deadlines, and exams.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setMonth((current) => subMonths(current, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => setMonth(new Date())}>Today</Button>
                  <Button variant="outline" size="sm" onClick={() => setMonth((current) => addMonths(current, 1))}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {weekDayLabels.map((day) => <div key={day}>{day.slice(0, 3)}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const itemCount = toAgendaEvents({ date: key, sessions: classSessions, assignments, exams, subjects }).length;
                  const active = key === selectedDate;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDate(key)}
                      className={`min-h-24 rounded-2xl border p-2 text-left transition ${active ? "border-primary bg-primary/15 shadow-soft" : "border-border/70 bg-background/55 hover:bg-muted/65"} ${isSameMonth(day, month) ? "opacity-100" : "opacity-40"}`}
                    >
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>{format(day, "d")}</span>
                        {itemCount > 0 ? <Badge tone="secondary">{itemCount}</Badge> : null}
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {assignments.filter((assignment) => assignment.due_date === key).slice(0, 1).map((assignment) => <div key={assignment.id} className="rounded bg-warning/20 px-1.5 py-1">{assignment.title}</div>)}
                        {exams.filter((exam) => exam.exam_date === key).slice(0, 1).map((exam) => <div key={exam.id} className="rounded bg-destructive/15 px-1.5 py-1">{exam.title}</div>)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>{format(new Date(selectedDate), "EEEE, MMMM d")}</CardTitle>
                <CardDescription>Day agenda grouped from timetable, assignment deadlines, and exams.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {agenda.length === 0 ? (
                <EmptyState title="No events for this day" description="Classes, assignment deadlines, and exams will surface here when they match the selected date." />
              ) : (
                agenda.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="rounded-2xl border border-border/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                      </div>
                      <Badge tone={item.type === "exam" ? "danger" : item.type === "assignment" ? "warning" : "secondary"}>{item.type}</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

