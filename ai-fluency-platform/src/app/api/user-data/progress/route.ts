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
  const { modulePath, levelId, completed, completedAt, interactions } = body;

  if (!modulePath || !levelId) {
    return NextResponse.json({ error: "Missing modulePath or levelId" }, { status: 400 });
  }

  const interactionEntries = Object.entries(interactions || {}) as [
    string,
    { completed?: boolean; userInput?: string; aiFeedback?: string; completedAt?: string }
  ][];

  const interactionsCompleted = interactionEntries.filter(([, v]) => v.completed).length;

  // Upsert module progress
  const { error: progressError } = await supabase
    .from("module_progress")
    .upsert(
      {
        user_id: user.id,
        module_path: modulePath,
        level_id: levelId,
        completed: completed || false,
        completed_at: completedAt || null,
        interactions_completed: interactionsCompleted,
        interactions_total: interactionEntries.length,
      },
      { onConflict: "user_id,module_path" }
    );

  if (progressError) {
    return NextResponse.json({ error: progressError.message }, { status: 500 });
  }

  // Upsert each interaction
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

  return NextResponse.json({ ok: true });
}
