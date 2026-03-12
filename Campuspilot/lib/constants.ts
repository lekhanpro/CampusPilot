export const APP_NAME = "CampusPilot";
export const GITHUB_DESCRIPTION =
  "Offline-first student productivity super app (PWA) with timetable, assignments, attendance, notes, Pomodoro, analytics, Firebase sync, and Groq AI planning.";
export const APP_DESCRIPTION = GITHUB_DESCRIPTION;
export const LOCAL_USER_STORAGE_KEY = "campuspilot.local-user-id";
export const TIMER_STORAGE_KEY = "campuspilot.pomodoro";
export const LAST_SYNC_STORAGE_KEY = "campuspilot.last-sync";
export const DEFAULT_ATTENDANCE_THRESHOLD = 75;
export const DEFAULT_POMODORO = {
  work: 25,
  shortBreak: 5,
  longBreak: 15
};
export const SYNC_TABLES = [
  "subjects",
  "classSessions",
  "assignments",
  "attendanceRecords",
  "notes",
  "pomodoroSessions",
  "exams",
  "studyPlans",
  "userPreferences"
] as const;
export const SUBJECT_COLORS = [
  "#2563eb",
  "#0f766e",
  "#dc2626",
  "#7c3aed",
  "#ca8a04",
  "#db2777",
  "#ea580c",
  "#0284c7"
];
