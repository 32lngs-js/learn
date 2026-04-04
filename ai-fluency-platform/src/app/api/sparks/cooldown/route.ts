import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courseId = request.nextUrl.searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("cooldown_state")
    .select("lessons_used_today, next_lesson_available, cooldown_date")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .eq("cooldown_date", today)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    lessonsUsedToday: data?.lessons_used_today ?? 0,
    nextLessonAvailable: data?.next_lesson_available ?? null,
    cooldownDate: data?.cooldown_date ?? today,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { courseId, action } = body;

  if (!courseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  }

  if (action === "skip") {
    // Skip cooldown by spending sparks
    const { data, error } = await supabase.rpc("spend_sparks", {
      p_user_id: user.id,
      p_tx_type: "cooldown_skip",
      p_amount: 25,
      p_idempotency_key: `${user.id}:cooldown_skip:${courseId}:${new Date().toISOString().slice(0, 10)}`,
      p_metadata: { courseId },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = data?.[0] ?? { success: false, new_balance: 0 };

    if (result.success) {
      // Reset cooldown
      const today = new Date().toISOString().slice(0, 10);
      await supabase
        .from("cooldown_state")
        .update({ next_lesson_available: null })
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .eq("cooldown_date", today);
    }

    return NextResponse.json({
      success: result.success,
      newBalance: result.new_balance,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
