"use client";

import { useCallback } from "react";

export function useCooldown(_courseId: string) {
  // Cooldowns are disabled — all lessons are always accessible
  const recordUsed = useCallback(() => {
    // no-op: no cooldown tracking
  }, []);

  const skip = useCallback(
    (_userId: string) => {
      return { success: true, newBalance: 0 };
    },
    []
  );

  return {
    canAccess: true,
    timeRemaining: 0,
    lessonsUsedToday: 0,
    recordUsed,
    skip,
  };
}
