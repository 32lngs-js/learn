import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createSparkPurchaseSession, getTierById } from "@/lib/sparks/stripe";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { tierId } = body;

  if (!tierId) {
    return NextResponse.json({ error: "Missing tierId" }, { status: 400 });
  }

  const tier = getTierById(tierId);
  if (!tier) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  try {
    const origin = request.headers.get("origin") || "http://localhost:3000";
    const checkoutUrl = await createSparkPurchaseSession({
      userId: user.id,
      tier,
      successUrl: `${origin}/shop?success=true`,
      cancelUrl: `${origin}/shop?cancelled=true`,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("Spark purchase checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
