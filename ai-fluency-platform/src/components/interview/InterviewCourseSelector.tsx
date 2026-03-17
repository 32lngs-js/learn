"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";

interface CourseWithProgress {
  id: string;
  title: string;
  description: string;
  color: string;
  studiedCount: number;
  totalCount: number;
}

interface InterviewCourseSelectorProps {
  courses: CourseWithProgress[];
}

export function InterviewCourseSelector({
  courses,
}: InterviewCourseSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => {
        const hasProgress = course.studiedCount > 0;

        if (!hasProgress) {
          return (
            <div
              key={course.id}
              className="relative rounded-xl border p-6 opacity-60 cursor-not-allowed"
            >
              <div
                className="absolute inset-x-0 top-0 h-1 rounded-t-xl"
                style={{ backgroundColor: course.color }}
              />
              <div className="flex items-start gap-3">
                <BookOpen
                  className="h-5 w-5 mt-0.5 shrink-0"
                  style={{ color: course.color }}
                />
                <div>
                  <h3 className="font-semibold text-sm">{course.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete some modules first
                  </p>
                </div>
              </div>
            </div>
          );
        }

        return (
          <Link key={course.id} href={`/interview/${course.id}`}>
            <div className="relative rounded-xl border p-6 hover:border-foreground/20 hover:shadow-md transition-all cursor-pointer">
              <div
                className="absolute inset-x-0 top-0 h-1 rounded-t-xl"
                style={{ backgroundColor: course.color }}
              />
              <div className="flex items-start gap-3">
                <BookOpen
                  className="h-5 w-5 mt-0.5 shrink-0"
                  style={{ color: course.color }}
                />
                <div>
                  <h3 className="font-semibold text-sm">{course.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {course.studiedCount} of {course.totalCount} topics studied
                  </p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
