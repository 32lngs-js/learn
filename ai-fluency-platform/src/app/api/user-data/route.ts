import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [progressRes, interactionsRes, xpRes, quizSessionsRes, questionHistoryRes] =
    await Promise.all([
      supabase
        .from("module_progress")
        .select("module_path, level_id, completed, completed_at, interactions_completed, interactions_total")
        .eq("user_id", user.id),
      supabase
        .from("interaction_responses")
        .select("module_path, interaction_type, interaction_index, user_input, ai_feedback, created_at")
        .eq("user_id", user.id),
      supabase.from("user_xp").select("*").eq("user_id", user.id).single(),
      supabase
        .from("quiz_sessions")
        .select("quiz_date, questions_answered, correct_count, xp_earned")
        .eq("user_id", user.id)
        .order("quiz_date", { ascending: false })
        .limit(30),
      supabase
        .from("quiz_question_history")
        .select("question_id, last_seen, next_due, box, correct_streak, total_seen, total_correct")
        .eq("user_id", user.id),
    ]);

  // Build progress store shape
  const modules: Record<string, unknown> = {};
  for (const row of progressRes.data || []) {
    modules[row.module_path] = {
      modulePath: row.module_path,
      levelId: row.level_id,
      completed: row.completed,
      completedAt: row.completed_at,
      interactions: {},
    };
  }

  // Attach interactions to their modules
  for (const row of interactionsRes.data || []) {
    const key = `${row.interaction_type}-${row.interaction_index}`;
    if (modules[row.module_path]) {
      (modules[row.module_path] as Record<string, unknown>).interactions =
        (modules[row.module_path] as Record<string, Record<string, unknown>>).interactions || {};
      (modules[row.module_path] as Record<string, Record<string, unknown>>).interactions[key] = {
        completed: true,
        userInput: row.user_input,
        aiFeedback: row.ai_feedback,
        completedAt: row.created_at,
      };
    }
  }

  // Build XP store shape
  const xpRow = xpRes.data;
  const xp = xpRow
    ? {
        totalXp: xpRow.total_xp,
        dailyStreak: xpRow.daily_streak,
        lastQuizDate: xpRow.last_quiz_date,
        longestStreak: xpRow.longest_streak,
      }
    : null;

  // Build quiz sessions (maps to quizHistory in XP store)
  const quizSessions = (quizSessionsRes.data || []).map((s) => ({
    date: s.quiz_date,
    questionsAnswered: s.questions_answered,
    correctCount: s.correct_count,
    xpEarned: s.xp_earned,
  }));

  // Build quiz question history (spaced repetition)
  const questionHistory: Record<string, unknown> = {};
  for (const row of questionHistoryRes.data || []) {
    questionHistory[row.question_id] = {
      lastSeen: row.last_seen,
      nextDue: row.next_due,
      box: row.box,
      correctStreak: row.correct_streak,
      totalSeen: row.total_seen,
      totalCorrect: row.total_correct,
    };
  }

  // Provider preference
  const provider = xpRow?.provider || "claude-code";

  return NextResponse.json({
    progress: { modules },
    xp,
    quizSessions,
    quizHistory: { questions: questionHistory },
    provider,
  });
}
