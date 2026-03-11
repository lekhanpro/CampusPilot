import { createId } from "@/lib/id";
import { nowIso } from "@/lib/time";
import type { UserPreference } from "@/types/entities";
import { DEFAULT_ATTENDANCE_THRESHOLD, DEFAULT_POMODORO } from "@/lib/constants";

export function createDefaultPreferences(userId: string): UserPreference {
  const now = nowIso();
  return {
    id: createId("pref"),
    user_id: userId,
    attendance_threshold: DEFAULT_ATTENDANCE_THRESHOLD,
    pomodoro_work_minutes: DEFAULT_POMODORO.work,
    pomodoro_short_break_minutes: DEFAULT_POMODORO.shortBreak,
    pomodoro_long_break_minutes: DEFAULT_POMODORO.longBreak,
    theme: "system",
    sync_enabled: true,
    study_start_hour: 7,
    study_end_hour: 22,
    preferred_session_minutes: 50,
    focus_intensity: "balanced",
    notifications_enabled: false,
    created_at: now,
    updated_at: now,
    deleted_at: null
  };
}
