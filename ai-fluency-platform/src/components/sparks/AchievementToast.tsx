"use client";

import { useEffect } from "react";
import { celebrateDrillPass } from "@/lib/celebrations";
import { cn } from "@/lib/utils";

interface AchievementToastProps {
  name: string;
  sparkReward: number;
  onDismiss: () => void;
}

export function AchievementToast({ name, sparkReward, onDismiss }: AchievementToastProps) {
  useEffect(() => {
    celebrateDrillPass("#fbbf24");
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 max-w-sm",
        "animate-in slide-in-from-bottom-4 fade-in duration-500"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg",
          "bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800",
          "text-amber-900 dark:text-amber-100"
        )}
      >
        <span className="text-2xl">&#127942;</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">Achievement Unlocked!</div>
          <div className="text-sm truncate">{name}</div>
        </div>
        <div className="text-amber-600 dark:text-amber-400 font-bold text-sm whitespace-nowrap">
          +{sparkReward} &#9889;
        </div>
        <button
          onClick={onDismiss}
          className="ml-1 text-amber-400 hover:text-amber-600 dark:hover:text-amber-200"
          aria-label="Dismiss"
        >
          &#10005;
        </button>
      </div>
    </div>
  );
}
