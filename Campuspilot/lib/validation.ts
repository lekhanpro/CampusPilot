import { z } from "zod";
import { DEFAULT_ATTENDANCE_THRESHOLD, DEFAULT_POMODORO } from "@/lib/constants";

export const syncOperationSchema = z.enum(["upsert", "delete"]);
export const entityTypeSchema = z.enum([
  "subjects",
  "classSessions",
  "assignments",
  "attendanceRecords",
  "notes",
  "pomodoroSessions",
  "exams",
  "studyPlans",
  "userPreferences"
]);

const baseEntitySchema = z.object({
  id: z.string(),
  user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable().optional()
});

export const subjectSchema = baseEntitySchema.extend({
  name: z.string().min(1),
  teacher: z.string().optional().default(""),
  color: z.string().min(4),
  attendance_target: z.number().min(1).max(100).default(DEFAULT_ATTENDANCE_THRESHOLD)
});

export const classSessionSchema = baseEntitySchema.extend({
  subject_id: z.string(),
  day_of_week: z.number().min(0).max(6),
  start_time: z.string(),
  end_time: z.string(),
  room: z.string().optional().default("")
});

export const assignmentSchema = baseEntitySchema.extend({
  subject_id: z.string(),
  title: z.string().min(1),
  description: z.string().default(""),
  due_date: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["pending", "in_progress", "completed", "overdue"]),
  estimated_minutes: z.number().min(0).default(60)
});

export const attendanceRecordSchema = baseEntitySchema.extend({
  subject_id: z.string(),
  date: z.string(),
  status: z.enum(["attended", "missed", "canceled"])
});

export const noteSchema = baseEntitySchema.extend({
  subject_id: z.string().nullable().optional(),
  title: z.string().min(1),
  content: z.string().default(""),
  tags: z.array(z.string()).default([])
});

export const pomodoroSessionSchema = baseEntitySchema.extend({
  subject_id: z.string().nullable().optional(),
  assignment_id: z.string().nullable().optional(),
  session_type: z.enum(["work", "short_break", "long_break"]),
  duration_minutes: z.number().min(1),
  completed: z.boolean().default(true),
  started_at: z.string(),
  ended_at: z.string().nullable().optional()
});

export const examSchema = baseEntitySchema.extend({
  subject_id: z.string().nullable().optional(),
  title: z.string().min(1),
  exam_date: z.string(),
  syllabus: z.string().default(""),
  prep_status: z.string().default("")
});

export const userPreferenceSchema = baseEntitySchema.extend({
  attendance_threshold: z.number().min(1).max(100).default(DEFAULT_ATTENDANCE_THRESHOLD),
  pomodoro_work_minutes: z.number().min(1).default(DEFAULT_POMODORO.work),
  pomodoro_short_break_minutes: z.number().min(1).default(DEFAULT_POMODORO.shortBreak),
  pomodoro_long_break_minutes: z.number().min(1).default(DEFAULT_POMODORO.longBreak),
  theme: z.enum(["system", "light", "dark"]).default("system"),
  sync_enabled: z.boolean().default(true),
  study_start_hour: z.number().min(0).max(23).default(7),
  study_end_hour: z.number().min(0).max(23).default(22),
  preferred_session_minutes: z.number().min(15).max(180).default(50),
  focus_intensity: z.enum(["balanced", "deep", "light"]).default("balanced"),
  notifications_enabled: z.boolean().default(false)
});

export const studyPlanSchema = baseEntitySchema.extend({
  title: z.string().min(1),
  input_snapshot_json: z.string(),
  output_json: z.string()
});

export const syncQueueItemSchema = z.object({
  id: z.string(),
  entity: entityTypeSchema,
  operation: syncOperationSchema,
  payload: z.record(z.any()),
  queued_at: z.string(),
  attempt_count: z.number().min(0).default(0),
  last_error: z.string().nullable().optional()
});

export const aiPlanInputSchema = z.object({
  mode: z.enum(["study_plan", "prioritization", "recovery"]),
  availableHours: z.number().min(1).max(16),
  weakSubjects: z.array(z.string()).default([]),
  notes: z.string().default(""),
  snapshot: z.object({
    subjects: z.array(subjectSchema),
    assignments: z.array(assignmentSchema),
    exams: z.array(examSchema),
    attendanceRecords: z.array(attendanceRecordSchema),
    classSessions: z.array(classSessionSchema),
    preferences: userPreferenceSchema.nullable()
  })
});

export const aiDailyPlanInputSchema = z.object({
  date: z.string(),
  availableHours: z.number().min(1).max(16),
  snapshot: z.object({
    subjects: z.array(subjectSchema),
    assignments: z.array(assignmentSchema),
    exams: z.array(examSchema),
    classSessions: z.array(classSessionSchema),
    preferences: userPreferenceSchema.nullable()
  })
});
