"use client";

// Fire-and-forget helpers for syncing localStorage writes to Supabase.
// These never block the UI — failures are silent (DB is secondary to localStorage for UX).

export function syncProgress(
  modulePath: string,
  levelId: string,
  completed: boolean,
  completedAt: string | undefined,
  interactions: Record<string, unknown>
) {
  fetch("/api/user-data/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modulePath, levelId, completed, completedAt, interactions }),
  }).catch(() => {});
}

export function syncXp(
  totalXp: number,
  dailyStreak: number,
  lastQuizDate: string | null,
  longestStreak: number,
  quizSession?: {
    date: string;
    questionsAnswered: number;
    correctCount: number;
    xpEarned: number;
  }
) {
  fetch("/api/user-data/xp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ totalXp, dailyStreak, lastQuizDate, longestStreak, quizSession }),
  }).catch(() => {});
}

export function syncQuizAnswer(
  questionId: string,
  lastSeen: string,
  nextDue: string,
  box: number,
  correctStreak: number,
  totalSeen: number,
  totalCorrect: number
) {
  fetch("/api/user-data/quiz-answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId, lastSeen, nextDue, box, correctStreak, totalSeen, totalCorrect }),
  }).catch(() => {});
}

export function syncSettings(provider: string) {
  fetch("/api/user-data/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider }),
  }).catch(() => {});
}
