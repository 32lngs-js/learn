"use client";

import type { XpStore, QuizHistoryEntry, RankTier } from "@/types/review";
import { syncXp } from "./db-sync";

const XP_KEY = "aif_xp";

export const RANK_TIERS: RankTier[] = [
  { name: "Curious Beginner", minXp: 0, emoji: "\u2728", color: "text-slate-500" },
  { name: "Active Learner", minXp: 50, emoji: "\ud83c\udf31", color: "text-green-500" },
  { name: "Rising Scholar", minXp: 150, emoji: "\u2b50", color: "text-yellow-500" },
  { name: "Knowledge Builder", minXp: 350, emoji: "\ud83d\udd28", color: "text-orange-500" },
  { name: "Dedicated Thinker", minXp: 600, emoji: "\ud83e\udde0", color: "text-pink-500" },
  { name: "Wisdom Seeker", minXp: 1000, emoji: "\ud83d\udd2d", color: "text-blue-500" },
  { name: "Knowledge Champion", minXp: 1500, emoji: "\ud83c\udfc6", color: "text-amber-500" },
  { name: "Grand Master", minXp: 2500, emoji: "\ud83d\udc51", color: "text-purple-500" },
];

const DEFAULT_STORE: XpStore = {
  totalXp: 0,
  dailyStreak: 0,
  lastQuizDate: null,
  longestStreak: 0,
  quizHistory: [],
};

function getStore(): XpStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(XP_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupted data
  }
  return { ...DEFAULT_STORE };
}

function saveStore(store: XpStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(XP_KEY, JSON.stringify(store));
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getXpStore(): XpStore {
  return getStore();
}

export function getCurrentRank(): RankTier {
  const store = getStore();
  let rank = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (store.totalXp >= tier.minXp) rank = tier;
  }
  return rank;
}

export function getNextRank(): RankTier | null {
  const store = getStore();
  for (const tier of RANK_TIERS) {
    if (store.totalXp < tier.minXp) return tier;
  }
  return null;
}

export function getXpProgress(): {
  current: number;
  nextThreshold: number;
  percentage: number;
  currentRank: RankTier;
  nextRank: RankTier | null;
} {
  const store = getStore();
  const currentRank = getCurrentRank();
  const nextRank = getNextRank();

  if (!nextRank) {
    return {
      current: store.totalXp,
      nextThreshold: currentRank.minXp,
      percentage: 100,
      currentRank,
      nextRank: null,
    };
  }

  const rangeStart = currentRank.minXp;
  const rangeEnd = nextRank.minXp;
  const progress = store.totalXp - rangeStart;
  const range = rangeEnd - rangeStart;
  const percentage = Math.min(100, Math.round((progress / range) * 100));

  return {
    current: store.totalXp,
    nextThreshold: nextRank.minXp,
    percentage,
    currentRank,
    nextRank,
  };
}

export function addXp(amount: number): {
  newTotal: number;
  rankUp: boolean;
  newRank: RankTier;
  previousRank: RankTier;
} {
  const previousRank = getCurrentRank();
  const store = getStore();
  store.totalXp += amount;
  saveStore(store);
  const newRank = getCurrentRank();

  return {
    newTotal: store.totalXp,
    rankUp: newRank.minXp > previousRank.minXp,
    newRank,
    previousRank,
  };
}

export function shouldShowQuiz(): boolean {
  const store = getStore();
  return store.lastQuizDate !== getTodayString();
}

export function dismissQuiz(): void {
  const store = getStore();
  store.lastQuizDate = getTodayString();
  saveStore(store);
}

export function updateStreak(): { streak: number; isNewDay: boolean } {
  const store = getStore();
  const today = getTodayString();
  const yesterday = getYesterdayString();

  if (store.lastQuizDate === today) {
    return { streak: store.dailyStreak, isNewDay: false };
  }

  if (store.lastQuizDate === yesterday) {
    store.dailyStreak += 1;
  } else if (store.lastQuizDate !== null) {
    store.dailyStreak = 1;
  } else {
    store.dailyStreak = 1;
  }

  if (store.dailyStreak > store.longestStreak) {
    store.longestStreak = store.dailyStreak;
  }

  store.lastQuizDate = today;
  saveStore(store);

  return { streak: store.dailyStreak, isNewDay: true };
}

export function recordQuiz(entry: QuizHistoryEntry): void {
  const store = getStore();
  store.quizHistory = [entry, ...store.quizHistory].slice(0, 30);
  saveStore(store);

  // Sync full XP state + this quiz session to DB
  syncXp(store.totalXp, store.dailyStreak, store.lastQuizDate, store.longestStreak, {
    date: entry.date,
    questionsAnswered: entry.questionsAnswered,
    correctCount: entry.correctCount,
    xpEarned: entry.xpEarned,
  });
}
