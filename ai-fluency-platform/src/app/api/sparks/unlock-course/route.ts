import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("course_unlocks")
    .select("course_id, unlocked_at, unlock_method, spark_cost")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const unlocks = (data ?? []).map(
    (row: {
      course_id: string;
      unlocked_at: string;
      unlock_method: string;
      spark_cost: number;
    }) => ({
      courseId: row.course_id,
      unlockedAt: row.unlocked_at,
      unlockMethod: row.unlock_method,
      sparkCost: row.spark_cost,
    })
  );

  return NextResponse.json({ unlocks });
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
  const { courseId, sparkCost } = body;

  if (!courseId || sparkCost === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Check if already unlocked
  const { data: existing } = await supabase
    .from("course_unlocks")
    .select("course_id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (existing) {
    return NextResponse.json({ success: true, alreadyUnlocked: true });
  }

  // Spend sparks
  const idempotencyKey = `${user.id}:course_unlock:${courseId}`;
  const { data: spendResult, error: spendError } = await supabase.rpc("spend_sparks", {
    p_user_id: user.id,
    p_tx_type: "course_unlock",
    p_amount: sparkCost,
    p_idempotency_key: idempotencyKey,
    p_metadata: { courseId },
  });

  if (spendError) {
    return NextResponse.json({ error: spendError.message }, { status: 500 });
  }

  const result = spendResult?.[0] ?? { success: false, new_balance: 0 };

  if (!result.success) {
    return NextResponse.json({
      success: false,
      newBalance: result.new_balance,
      error: "Insufficient sparks",
    });
  }

  // Record the unlock
  const { error: unlockError } = await supabase.from("course_unlocks").insert({
    user_id: user.id,
    course_id: courseId,
    unlock_method: "sparks",
    spark_cost: sparkCost,
  });

  if (unlockError) {
    return NextResponse.json({ error: unlockError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    newBalance: result.new_balance,
  });
}
