"use client";

import { useState, useCallback, useEffect } from "react";
import { getStreakState, updateStreak as updateStreakStore, getStreakBonus } from "./streak";

export function useStreak() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [freezesRemaining, setFreezesRemaining] = useState(0);

  const refresh = useCallback(() => {
    const state = getStreakState();
    setCurrentStreak(state.currentStreak);
    setLongestStreak(state.longestStreak);
    setFreezesRemaining(state.freezesRemaining);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const update = useCallback(() => {
    const result = updateStreakStore();
    refresh();
    return result;
  }, [refresh]);

  const getBonus = useCallback(() => {
    return getStreakBonus(currentStreak);
  }, [currentStreak]);

  return {
    currentStreak,
    longestStreak,
    freezesRemaining,
    update,
    getBonus,
  };
}
