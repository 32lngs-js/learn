"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { CreatorCourse } from "@/types/sparks";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500",
  pending_review: "bg-yellow-500",
  approved: "bg-blue-500",
  rejected: "bg-red-500",
  published: "bg-green-500",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  published: "Published",
};

export default function CreatorCourseCard({
  course,
}: {
  course: CreatorCourse;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-base">{course.title}</CardTitle>
          {course.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {course.description}
            </p>
          )}
        </div>
        <Badge
          className={`shrink-0 text-white ${STATUS_COLORS[course.status] ?? "bg-gray-500"}`}
        >
          {STATUS_LABELS[course.status] ?? course.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="space-x-4 text-muted-foreground">
            <span>{course.sparkPrice} sparks</span>
            {course.status === "published" && (
              <>
                <span>{course.totalSales} sales</span>
                <span>{course.totalRevenue} earned</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {course.status === "draft" && (
              <Link
                href={`/creator/submit?edit=${course.id}`}
                className="text-sm text-primary hover:underline"
              >
                Edit
              </Link>
            )}
            {course.status === "published" && (
              <Link
                href={`/learn/${course.id}`}
                className="text-sm text-primary hover:underline"
              >
                View
              </Link>
            )}
          </div>
        </div>
        {course.reviewNotes && course.status === "rejected" && (
          <p className="mt-2 text-xs text-red-600">
            Review notes: {course.reviewNotes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
