"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TIMER_STORAGE_KEY } from "@/lib/constants";
import type { PomodoroSessionType } from "@/types/entities";

type PomodoroState = {
  mode: PomodoroSessionType;
  durationMinutes: number;
  remainingSeconds: number;
  running: boolean;
  startedAt: string | null;
  linkedSubjectId: string | null;
  linkedAssignmentId: string | null;
  startTimer: (payload: {
    mode: PomodoroSessionType;
    durationMinutes: number;
    linkedSubjectId?: string | null;
    linkedAssignmentId?: string | null;
  }) => void;
  configureTimer: (payload: {
    mode?: PomodoroSessionType;
    durationMinutes?: number;
    linkedSubjectId?: string | null;
    linkedAssignmentId?: string | null;
  }) => void;
  tick: () => void;
  pause: () => void;
  reset: () => void;
};

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      mode: "work",
      durationMinutes: 25,
      remainingSeconds: 25 * 60,
      running: false,
      startedAt: null,
      linkedSubjectId: null,
      linkedAssignmentId: null,
      startTimer: ({ mode, durationMinutes, linkedSubjectId, linkedAssignmentId }) =>
        set({
          mode,
          durationMinutes,
          remainingSeconds: durationMinutes * 60,
          running: true,
          startedAt: new Date().toISOString(),
          linkedSubjectId: linkedSubjectId ?? null,
          linkedAssignmentId: linkedAssignmentId ?? null
        }),
      configureTimer: ({ mode, durationMinutes, linkedSubjectId, linkedAssignmentId }) =>
        set((state) => ({
          mode: mode ?? state.mode,
          durationMinutes: durationMinutes ?? state.durationMinutes,
          remainingSeconds: state.running ? state.remainingSeconds : (durationMinutes ?? state.durationMinutes) * 60,
          linkedSubjectId: linkedSubjectId !== undefined ? linkedSubjectId : state.linkedSubjectId,
          linkedAssignmentId: linkedAssignmentId !== undefined ? linkedAssignmentId : state.linkedAssignmentId
        })),
      tick: () => {
        const state = get();
        if (!state.running || state.remainingSeconds <= 0) return;
        set({ remainingSeconds: state.remainingSeconds - 1 });
      },
      pause: () => set({ running: false }),
      reset: () =>
        set((state) => ({
          running: false,
          remainingSeconds: state.durationMinutes * 60,
          startedAt: null
        }))
    }),
    {
      name: TIMER_STORAGE_KEY
    }
  )
);
