"use client";

import { useState, useCallback, useEffect } from "react";
import { getSparkStore, addSparks, spendSparks } from "./store";
import { syncSparkEarn, syncSparkSpend, syncSparkBalance } from "./db-sync";
import { generateIdempotencyKey } from "./idempotency";
import type { SparkTxType } from "@/types/sparks";

export function useSparks() {
  const [balance, setBalance] = useState(0);
  const [lifetimeEarned, setLifetimeEarned] = useState(0);
  const [isSubscriber, setIsSubscriber] = useState(false);

  const refresh = useCallback(() => {
    const store = getSparkStore();
    setBalance(store.balance);
    setLifetimeEarned(store.lifetimeEarned);
    if (typeof window !== "undefined") {
      try {
        setIsSubscriber(localStorage.getItem("aif_subscriber") === "true");
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    refresh();
    // Sync from DB on mount
    syncSparkBalance();
  }, [refresh]);

  // Poll for changes from other components
  useEffect(() => {
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  const earn = useCallback(
    (amount: number, txType: SparkTxType, key: string, metadata: Record<string, unknown> = {}) => {
      const result = addSparks(amount, txType, key, metadata);
      syncSparkEarn(txType, amount, key, metadata);
      refresh();
      return result;
    },
    [refresh]
  );

  const spend = useCallback(
    (amount: number, txType: SparkTxType, key: string, metadata: Record<string, unknown> = {}) => {
      const result = spendSparks(amount, txType, key, metadata);
      if (result.success) {
        syncSparkSpend(txType, amount, key, metadata);
      }
      refresh();
      return result;
    },
    [refresh]
  );

  return {
    balance,
    lifetimeEarned,
    isSubscriber,
    earn,
    spend,
    refresh,
  };
}
