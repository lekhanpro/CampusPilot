import Dexie, { type Table } from "dexie";
import type {
  Assignment,
  AttendanceRecord,
  ClassSession,
  Exam,
  Note,
  PomodoroSession,
  StudyPlan,
  Subject,
  SyncQueueItem,
  UserPreference
} from "@/types/entities";

export class CampusPilotDB extends Dexie {
  subjects!: Table<Subject, string>;
  classSessions!: Table<ClassSession, string>;
  assignments!: Table<Assignment, string>;
  attendanceRecords!: Table<AttendanceRecord, string>;
  notes!: Table<Note, string>;
  pomodoroSessions!: Table<PomodoroSession, string>;
  exams!: Table<Exam, string>;
  studyPlans!: Table<StudyPlan, string>;
  userPreferences!: Table<UserPreference, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super("campuspilot");
    this.version(1).stores({
      subjects: "id, user_id, name, updated_at, deleted_at",
      classSessions: "id, user_id, subject_id, day_of_week, updated_at, deleted_at",
      assignments: "id, user_id, subject_id, due_date, status, priority, updated_at, deleted_at",
      attendanceRecords: "id, user_id, subject_id, date, status, updated_at, deleted_at",
      notes: "id, user_id, subject_id, *tags, updated_at, deleted_at",
      pomodoroSessions: "id, user_id, subject_id, assignment_id, started_at, updated_at, deleted_at",
      exams: "id, user_id, subject_id, exam_date, updated_at, deleted_at",
      studyPlans: "id, user_id, updated_at, deleted_at",
      userPreferences: "id, user_id, updated_at, deleted_at",
      syncQueue: "id, entity, queued_at"
    });
  }
}

export const db = new CampusPilotDB();
