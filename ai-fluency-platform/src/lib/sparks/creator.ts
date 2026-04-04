"use client";

import type { CreatorCourse } from "@/types/sparks";

const CREATOR_MIN_COURSES = 3;
const CREATOR_MIN_SPARKS = 500;

/**
 * Check if the current user meets creator eligibility requirements.
 * Requirements: 3+ completed courses OR 500+ lifetime sparks earned.
 */
export async function isCreatorEligible(): Promise<{
  eligible: boolean;
  coursesCompleted: number;
  lifetimeSparks: number;
  requiresCourses: number;
  requiresSparks: number;
}> {
  try {
    const res = await fetch("/api/creator/eligibility");
    if (!res.ok) {
      return {
        eligible: false,
        coursesCompleted: 0,
        lifetimeSparks: 0,
        requiresCourses: CREATOR_MIN_COURSES,
        requiresSparks: CREATOR_MIN_SPARKS,
      };
    }
    return res.json();
  } catch {
    return {
      eligible: false,
      coursesCompleted: 0,
      lifetimeSparks: 0,
      requiresCourses: CREATOR_MIN_COURSES,
      requiresSparks: CREATOR_MIN_SPARKS,
    };
  }
}

/**
 * Get the current user's submitted creator courses.
 */
export async function getCreatorCourses(): Promise<CreatorCourse[]> {
  try {
    const res = await fetch("/api/creator/courses");
    if (!res.ok) return [];
    const data = await res.json();
    return data.courses ?? [];
  } catch {
    return [];
  }
}

/**
 * Submit a new course for review.
 */
export async function submitCourse(
  title: string,
  description: string,
  content: Record<string, unknown>,
  sparkPrice: number
): Promise<{ success: boolean; courseId?: string; error?: string }> {
  try {
    const res = await fetch("/api/creator/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, content, sparkPrice }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error ?? "Submission failed" };
    }
    return { success: true, courseId: data.courseId };
  } catch {
    return { success: false, error: "Network error" };
  }
}
