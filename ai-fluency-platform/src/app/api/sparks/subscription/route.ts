import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import {
  createSubscriptionSession,
  cancelSubscription,
} from "@/lib/sparks/stripe";

// GET: Return current subscription status
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("plan_id", "spark_pass")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    subscription: data
      ? {
          id: data.id,
          status: data.status,
          startedAt: data.started_at,
          expiresAt: data.expires_at,
          externalId: data.external_id,
        }
      : null,
  });
}

// POST: Create Stripe checkout session for Spark Pass
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check for existing active subscription
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("plan_id", "spark_pass")
    .eq("status", "active")
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Already have an active subscription" },
      { status: 409 }
    );
  }

  try {
    const origin = request.headers.get("origin") || "http://localhost:3000";
    const checkoutUrl = await createSubscriptionSession({
      userId: user.id,
      successUrl: `${origin}/shop?subscription=success`,
      cancelUrl: `${origin}/shop?subscription=cancelled`,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("Subscription checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT: Cancel subscription at period end
export async function PUT() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: sub, error: fetchError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("plan_id", "spark_pass")
    .eq("status", "active")
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!sub || !sub.external_id) {
    return NextResponse.json(
      { error: "No active subscription found" },
      { status: 404 }
    );
  }

  try {
    await cancelSubscription(sub.external_id);

    await supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("id", sub.id);

    return NextResponse.json({ cancelled: true, expiresAt: sub.expires_at });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cancellation failed";
    console.error("Subscription cancel error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
