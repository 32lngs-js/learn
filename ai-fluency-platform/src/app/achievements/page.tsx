"use client";

import { useAchievements } from "@/lib/sparks/use-achievements";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Achievement definitions mirrored from achievements.ts for display
const ALL_ACHIEVEMENTS = [
  { id: "first_lesson", name: "First Steps", description: "Complete your first lesson", icon: "\ud83d\udc63", sparkReward: 10, category: "lessons" },
  { id: "lessons_10", name: "Getting Started", description: "Complete 10 lessons", icon: "\ud83d\udcda", sparkReward: 25, category: "lessons" },
  { id: "lessons_50", name: "Dedicated Learner", description: "Complete 50 lessons", icon: "\ud83c\udf93", sparkReward: 50, category: "lessons" },
  { id: "lessons_100", name: "Century Club", description: "Complete 100 lessons", icon: "\ud83c\udfc6", sparkReward: 100, category: "lessons" },
  { id: "streak_3", name: "On a Roll", description: "3-day streak", icon: "\ud83d\udd25", sparkReward: 15, category: "streaks" },
  { id: "streak_7", name: "Week Warrior", description: "7-day streak", icon: "\u26a1", sparkReward: 30, category: "streaks" },
  { id: "streak_14", name: "Fortnight Focus", description: "14-day streak", icon: "\ud83d\udcaa", sparkReward: 50, category: "streaks" },
  { id: "streak_30", name: "Monthly Master", description: "30-day streak", icon: "\ud83d\udc51", sparkReward: 100, category: "streaks" },
  { id: "course_complete_1", name: "Course Conqueror", description: "Complete a course", icon: "\u2b50", sparkReward: 50, category: "courses" },
  { id: "course_complete_3", name: "Triple Threat", description: "Complete 3 courses", icon: "\ud83c\udf1f", sparkReward: 100, category: "courses" },
  { id: "quiz_perfect", name: "Perfect Score", description: "Ace a daily quiz", icon: "\ud83c\udfaf", sparkReward: 20, category: "quizzes" },
  { id: "quiz_streak_7", name: "Quiz Machine", description: "7-day quiz streak", icon: "\ud83e\udde0", sparkReward: 40, category: "quizzes" },
  { id: "first_purchase", name: "First Investment", description: "Make your first purchase", icon: "\ud83d\udcb0", sparkReward: 10, category: "special" },
  { id: "creator_first", name: "Course Creator", description: "Create a course", icon: "\ud83c\udfa8", sparkReward: 75, category: "special" },
];

export default function AchievementsPage() {
  const { earned } = useAchievements();
  const earnedIds = new Set(earned.map((a) => a.achievementId));
  const totalSparksEarned = ALL_ACHIEVEMENTS
    .filter((a) => earnedIds.has(a.id))
    .reduce((sum, a) => sum + a.sparkReward, 0);
  const totalPossible = ALL_ACHIEVEMENTS.reduce((sum, a) => sum + a.sparkReward, 0);

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Achievements</h1>
        <p className="text-muted-foreground">
          {earned.length} / {ALL_ACHIEVEMENTS.length} unlocked
        </p>
        <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
          {totalSparksEarned.toLocaleString()} / {totalPossible.toLocaleString()} &#9889; earned from achievements
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md mx-auto mb-10">
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${(earned.length / ALL_ACHIEVEMENTS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {ALL_ACHIEVEMENTS.map((achievement) => {
          const isEarned = earnedIds.has(achievement.id);
          return (
            <Card
              key={achievement.id}
              className={cn(
                "text-center transition-all",
                !isEarned && "opacity-40 grayscale"
              )}
            >
              <CardContent className="pt-6 pb-4 flex flex-col items-center gap-2">
                <span className="text-4xl">{achievement.icon}</span>
                <div className="font-semibold text-sm">{achievement.name}</div>
                <div className="text-xs text-muted-foreground">{achievement.description}</div>
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  +{achievement.sparkReward} &#9889;
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
