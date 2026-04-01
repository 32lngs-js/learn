"use client";

import { useEffect, useState, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import type { RankTier } from "@/types/review";
import { celebrateLevel } from "@/lib/celebrations";

interface QuizSummaryProps {
  xpEarned: number;
  totalXp: number;
  currentRank: RankTier;
  nextRank: RankTier | null;
  xpPercentage: number;
  streak: number;
  didRankUp: boolean;
  correctCount: number;
  totalQuestions: number;
}

export function QuizSummary({
  xpEarned,
  totalXp,
  currentRank,
  nextRank,
  xpPercentage,
  streak,
  didRankUp,
  correctCount,
  totalQuestions,
}: QuizSummaryProps) {
  const [displayXp, setDisplayXp] = useState(0);
  const [showRankUp, setShowRankUp] = useState(false);
  const celebratedRef = useRef(false);

  // Animated XP counter
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = xpEarned / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = Math.min(xpEarned, Math.round(increment * step));
      setDisplayXp(current);
      if (step >= steps) clearInterval(interval);
    }, duration / steps);

    return () => clearInterval(interval);
  }, [xpEarned]);

  // Rank up celebration
  useEffect(() => {
    if (didRankUp && !celebratedRef.current) {
      celebratedRef.current = true;
      const timer = setTimeout(() => {
        setShowRankUp(true);
        celebrateLevel();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [didRankUp]);

  return (
    <div className="flex flex-col items-center gap-6 py-2">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-1">Great job today!</h3>
        <p className="text-muted-foreground text-sm">
          {correctCount}/{totalQuestions} correct
        </p>
      </div>

      {/* XP earned */}
      <div className="text-center">
        <div className="text-5xl font-bold text-indigo-500 tabular-nums">
          +{displayXp}
        </div>
        <p className="text-sm text-muted-foreground mt-1">XP earned</p>
      </div>

      {/* Rank progress */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {currentRank.emoji} {currentRank.name}
          </span>
          <span className="text-muted-foreground tabular-nums">
            {totalXp} XP
          </span>
        </div>
        <Progress value={xpPercentage} className="h-3" />
        {nextRank && (
          <p className="text-xs text-muted-foreground text-right">
            {nextRank.minXp - totalXp} XP to {nextRank.emoji} {nextRank.name}
          </p>
        )}
      </div>

      {/* Rank up announcement */}
      {showRankUp && (
        <div className="text-center animate-in fade-in zoom-in-50 duration-500 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl px-6 py-4 w-full">
          <p className="text-xs font-medium text-indigo-500 uppercase tracking-wide mb-1">
            Rank Up!
          </p>
          <p className="text-2xl font-bold">
            {currentRank.emoji} {currentRank.name}
          </p>
        </div>
      )}

      {/* Streak */}
      {streak > 0 && (
        <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/30 rounded-full px-4 py-2">
          <span className="text-lg">{"\ud83d\udd25"}</span>
          <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
            {streak} day streak!
          </span>
        </div>
      )}
    </div>
  );
}
