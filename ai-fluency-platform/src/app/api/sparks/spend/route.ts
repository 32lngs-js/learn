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
  const { txType, amount, idempotencyKey, metadata } = body;

  if (!txType || !amount || !idempotencyKey) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("spend_sparks", {
    p_user_id: user.id,
    p_tx_type: txType,
    p_amount: amount,
    p_idempotency_key: idempotencyKey,
    p_metadata: metadata ?? {},
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = data?.[0] ?? { success: false, new_balance: 0 };

  return NextResponse.json({
    success: result.success,
    newBalance: result.new_balance,
  });
}
