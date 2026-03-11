import type { z } from "zod";
import {
  aiDailyPlanInputSchema,
  aiPlanInputSchema,
  assignmentSchema,
  attendanceRecordSchema,
  classSessionSchema,
  examSchema,
  noteSchema,
  pomodoroSessionSchema,
  studyPlanSchema,
  subjectSchema,
  syncQueueItemSchema,
  userPreferenceSchema
} from "@/lib/validation";

export type Subject = z.infer<typeof subjectSchema>;
export type ClassSession = z.infer<typeof classSessionSchema>;
export type Assignment = z.infer<typeof assignmentSchema>;
export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;
export type Note = z.infer<typeof noteSchema>;
export type PomodoroSession = z.infer<typeof pomodoroSessionSchema>;
export type Exam = z.infer<typeof examSchema>;
export type UserPreference = z.infer<typeof userPreferenceSchema>;
export type StudyPlan = z.infer<typeof studyPlanSchema>;
export type SyncQueueItem = z.infer<typeof syncQueueItemSchema>;
export type AiPlanInput = z.infer<typeof aiPlanInputSchema>;
export type AiDailyPlanInput = z.infer<typeof aiDailyPlanInputSchema>;

export type AttendanceStatus = AttendanceRecord["status"];
export type AssignmentStatus = Assignment["status"];
export type AssignmentPriority = Assignment["priority"];
export type PomodoroSessionType = PomodoroSession["session_type"];
