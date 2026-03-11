import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek
} from "date-fns";

export function nowIso() {
  return new Date().toISOString();
}

export function formatTimeLabel(time24: string) {
  const [hours, minutes] = time24.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return format(date, "h:mm a");
}

export function getTodayKey() {
  return format(new Date(), "yyyy-MM-dd");
}

export function getWeekRange(baseDate = new Date()) {
  const start = startOfWeek(baseDate, { weekStartsOn: 1 });
  const end = endOfWeek(baseDate, { weekStartsOn: 1 });
  return { start, end };
}

export function getMonthGrid(baseDate = new Date()) {
  const start = startOfWeek(startOfMonth(baseDate), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(baseDate), { weekStartsOn: 1 });
  const days: Date[] = [];
  let cursor = start;
  while (cursor <= end) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function daysUntil(dateIso: string) {
  return differenceInCalendarDays(parseISO(dateIso), new Date());
}

export function sameDay(a: string | Date, b: string | Date) {
  return isSameDay(typeof a === "string" ? parseISO(a) : a, typeof b === "string" ? parseISO(b) : b);
}
