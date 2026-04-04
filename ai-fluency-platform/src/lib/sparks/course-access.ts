"use client";

import type { CourseUnlock } from "@/types/sparks";
import { SPARK_CONFIG } from "./config";
import { spendSparks, getBalance } from "./store";
import { syncSparkSpend } from "./db-sync";
import { generateIdempotencyKey } from "./idempotency";

const UNLOCKS_KEY = "aif_course_unlocks";

function getUnlocks(): CourseUnlock[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(UNLOCKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupted data
  }
  return [];
}

function saveUnlocks(unlocks: CourseUnlock[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(UNLOCKS_KEY, JSON.stringify(unlocks));
}

export function getCourseCost(courseId: string): number {
  if (SPARK_CONFIG.freeCourses.includes(courseId)) return 0;
  return SPARK_CONFIG.coursePrices[courseId] ?? 0;
}

export function getUnlockedCourses(): CourseUnlock[] {
  return getUnlocks();
}

export function canAccessCourse(_courseId: string): boolean {
  // All courses are free — nothing is restricted
  return true;
}

export function unlockCourse(
  courseId: string,
  userId: string
): { success: boolean; newBalance: number } {
  // Already unlocked?
  if (canAccessCourse(courseId)) {
    return { success: true, newBalance: getBalance() };
  }

  const cost = getCourseCost(courseId);
  if (cost === 0) {
    // Free course — just record the unlock
    const unlocks = getUnlocks();
    unlocks.push({
      courseId,
      unlockedAt: new Date().toISOString(),
      unlockMethod: "free",
      sparkCost: 0,
    });
    saveUnlocks(unlocks);
    return { success: true, newBalance: getBalance() };
  }

  const idempotencyKey = generateIdempotencyKey(userId, "course_unlock", courseId);
  const result = spendSparks(cost, "course_unlock", idempotencyKey, { courseId });

  if (result.success) {
    const unlocks = getUnlocks();
    unlocks.push({
      courseId,
      unlockedAt: new Date().toISOString(),
      unlockMethod: "sparks",
      sparkCost: cost,
    });
    saveUnlocks(unlocks);

    syncSparkSpend("course_unlock", cost, idempotencyKey, { courseId });
  }

  return result;
}
