import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const CREATOR_MIN_COURSES = 3;
const CREATOR_MIN_SPARKS = 500;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Count completed courses (distinct courses with all lessons done)
  // Use course_unlocks as a proxy for completed courses
  const { count: coursesCompleted } = await supabase
    .from("course_unlocks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get lifetime sparks earned
  const { data: wallet } = await supabase
    .from("spark_wallets")
    .select("lifetime_earned")
    .eq("user_id", user.id)
    .maybeSingle();

  const lifetimeSparks = wallet?.lifetime_earned ?? 0;
  const courses = coursesCompleted ?? 0;

  const eligible =
    courses >= CREATOR_MIN_COURSES || lifetimeSparks >= CREATOR_MIN_SPARKS;

  return NextResponse.json({
    eligible,
    coursesCompleted: courses,
    lifetimeSparks,
    requiresCourses: CREATOR_MIN_COURSES,
    requiresSparks: CREATOR_MIN_SPARKS,
  });
}
