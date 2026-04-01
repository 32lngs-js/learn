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
  const { totalXp, dailyStreak, lastQuizDate, longestStreak, quizSession } = body;

  // Upsert user XP
  const { error: xpError } = await supabase
    .from("user_xp")
    .upsert(
      {
        user_id: user.id,
        total_xp: totalXp,
        daily_streak: dailyStreak,
        last_quiz_date: lastQuizDate,
        longest_streak: longestStreak,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (xpError) {
    return NextResponse.json({ error: xpError.message }, { status: 500 });
  }

  // Record quiz session if provided
  if (quizSession) {
    await supabase
      .from("quiz_sessions")
      .upsert(
        {
          user_id: user.id,
          quiz_date: quizSession.date,
          questions_answered: quizSession.questionsAnswered,
          correct_count: quizSession.correctCount,
          xp_earned: quizSession.xpEarned,
        },
        { onConflict: "user_id,quiz_date" }
      );
  }

  return NextResponse.json({ ok: true });
}
