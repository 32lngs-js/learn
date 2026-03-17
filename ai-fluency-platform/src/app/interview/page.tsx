"use client";

import { useEffect, useState } from "react";
import { InterviewCourseSelector } from "@/components/interview/InterviewCourseSelector";
import { getAllProgress } from "@/lib/store/progress";

interface CourseInfo {
  id: string;
  title: string;
  description: string;
  color: string;
}

interface CurriculumData {
  modules: Record<string, { title: string; isIndex: boolean; isCheckpoint: boolean }[]>;
}

interface CourseWithProgress {
  id: string;
  title: string;
  description: string;
  color: string;
  studiedCount: number;
  totalCount: number;
}

export default function InterviewPage() {
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch courses list
        const coursesRes = await fetch("/api/courses");
        const coursesData: CourseInfo[] = await coursesRes.json();

        const progress = getAllProgress();

        // For each course, fetch curriculum and count progress
        const coursesWithProgress: CourseWithProgress[] = await Promise.all(
          coursesData.map(async (course) => {
            try {
              const currRes = await fetch(`/api/curriculum/${course.id}`);
              const curriculum: CurriculumData = await currRes.json();

              // Count total non-index, non-checkpoint modules
              let totalCount = 0;
              for (const mods of Object.values(curriculum.modules)) {
                totalCount += mods.filter(
                  (m) => !m.isIndex && !m.isCheckpoint
                ).length;
              }

              // Count completed modules from progress
              let studiedCount = 0;
              for (const [key, value] of Object.entries(progress.modules)) {
                if (key.startsWith(`${course.id}/`) && value.completed) {
                  studiedCount++;
                }
              }

              return { ...course, studiedCount, totalCount };
            } catch {
              return { ...course, studiedCount: 0, totalCount: 0 };
            }
          })
        );

        setCourses(coursesWithProgress);
      } catch {
        // If API doesn't exist yet, show empty state
        setCourses([]);
      }
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Interview Me</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Test your knowledge with AI-powered practice interviews. Pick a course
          you have been studying, choose your difficulty, and get quizzed on what
          you have learned.
        </p>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No courses found. Start studying to unlock interviews.
        </div>
      ) : (
        <InterviewCourseSelector courses={courses} />
      )}
    </main>
  );
}
