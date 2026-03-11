import { addDays, eachDayOfInterval, endOfWeek, format, startOfWeek } from "date-fns";
import type { Assignment, AttendanceRecord, Exam, PomodoroSession, Subject } from "@/types/entities";
import { getAttendanceMetrics } from "@/lib/attendance";

export function getWeeklyProductivity(assignments: Assignment[], sessions: PomodoroSession[]) {
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end }).map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const completedTasks = assignments.filter(
      (assignment) => !assignment.deleted_at && assignment.status === "completed" && assignment.updated_at.startsWith(key)
    ).length;
    const focusMinutes = sessions
      .filter((session) => !session.deleted_at && session.completed && session.started_at.startsWith(key))
      .reduce((sum, session) => sum + session.duration_minutes, 0);

    return {
      day: format(day, "EEE"),
      completedTasks,
      focusMinutes
    };
  });
}

export function getSubjectProgress(subjects: Subject[], assignments: Assignment[], sessions: PomodoroSession[]) {
  return subjects.map((subject) => {
    const completedAssignments = assignments.filter(
      (assignment) => !assignment.deleted_at && assignment.subject_id === subject.id && assignment.status === "completed"
    ).length;
    const focusMinutes = sessions
      .filter((session) => !session.deleted_at && session.subject_id === subject.id && session.completed)
      .reduce((sum, session) => sum + session.duration_minutes, 0);
    return {
      subject: subject.name,
      completedAssignments,
      focusHours: Math.round((focusMinutes / 60) * 10) / 10
    };
  });
}

export function getAttendanceChart(subjects: Subject[], records: AttendanceRecord[]) {
  return subjects.map((subject) => {
    const metrics = getAttendanceMetrics(subject, records);
    return {
      subject: subject.name,
      attendance: metrics.percentage,
      threshold: metrics.threshold
    };
  });
}

export function getWorkloadOverview(assignments: Assignment[], exams: Exam[]) {
  const next14Days = Array.from({ length: 14 }, (_, index) => format(addDays(new Date(), index), "yyyy-MM-dd"));
  return next14Days.map((date) => ({
    date: format(new Date(date), "MMM d"),
    assignments: assignments.filter((assignment) => !assignment.deleted_at && assignment.due_date === date).length,
    exams: exams.filter((exam) => !exam.deleted_at && exam.exam_date === date).length
  }));
}
