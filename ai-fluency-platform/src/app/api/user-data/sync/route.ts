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
  const { progress, xp, quizHistory, provider } = body;

  // Sync progress modules + interactions
  if (progress?.modules) {
    for (const [modulePath, mod] of Object.entries(progress.modules) as [string, Record<string, unknown>][]) {
      const interactions = (mod.interactions || {}) as Record<
        string,
        { completed?: boolean; userInput?: string; aiFeedback?: string }
      >;
      const interactionEntries = Object.entries(interactions);
      const interactionsCompleted = interactionEntries.filter(([, v]) => v.completed).length;

      await supabase
        .from("module_progress")
        .upsert(
          {
            user_id: user.id,
            module_path: modulePath,
            level_id: (mod.levelId as string) || "",
            completed: (mod.completed as boolean) || false,
            completed_at: (mod.completedAt as string) || null,
            interactions_completed: interactionsCompleted,
            interactions_total: interactionEntries.length,
          },
          { onConflict: "user_id,module_path" }
        );

      for (const [key, value] of interactionEntries) {
        const parts = key.split("-");
        const interactionIndex = parseInt(parts.pop() || "0", 10);
        const interactionType = parts.join("-");

        await supabase
          .from("interaction_responses")
          .upsert(
            {
              user_id: user.id,
              module_path: modulePath,
              interaction_type: interactionType,
              interaction_index: interactionIndex,
              user_input: value.userInput || "",
              ai_feedback: value.aiFeedback || null,
            },
            { onConflict: "user_id,module_path,interaction_type,interaction_index" }
          );
      }
    }
  }

  // Sync XP
  if (xp) {
    await supabase
      .from("user_xp")
      .upsert(
        {
          user_id: user.id,
          total_xp: xp.totalXp || 0,
          daily_streak: xp.dailyStreak || 0,
          last_quiz_date: xp.lastQuizDate || null,
          longest_streak: xp.longestStreak || 0,
          provider: provider || "claude-code",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    // Sync quiz history (from XP store's quizHistory array)
    if (xp.quizHistory) {
      for (const session of xp.quizHistory as Record<string, unknown>[]) {
        await supabase
          .from("quiz_sessions")
          .upsert(
            {
              user_id: user.id,
              quiz_date: session.date as string,
              questions_answered: (session.questionsAnswered as number) || 0,
              correct_count: (session.correctCount as number) || 0,
              xp_earned: (session.xpEarned as number) || 0,
            },
            { onConflict: "user_id,quiz_date" }
          );
      }
    }
  }

  // Sync spaced repetition question history
  if (quizHistory?.questions) {
    for (const [questionId, record] of Object.entries(quizHistory.questions) as [string, Record<string, unknown>][]) {
      await supabase
        .from("quiz_question_history")
        .upsert(
          {
            user_id: user.id,
            question_id: questionId,
            last_seen: record.lastSeen as string,
            next_due: record.nextDue as string,
            box: (record.box as number) || 0,
            correct_streak: (record.correctStreak as number) || 0,
            total_seen: (record.totalSeen as number) || 0,
            total_correct: (record.totalCorrect as number) || 0,
          },
          { onConflict: "user_id,question_id" }
        );
    }
  }

  return NextResponse.json({ ok: true });
}
