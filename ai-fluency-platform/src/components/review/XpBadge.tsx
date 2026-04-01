"use client";

import { useEffect, useState, useRef } from "react";
import { useXp } from "@/lib/store/use-xp";
import { cn } from "@/lib/utils";

export function XpBadge() {
  const { totalXp, currentRank } = useXp();
  const [pulse, setPulse] = useState(false);
  const prevXpRef = useRef(totalXp);

  // Pulse animation when XP changes
  useEffect(() => {
    if (totalXp > 0 && totalXp !== prevXpRef.current) {
      prevXpRef.current = totalXp;
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(timer);
    }
  }, [totalXp]);

  // Poll for XP changes from other components (quiz modal)
  const { refresh } = useXp();
  useEffect(() => {
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  if (totalXp === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
        "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300",
        "border border-indigo-200 dark:border-indigo-800",
        "transition-transform duration-300",
        pulse && "scale-110"
      )}
      title={`${currentRank.name} — ${totalXp} XP`}
    >
      <span>{currentRank.emoji}</span>
      <span className="tabular-nums">{totalXp}</span>
      <span className="text-xs opacity-70">XP</span>
    </div>
  );
}
