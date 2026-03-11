import { format, parseISO } from "date-fns";
import type { Assignment, ClassSession, Exam, Subject } from "@/types/entities";
import { daysUntil, formatTimeLabel, getTodayKey } from "@/lib/time";

export const weekDayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function getTodaySessions(classSessions: ClassSession[]) {
  const today = new Date().getDay();
  return classSessions
    .filter((session) => session.day_of_week === today && !session.deleted_at)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
}

export function getUpcomingAssignments(assignments: Assignment[]) {
  const today = getTodayKey();
  return assignments
    .filter((assignment) => !assignment.deleted_at && assignment.status !== "completed" && assignment.due_date >= today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
}

export function withSubjectName<T extends { subject_id?: string | null }>(items: T[], subjects: Subject[]) {
  return items.map((item) => ({
    ...item,
    subjectName: subjects.find((subject) => subject.id === item.subject_id)?.name ?? "General"
  }));
}

export function toAgendaEvents({
  date,
  sessions,
  assignments,
  exams,
  subjects
}: {
  date: string;
  sessions: ClassSession[];
  assignments: Assignment[];
  exams: Exam[];
  subjects: Subject[];
}) {
  const activeDate = parseISO(date);
  const dayOfWeek = activeDate.getDay();

  const classEvents = sessions
    .filter((session) => !session.deleted_at && session.day_of_week === dayOfWeek)
    .map((session) => ({
      id: session.id,
      type: "class" as const,
      title: subjects.find((subject) => subject.id === session.subject_id)?.name ?? "Class",
      detail: `${formatTimeLabel(session.start_time)} - ${formatTimeLabel(session.end_time)}${session.room ? ` • ${session.room}` : ""}`
    }));

  const assignmentEvents = assignments
    .filter((assignment) => !assignment.deleted_at && assignment.due_date === date)
    .map((assignment) => ({
      id: assignment.id,
      type: "assignment" as const,
      title: assignment.title,
      detail: `${subjects.find((subject) => subject.id === assignment.subject_id)?.name ?? "General"} • ${assignment.priority}`
    }));

  const examEvents = exams
    .filter((exam) => !exam.deleted_at && exam.exam_date === date)
    .map((exam) => ({
      id: exam.id,
      type: "exam" as const,
      title: exam.title,
      detail: `${exam.subject_id ? subjects.find((subject) => subject.id === exam.subject_id)?.name ?? "Exam" : "Exam"}`
    }));

  return [...classEvents, ...assignmentEvents, ...examEvents];
}

export function formatExamCountdown(examDate: string) {
  const days = daysUntil(examDate);
  if (days < 0) return "Completed";
  if (days === 0) return "Today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

export function formatMonthLabel(date: Date) {
  return format(date, "MMMM yyyy");
}
