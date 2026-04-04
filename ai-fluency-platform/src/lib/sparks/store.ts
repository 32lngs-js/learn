"use client";

import type { SparkStore, SparkTxType, PendingSparkTx } from "@/types/sparks";

const SPARKS_KEY = "aif_sparks";

const DEFAULT_STORE: SparkStore = {
  balance: 0,
  lifetimeEarned: 0,
  lifetimeSpent: 0,
  pendingTransactions: [],
};

function getStore(): SparkStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(SPARKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupted data
  }
  return { ...DEFAULT_STORE };
}

function saveStore(store: SparkStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SPARKS_KEY, JSON.stringify(store));
}

export function getSparkStore(): SparkStore {
  return getStore();
}

export function saveSparkStore(store: SparkStore): void {
  saveStore(store);
}

export function getBalance(): number {
  return getStore().balance;
}

export function addSparks(
  amount: number,
  txType: SparkTxType,
  idempotencyKey: string,
  metadata: Record<string, unknown> = {}
): { newBalance: number } {
  const store = getStore();

  // Skip if already processed (idempotency)
  if (store.pendingTransactions.some((tx) => tx.idempotencyKey === idempotencyKey)) {
    return { newBalance: store.balance };
  }

  store.balance += amount;
  store.lifetimeEarned += amount;
  store.pendingTransactions.push({
    txType,
    amount,
    idempotencyKey,
    metadata,
    createdAt: new Date().toISOString(),
  });

  saveStore(store);
  return { newBalance: store.balance };
}

export function spendSparks(
  amount: number,
  txType: SparkTxType,
  idempotencyKey: string,
  metadata: Record<string, unknown> = {}
): { success: boolean; newBalance: number } {
  const store = getStore();

  // Skip if already processed (idempotency)
  if (store.pendingTransactions.some((tx) => tx.idempotencyKey === idempotencyKey)) {
    return { success: false, newBalance: store.balance };
  }

  if (store.balance < amount) {
    return { success: false, newBalance: store.balance };
  }

  store.balance -= amount;
  store.lifetimeSpent += amount;
  store.pendingTransactions.push({
    txType,
    amount: -amount,
    idempotencyKey,
    metadata,
    createdAt: new Date().toISOString(),
  });

  saveStore(store);
  return { success: true, newBalance: store.balance };
}

export function getPendingTransactions(): PendingSparkTx[] {
  return getStore().pendingTransactions;
}

export function clearPendingTransaction(idempotencyKey: string): void {
  const store = getStore();
  store.pendingTransactions = store.pendingTransactions.filter(
    (tx) => tx.idempotencyKey !== idempotencyKey
  );
  saveStore(store);
}
