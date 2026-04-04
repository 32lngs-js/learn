"use client";

import { useCourseAccess } from "@/lib/sparks/use-course-access";

interface CourseLockIconProps {
  courseId: string;
}

export function CourseLockIcon({ courseId }: CourseLockIconProps) {
  const { hasAccess, cost } = useCourseAccess(courseId);

  if (hasAccess || cost === 0) return null;

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400"
      title={`Unlock for ${cost} Sparks`}
    >
      &#128274; {cost} &#9889;
    </span>
  );
}
