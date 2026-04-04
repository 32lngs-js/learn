"use client";

import type { SparkTxType } from "@/types/sparks";
import { saveSparkStore, getSparkStore } from "./store";

// Fire-and-forget helpers for syncing spark transactions to Supabase.
// These never block the UI — failures are silent (DB is secondary to localStorage for UX).

export function syncSparkEarn(
  txType: SparkTxType,
  amount: number,
  idempotencyKey: string,
  metadata: Record<string, unknown> = {}
) {
  fetch("/api/sparks/earn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ txType, amount, idempotencyKey, metadata }),
  }).catch(() => {});
}

export function syncSparkSpend(
  txType: SparkTxType,
  amount: number,
  idempotencyKey: string,
  metadata: Record<string, unknown> = {}
) {
  fetch("/api/sparks/spend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ txType, amount, idempotencyKey, metadata }),
  }).catch(() => {});
}

export function syncSparkBalance() {
  fetch("/api/sparks/balance")
    .then((res) => res.json())
    .then((data: { balance?: number; lifetimeEarned?: number; lifetimeSpent?: number }) => {
      if (data.balance !== undefined) {
        const store = getSparkStore();
        store.balance = data.balance;
        if (data.lifetimeEarned !== undefined) store.lifetimeEarned = data.lifetimeEarned;
        if (data.lifetimeSpent !== undefined) store.lifetimeSpent = data.lifetimeSpent;
        saveSparkStore(store);
      }
    })
    .catch(() => {});
}
