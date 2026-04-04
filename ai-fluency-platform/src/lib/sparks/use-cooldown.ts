"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  getCooldownState,
  recordLessonUsed as recordLessonUsedStore,
  skipCooldown as skipCooldownStore,
  getTimeRemaining,
} from "./cooldown";
import { SPARK_CONFIG } from "./config";

export function useCooldown(courseId: string) {
  const [canAccess, setCanAccess] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [lessonsUsedToday, setLessonsUsedToday] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(() => {
    const state = getCooldownState(courseId);
    const remaining = getTimeRemaining(courseId);
    setTimeRemaining(remaining);
    setCanAccess(remaining === 0);
    setLessonsUsedToday(state?.lessonsUsedToday ?? 0);
  }, [courseId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Count down every second when there's a cooldown active
  useEffect(() => {
    if (timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        const remaining = getTimeRemaining(courseId);
        setTimeRemaining(remaining);
        if (remaining === 0) {
          setCanAccess(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timeRemaining > 0, courseId]);

  const recordUsed = useCallback(() => {
    const state = recordLessonUsedStore(courseId);
    setLessonsUsedToday(state.lessonsUsedToday);
    if (state.lessonsUsedToday >= SPARK_CONFIG.freeLessonsPerDay && state.nextLessonAvailable) {
      const remaining = new Date(state.nextLessonAvailable).getTime() - Date.now();
      setTimeRemaining(Math.max(0, remaining));
      setCanAccess(false);
    }
  }, [courseId]);

  const skip = useCallback(
    (userId: string) => {
      const result = skipCooldownStore(courseId, userId);
      if (result.success) {
        setTimeRemaining(0);
        setCanAccess(true);
      }
      return result;
    },
    [courseId]
  );

  return {
    canAccess,
    timeRemaining,
    lessonsUsedToday,
    recordUsed,
    skip,
  };
}
