import { db } from "@/db/indexed-db";

export const localTableMap = {
  subjects: db.subjects,
  classSessions: db.classSessions,
  assignments: db.assignments,
  attendanceRecords: db.attendanceRecords,
  notes: db.notes,
  pomodoroSessions: db.pomodoroSessions,
  exams: db.exams,
  studyPlans: db.studyPlans,
  userPreferences: db.userPreferences
};

export type SyncEntityKey = keyof typeof localTableMap;
