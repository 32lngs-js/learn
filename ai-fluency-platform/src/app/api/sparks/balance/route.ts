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

  const { data, error } = await supabase
    .from("spark_wallets")
    .select("balance, lifetime_earned, lifetime_spent, is_subscriber")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found (new user)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    balance: data?.balance ?? 0,
    lifetimeEarned: data?.lifetime_earned ?? 0,
    lifetimeSpent: data?.lifetime_spent ?? 0,
    isSubscriber: data?.is_subscriber ?? false,
  });
}
