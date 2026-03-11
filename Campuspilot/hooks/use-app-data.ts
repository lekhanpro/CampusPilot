"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/indexed-db";
import { useAuth } from "@/hooks/use-auth";
import { createDefaultPreferences } from "@/db/defaults";

export function useSubjects() {
  const { localUserId } = useAuth();
  return useLiveQuery(
    async () => (await db.subjects.where("user_id").equals(localUserId).toArray()).filter((item) => !item.deleted_at),
    [localUserId],
    []
  );
}

export function useClassSessions() {
  const { localUserId } = useAuth();
  return useLiveQuery(
    async () => (await db.classSessions.where("user_id").equals(localUserId).toArray()).filter((item) => !item.deleted_at),
    [localUserId],
    []
  );
}

export function useAssignments() {
  const { localUserId } = useAuth();
  return useLiveQuery(
    async () => (await db.assignments.where("user_id").equals(localUserId).toArray()).filter((item) => !item.deleted_at),
    [localUserId],
    []
  );
}

export function useAttendanceRecords() {
  const { localUserId } = useAuth();
  return useLiveQuery(
    async () => (await db.attendanceRecords.where("user_id").equals(localUserId).toArray()).filter((item) => !item.deleted_at),
    [localUserId],
    []
  );
}

export function useNotes() {
  const { localUserId } = useAuth();
  return useLiveQuery(
    async () => (await db.notes.where("user_id").equals(localUserId).toArray()).filter((item) => !item.deleted_at),
    [localUserId],
    []
  );
}

export function usePomodoroSessions() {
  const { localUserId } = useAuth();
  return useLiveQuery(
    async () => (await db.pomodoroSessions.where("user_id").equals(localUserId).toArray()).filter((item) => !item.deleted_at),
    [localUserId],
    []
  );
}

export function useExams() {
  const { localUserId } = useAuth();
  return useLiveQuery(
    async () => (await db.exams.where("user_id").equals(localUserId).toArray()).filter((item) => !item.deleted_at),
    [localUserId],
    []
  );
}

export function usePreferences() {
  const { localUserId } = useAuth();
  return useLiveQuery(
    async () => (await db.userPreferences.where("user_id").equals(localUserId).first()) ?? createDefaultPreferences(localUserId),
    [localUserId],
    createDefaultPreferences(localUserId)
  );
}

export function useStudyPlans() {
  const { localUserId } = useAuth();
  return useLiveQuery(
    async () => (await db.studyPlans.where("user_id").equals(localUserId).toArray()).filter((item) => !item.deleted_at),
    [localUserId],
    []
  );
}

export function useAppSnapshot() {
  const subjects = useSubjects();
  const classSessions = useClassSessions();
  const assignments = useAssignments();
  const attendanceRecords = useAttendanceRecords();
  const notes = useNotes();
  const pomodoroSessions = usePomodoroSessions();
  const exams = useExams();
  const preferences = usePreferences();

  return useMemo(
    () => ({
      subjects,
      classSessions,
      assignments,
      attendanceRecords,
      notes,
      pomodoroSessions,
      exams,
      preferences
    }),
    [assignments, attendanceRecords, classSessions, exams, notes, pomodoroSessions, preferences, subjects]
  );
}
