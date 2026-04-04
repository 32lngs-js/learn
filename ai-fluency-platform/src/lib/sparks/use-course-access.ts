"use client";

import { useState, useCallback, useEffect } from "react";
import {
  canAccessCourse,
  unlockCourse as unlockCourseStore,
  getCourseCost,
} from "./course-access";

export function useCourseAccess(courseId: string) {
  const [hasAccess, setHasAccess] = useState(true);
  const [cost, setCost] = useState(0);

  const refresh = useCallback(() => {
    setHasAccess(canAccessCourse(courseId));
    setCost(getCourseCost(courseId));
  }, [courseId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unlock = useCallback(
    (userId: string) => {
      const result = unlockCourseStore(courseId, userId);
      if (result.success) {
        setHasAccess(true);
      }
      return result;
    },
    [courseId]
  );

  return {
    hasAccess,
    cost,
    unlock,
  };
}
