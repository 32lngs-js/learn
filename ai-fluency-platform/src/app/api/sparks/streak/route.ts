import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("update_streak", {
    p_user_id: user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = data?.[0] ?? {
    new_streak: 0,
    was_frozen: false,
    is_degraded: false,
    freezes_left: 0,
  };

  return NextResponse.json({
    newStreak: result.new_streak,
    wasFrozen: result.was_frozen,
    isDegraded: result.is_degraded,
    freezesLeft: result.freezes_left,
  });
}
