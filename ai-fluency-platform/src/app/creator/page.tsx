"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CreatorGate from "@/components/creator/CreatorGate";
import CreatorCourseCard from "@/components/creator/CreatorCourseCard";
import type { CreatorCourse } from "@/types/sparks";

function CreatorDashboardContent() {
  const [courses, setCourses] = useState<CreatorCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/creator/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data.courses ?? []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const totalSales = courses.reduce((sum, c) => sum + c.totalSales, 0);
  const totalRevenue = courses.reduce((sum, c) => sum + c.totalRevenue, 0);
  const publishedCount = courses.filter(
    (c) => c.status === "published"
  ).length;

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Creator Dashboard</h1>
        <Link
          href="/creator/submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Submit New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold">{publishedCount}</div>
          <div className="text-sm text-muted-foreground">Published</div>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold">{totalSales}</div>
          <div className="text-sm text-muted-foreground">Total Sales</div>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold">{totalRevenue}</div>
          <div className="text-sm text-muted-foreground">Sparks Earned</div>
        </div>
      </div>

      {/* Course List */}
      {loading ? (
        <div className="animate-pulse text-muted-foreground">
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            You haven&apos;t submitted any courses yet.
          </p>
          <Link
            href="/creator/submit"
            className="mt-2 inline-block text-sm text-primary hover:underline"
          >
            Create your first course
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <CreatorCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreatorPage() {
  return (
    <CreatorGate>
      <CreatorDashboardContent />
    </CreatorGate>
  );
}
