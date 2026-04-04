import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { courseId } = body;

  if (!courseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  }

  // Fetch course
  const { data: course, error: courseError } = await supabase
    .from("creator_courses")
    .select("*")
    .eq("id", courseId)
    .eq("status", "published")
    .single();

  if (courseError || !course) {
    return NextResponse.json(
      { error: "Course not found or not published" },
      { status: 404 }
    );
  }

  // Check if already purchased
  const { data: existing } = await supabase
    .from("course_unlocks")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Course already purchased" },
      { status: 409 }
    );
  }

  // Cannot buy your own course
  if (course.creator_id === user.id) {
    return NextResponse.json(
      { error: "Cannot purchase your own course" },
      { status: 400 }
    );
  }

  const sparkPrice = course.spark_price as number;
  const creatorShare = Math.floor(sparkPrice * 0.7);
  const platformShare = sparkPrice - creatorShare;
  const idempotencyKey = `creator_purchase_${user.id}_${courseId}`;

  // Spend sparks from buyer
  const { data: spendResult, error: spendError } = await supabase.rpc(
    "spend_sparks",
    {
      p_user_id: user.id,
      p_tx_type: "course_unlock",
      p_amount: sparkPrice,
      p_idempotency_key: idempotencyKey,
      p_metadata: { courseId, creatorId: course.creator_id },
    }
  );

  if (spendError) {
    return NextResponse.json({ error: spendError.message }, { status: 500 });
  }

  const result = spendResult?.[0] ?? { success: false, new_balance: 0 };
  if (!result.success) {
    return NextResponse.json(
      { error: "Insufficient sparks" },
      { status: 402 }
    );
  }

  // Record course unlock
  const { error: unlockError } = await supabase.from("course_unlocks").insert({
    user_id: user.id,
    course_id: courseId,
    unlock_method: "creator_purchase",
    spark_cost: sparkPrice,
  });

  if (unlockError) {
    console.error("Failed to record course unlock:", unlockError.message);
  }

  // Record creator payout
  const { error: payoutError } = await supabase
    .from("creator_payouts")
    .insert({
      creator_id: course.creator_id,
      course_id: courseId,
      buyer_id: user.id,
      total_sparks: sparkPrice,
      creator_share: creatorShare,
      platform_share: platformShare,
    });

  if (payoutError) {
    console.error("Failed to record creator payout:", payoutError.message);
  }

  // Credit creator's wallet with their 70% share
  const creatorIdempotencyKey = `creator_revenue_${user.id}_${courseId}`;
  const { error: earnError } = await supabase.rpc("earn_sparks", {
    p_user_id: course.creator_id,
    p_tx_type: "creator_revenue",
    p_amount: creatorShare,
    p_idempotency_key: creatorIdempotencyKey,
    p_metadata: { courseId, buyerId: user.id, platformShare },
  });

  if (earnError) {
    console.error("Failed to credit creator:", earnError.message);
  }

  // Update course sales stats
  await supabase
    .from("creator_courses")
    .update({
      total_sales: (course.total_sales ?? 0) + 1,
      total_revenue: (course.total_revenue ?? 0) + creatorShare,
      updated_at: new Date().toISOString(),
    })
    .eq("id", courseId);

  return NextResponse.json({
    success: true,
    newBalance: result.new_balance,
    courseId,
  });
}
