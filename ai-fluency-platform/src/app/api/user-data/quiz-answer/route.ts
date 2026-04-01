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
  const { questionId, lastSeen, nextDue, box, correctStreak, totalSeen, totalCorrect } = body;

  if (!questionId) {
    return NextResponse.json({ error: "Missing questionId" }, { status: 400 });
  }

  const { error } = await supabase
    .from("quiz_question_history")
    .upsert(
      {
        user_id: user.id,
        question_id: questionId,
        last_seen: lastSeen,
        next_due: nextDue,
        box,
        correct_streak: correctStreak,
        total_seen: totalSeen,
        total_correct: totalCorrect,
      },
      { onConflict: "user_id,question_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
