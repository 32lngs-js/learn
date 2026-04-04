"use client";

import { useStreak } from "@/lib/sparks/use-streak";
import { SPARK_CONFIG } from "@/lib/sparks/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getNextMilestone(currentStreak: number): { days: number; bonus: number } | null {
  const milestones = Object.entries(SPARK_CONFIG.streakBonusTable)
    .map(([days, bonus]) => ({ days: Number(days), bonus }))
    .sort((a, b) => a.days - b.days);

  for (const m of milestones) {
    if (currentStreak < m.days) {
      return m;
    }
  }
  return null;
}

export function StreakPanel() {
  const { currentStreak, longestStreak, freezesRemaining, getBonus } = useStreak();
  const bonus = getBonus();
  const nextMilestone = getNextMilestone(currentStreak);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">&#128293;</span>
          Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{currentStreak}</div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{longestStreak}</div>
            <div className="text-sm text-muted-foreground">Longest Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{freezesRemaining}</div>
            <div className="text-sm text-muted-foreground">&#10052; Freezes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">+{bonus}</div>
            <div className="text-sm text-muted-foreground">&#9889; Bonus</div>
          </div>
        </div>

        {nextMilestone && (
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">
              {nextMilestone.days - currentStreak} day{nextMilestone.days - currentStreak !== 1 ? "s" : ""} until next bonus:{" "}
              <span className="font-medium text-amber-600 dark:text-amber-400">
                +{nextMilestone.bonus} &#9889;
              </span>
            </p>
          </div>
        )}

        {currentStreak === 0 && (
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Complete a lesson today to start your streak!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
