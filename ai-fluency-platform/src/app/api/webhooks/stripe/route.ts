import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/sparks/stripe";
import { getStripeWebhookSecret } from "@/lib/sparks/env";
import { createClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminSupabase = ReturnType<typeof createClient<any>>;

// Use service-role client for webhook processing (no user session)
function getAdminSupabase(): AdminSupabase {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase service role configuration");
  }
  return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret()
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getAdminSupabase();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const metadata = session.metadata ?? {};

        if (metadata.type === "spark_purchase") {
          await handleSparkPurchase(supabase, event.id, metadata);
        }
        // spark_pass subscriptions are handled by subscription.created event
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(supabase, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if (invoice.subscription) {
          console.log(
            "Subscription renewal payment succeeded:",
            invoice.subscription
          );
        }
        break;
      }

      default:
        // Return 200 for unhandled events
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook handler error for ${event.type}:`, message);
    // Still return 200 to prevent Stripe retries for processing errors
  }

  return NextResponse.json({ received: true });
}

async function handleSparkPurchase(
  supabase: AdminSupabase,
  eventId: string,
  metadata: Record<string, string>
) {
  const userId = metadata.userId;
  const sparkAmount = parseInt(metadata.sparkAmount, 10);
  const tierId = metadata.tierId;

  if (!userId || !sparkAmount || isNaN(sparkAmount)) {
    console.error("Invalid spark purchase metadata:", metadata);
    return;
  }

  // Use Stripe event ID as idempotency key
  const idempotencyKey = `stripe_${eventId}`;

  const { error } = await supabase.rpc("earn_sparks", {
    p_user_id: userId,
    p_tx_type: "spark_purchase",
    p_amount: sparkAmount,
    p_idempotency_key: idempotencyKey,
    p_metadata: { tierId, stripeEventId: eventId },
  });

  if (error) {
    console.error("Failed to credit sparks:", error.message);
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionUpdate(supabase: AdminSupabase, subscription: any) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("Subscription missing userId metadata:", subscription.id);
    return;
  }

  const isActive = subscription.status === "active";
  const currentPeriodEnd = new Date(
    subscription.current_period_end * 1000
  ).toISOString();

  // Upsert subscription record
  const { error: subError } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan_id: "spark_pass",
      status: isActive ? "active" : "cancelled",
      external_id: subscription.id,
      payment_provider: "stripe",
      expires_at: currentPeriodEnd,
    } as Record<string, unknown>,
    { onConflict: "user_id,plan_id" }
  );

  if (subError) {
    console.error("Failed to upsert subscription:", subError.message);
  }

  // Update wallet subscriber status
  const { error: walletError } = await supabase
    .from("spark_wallets")
    .upsert(
      {
        user_id: userId,
        is_subscriber: isActive,
        subscriber_since: isActive ? new Date().toISOString() : undefined,
        subscriber_until: currentPeriodEnd,
      } as Record<string, unknown>,
      { onConflict: "user_id" }
    );

  if (walletError) {
    console.error(
      "Failed to update wallet subscriber status:",
      walletError.message
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionDeleted(supabase: AdminSupabase, subscription: any) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("Subscription missing userId metadata:", subscription.id);
    return;
  }

  // Mark subscription as expired
  const { error: subError } = await supabase
    .from("subscriptions")
    .update({ status: "expired" } as Record<string, unknown>)
    .eq("external_id", subscription.id);

  if (subError) {
    console.error("Failed to expire subscription:", subError.message);
  }

  // Unset subscriber flag on wallet
  const { error: walletError } = await supabase
    .from("spark_wallets")
    .update({
      is_subscriber: false,
      subscriber_until: new Date().toISOString(),
    } as Record<string, unknown>)
    .eq("user_id", userId);

  if (walletError) {
    console.error("Failed to unset subscriber status:", walletError.message);
  }
}
