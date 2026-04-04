"use client";

import { useState, useCallback, useEffect } from "react";
import {
  checkAchievements,
  getEarnedAchievements,
  recordAchievement,
} from "./achievements";
import type { AchievementContext } from "./achievements";
import type { UserAchievement } from "@/types/sparks";

interface NewAchievement {
  id: string;
  name: string;
  sparkReward: number;
}

export function useAchievements() {
  const [earned, setEarned] = useState<UserAchievement[]>([]);
  const [newlyEarned, setNewlyEarned] = useState<NewAchievement[]>([]);

  const refresh = useCallback(() => {
    setEarned(getEarnedAchievements());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const checkForNew = useCallback(
    (context: AchievementContext) => {
      const newOnes = checkAchievements(context);
      if (newOnes.length > 0) {
        for (const achievement of newOnes) {
          recordAchievement(achievement.id);
        }
        setNewlyEarned((prev) => [...prev, ...newOnes]);
        refresh();
      }
      return newOnes;
    },
    [refresh]
  );

  const dismissAchievement = useCallback((id: string) => {
    setNewlyEarned((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return {
    earned,
    newlyEarned,
    checkForNew,
    dismissAchievement,
  };
}
