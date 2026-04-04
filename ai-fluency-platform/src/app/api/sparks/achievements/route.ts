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

  // Fetch all achievement definitions
  const { data: definitions, error: defError } = await supabase
    .from("achievement_definitions")
    .select("*")
    .order("sort_order");

  if (defError) {
    return NextResponse.json({ error: defError.message }, { status: 500 });
  }

  // Fetch user's earned achievements
  const { data: earned, error: earnedError } = await supabase
    .from("user_achievements")
    .select("achievement_id, earned_at")
    .eq("user_id", user.id);

  if (earnedError) {
    return NextResponse.json({ error: earnedError.message }, { status: 500 });
  }

  const earnedMap = new Map(
    (earned ?? []).map((e: { achievement_id: string; earned_at: string }) => [
      e.achievement_id,
      e.earned_at,
    ])
  );

  const achievements = (definitions ?? []).map(
    (d: {
      id: string;
      name: string;
      description: string;
      icon: string;
      spark_reward: number;
      category: string;
      criteria: Record<string, unknown>;
      sort_order: number;
    }) => ({
      ...d,
      earned: earnedMap.has(d.id),
      earnedAt: earnedMap.get(d.id) ?? null,
    })
  );

  return NextResponse.json({ achievements });
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
  const { achievementId } = body;

  if (!achievementId) {
    return NextResponse.json({ error: "Missing achievementId" }, { status: 400 });
  }

  // Record the achievement
  const { error: insertError } = await supabase
    .from("user_achievements")
    .upsert(
      { user_id: user.id, achievement_id: achievementId },
      { onConflict: "user_id,achievement_id" }
    );

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Look up the spark reward
  const { data: def } = await supabase
    .from("achievement_definitions")
    .select("spark_reward")
    .eq("id", achievementId)
    .single();

  // Award sparks for the achievement
  if (def?.spark_reward) {
    await supabase.rpc("earn_sparks", {
      p_user_id: user.id,
      p_tx_type: "achievement_earned",
      p_amount: def.spark_reward,
      p_idempotency_key: `${user.id}:achievement_earned:${achievementId}`,
      p_metadata: { achievementId },
    });
  }

  return NextResponse.json({ ok: true });
}
