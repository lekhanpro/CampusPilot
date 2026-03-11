import { differenceInCalendarDays, parseISO } from "date-fns";
import type { AttendanceRecord, Subject } from "@/types/entities";

export function getAttendanceMetrics(subject: Subject, records: AttendanceRecord[], threshold = subject.attendance_target) {
  const subjectRecords = records.filter((record) => record.subject_id === subject.id && !record.deleted_at);
  const attended = subjectRecords.filter((record) => record.status === "attended").length;
  const missed = subjectRecords.filter((record) => record.status === "missed").length;
  const total = attended + missed;
  const percentage = total === 0 ? 100 : Math.round((attended / total) * 100);
  const warning = percentage < threshold;
  const classesNeeded = percentage >= threshold
    ? 0
    : Math.max(0, Math.ceil((threshold * total - 100 * attended) / (100 - threshold)));

  return {
    attended,
    missed,
    total,
    percentage,
    threshold,
    classesNeeded,
    warning
  };
}

export function getAttendanceTrend(records: AttendanceRecord[]) {
  return [...records]
    .filter((record) => !record.deleted_at)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((record) => ({
      date: record.date,
      value: record.status === "attended" ? 1 : record.status === "missed" ? 0 : null
    }));
}

export function getAttendanceRisk(examDate: string, percentage: number) {
  const daysRemaining = differenceInCalendarDays(parseISO(examDate), new Date());
  if (percentage >= 85) return "stable";
  if (daysRemaining < 14 || percentage < 75) return "urgent";
  return "watch";
}
