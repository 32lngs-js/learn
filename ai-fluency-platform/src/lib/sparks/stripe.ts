// Stripe client helper for spark purchases and subscriptions

import Stripe from "stripe";
import { getStripeSecretKey } from "./env";
import { PURCHASE_TIERS } from "./config";
import type { SparkPurchaseTier } from "@/types/sparks";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _stripe: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getStripe(): any {
  if (!_stripe) {
    _stripe = new Stripe(getStripeSecretKey(), {
      apiVersion: "2025-03-31.basil",
    });
  }
  return _stripe;
}

export { getStripe };

/**
 * Create a Stripe checkout session for a one-time spark pack purchase.
 */
export async function createSparkPurchaseSession(options: {
  userId: string;
  tier: SparkPurchaseTier;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const stripe = getStripe();
  const { userId, tier, successUrl, cancelUrl } = options;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${tier.label} Spark Pack`,
            description: `${tier.sparks} Sparks + ${tier.bonusSparks} bonus`,
          },
          unit_amount: Math.round(tier.priceUsd * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      tierId: tier.id,
      sparkAmount: String(tier.sparks + tier.bonusSparks),
      type: "spark_purchase",
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session URL");
  }

  return session.url;
}

/**
 * Create a Stripe checkout session for Spark Pass subscription.
 */
export async function createSubscriptionSession(options: {
  userId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const stripe = getStripe();
  const { userId, successUrl, cancelUrl } = options;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Spark Pass",
            description:
              "2x spark earnings, daily bonus sparks, increased daily cap",
          },
          unit_amount: 999, // $9.99/month
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      type: "spark_pass",
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  if (!session.url) {
    throw new Error("Failed to create subscription session URL");
  }

  return session.url;
}

/**
 * Look up a purchase tier by ID.
 */
export function getTierById(tierId: string): SparkPurchaseTier | undefined {
  return PURCHASE_TIERS.find((t) => t.id === tierId);
}

/**
 * Cancel a Stripe subscription at period end.
 */
export async function cancelSubscription(
  subscriptionId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const stripe = getStripe();
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}
