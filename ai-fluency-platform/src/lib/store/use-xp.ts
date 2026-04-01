"use client";

import { useState, useCallback, useEffect } from "react";
import type { RankTier } from "@/types/review";
import {
  getXpStore,
  getCurrentRank,
  getNextRank,
  getXpProgress,
  addXp as addXpToStore,
  RANK_TIERS,
} from "./xp";

export function useXp() {
  const [totalXp, setTotalXp] = useState(0);
  const [currentRank, setCurrentRank] = useState<RankTier>(RANK_TIERS[0]);
  const [nextRank, setNextRank] = useState<RankTier | null>(RANK_TIERS[1]);
  const [xpPercentage, setXpPercentage] = useState(0);

  const refresh = useCallback(() => {
    const store = getXpStore();
    setTotalXp(store.totalXp);
    setCurrentRank(getCurrentRank());
    setNextRank(getNextRank());
    setXpPercentage(getXpProgress().percentage);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addXp = useCallback(
    (amount: number) => {
      const result = addXpToStore(amount);
      refresh();
      return result;
    },
    [refresh]
  );

  return {
    totalXp,
    currentRank,
    nextRank,
    xpPercentage,
    addXp,
    refresh,
  };
}
