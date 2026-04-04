"use client";

import type { StreakState } from "@/types/sparks";
import { SPARK_CONFIG } from "./config";

const STREAK_KEY = "aif_streak_v2";

const DEFAULT_STREAK: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  freezesRemaining: 0,
  graceDaysUsed: 0,
  streakAtGraceStart: 0,
};

export function getStreakState(): StreakState {
  if (typeof window === "undefined") return { ...DEFAULT_STREAK };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupted data
  }
  return { ...DEFAULT_STREAK };
}

export function saveStreakState(state: StreakState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STREAK_KEY, JSON.stringify(state));
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function updateStreak(): {
  newStreak: number;
  wasFrozen: boolean;
  isDegraded: boolean;
  freezesLeft: number;
  isNewDay: boolean;
} {
  const state = getStreakState();
  const today = getTodayString();

  // Same day — no change
  if (state.lastActivityDate === today) {
    return {
      newStreak: state.currentStreak,
      wasFrozen: false,
      isDegraded: false,
      freezesLeft: state.freezesRemaining,
      isNewDay: false,
    };
  }

  let wasFrozen = false;
  let isDegraded = false;

  if (state.lastActivityDate === null) {
    // First activity ever
    state.currentStreak = 1;
  } else {
    const daysMissed = daysBetween(state.lastActivityDate, today) - 1;

    if (daysMissed === 0) {
      // Consecutive day
      state.currentStreak += 1;
    } else if (daysMissed === 1 && state.freezesRemaining > 0) {
      // 1-day gap with freeze
      state.freezesRemaining -= 1;
      wasFrozen = true;
      state.currentStreak += 1;
    } else if (daysMissed >= 1 && daysMissed <= 3) {
      // Graceful degradation: lose 1 per day missed, floor at 1
      state.currentStreak = Math.max(1, state.currentStreak - daysMissed);
      isDegraded = true;
      state.graceDaysUsed += daysMissed;
    } else {
      // 4+ days missed: full reset
      state.currentStreak = 1;
    }
  }

  if (state.currentStreak > state.longestStreak) {
    state.longestStreak = state.currentStreak;
  }

  state.lastActivityDate = today;
  saveStreakState(state);

  return {
    newStreak: state.currentStreak,
    wasFrozen,
    isDegraded,
    freezesLeft: state.freezesRemaining,
    isNewDay: true,
  };
}

export function canUseFreeze(): boolean {
  const state = getStreakState();
  return state.freezesRemaining > 0;
}

export function useFreeze(): boolean {
  const state = getStreakState();
  if (state.freezesRemaining <= 0) return false;
  state.freezesRemaining -= 1;
  saveStreakState(state);
  return true;
}

export function getStreakBonus(currentStreak: number): number {
  let bonus = 0;
  for (const [threshold, reward] of Object.entries(SPARK_CONFIG.streakBonusTable)) {
    if (currentStreak >= Number(threshold)) {
      bonus = reward;
    }
  }
  return bonus;
}
