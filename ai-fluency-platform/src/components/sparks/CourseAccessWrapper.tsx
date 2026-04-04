"use client";

import { CourseUnlockGate } from "./CourseUnlockGate";
import { useCourseAccess } from "@/lib/sparks/use-course-access";

interface CourseAccessWrapperProps {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  children: React.ReactNode;
}

export function CourseAccessWrapper({
  courseId,
  courseTitle,
  courseDescription,
  children,
}: CourseAccessWrapperProps) {
  const { hasAccess } = useCourseAccess(courseId);

  if (!hasAccess) {
    return (
      <CourseUnlockGate
        courseId={courseId}
        courseTitle={courseTitle}
        courseDescription={courseDescription}
      >
        {children}
      </CourseUnlockGate>
    );
  }

  return <>{children}</>;
}
