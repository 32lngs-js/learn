"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";

const SYNCED_KEY = "aif_db_synced";
const PROGRESS_KEY = "aif_progress";
const XP_KEY = "aif_xp";
const QUIZ_HISTORY_KEY = "aif_quiz_history";
const PROVIDER_KEY = "aif_provider";

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (loading || syncedRef.current) return;
    if (!user) return;

    syncedRef.current = true;

    (async () => {
      try {
        // 1. Fetch all DB state
        const res = await fetch("/api/user-data");
        if (!res.ok) return;
        const dbData = await res.json();

        const dbHasProgress =
          dbData.progress && Object.keys(dbData.progress.modules).length > 0;
        const dbHasXp = dbData.xp && dbData.xp.totalXp > 0;
        const dbHasQuizHistory =
          dbData.quizHistory &&
          Object.keys(dbData.quizHistory.questions).length > 0;

        // 2. Check if localStorage has data to upload
        const localProgress = safeJsonParse(localStorage.getItem(PROGRESS_KEY));
        const localXp = safeJsonParse(localStorage.getItem(XP_KEY));
        const localQuizHistory = safeJsonParse(
          localStorage.getItem(QUIZ_HISTORY_KEY)
        );
        const localProvider = localStorage.getItem(PROVIDER_KEY);

        const localHasProgress =
          localProgress?.modules &&
          Object.keys(localProgress.modules as Record<string, unknown>).length > 0;
        const localHasXp = localXp && (localXp.totalXp as number) > 0;
        const localHasQuizHistory =
          localQuizHistory?.questions &&
          Object.keys(localQuizHistory.questions as Record<string, unknown>).length > 0;

        const alreadySynced = localStorage.getItem(SYNCED_KEY) === "true";

        // 3. If DB has data, populate localStorage from DB
        if (dbHasProgress) {
          // Merge: DB wins for modules it has, local keeps modules DB doesn't
          const merged = { ...(localProgress || { modules: {} }) };
          merged.modules = { ...(merged.modules || {}), ...dbData.progress.modules };
          localStorage.setItem(PROGRESS_KEY, JSON.stringify(merged));
        }

        if (dbHasXp) {
          const mergedXp = {
            totalXp: dbData.xp.totalXp,
            dailyStreak: dbData.xp.dailyStreak,
            lastQuizDate: dbData.xp.lastQuizDate,
            longestStreak: dbData.xp.longestStreak,
            quizHistory: dbData.quizSessions || [],
          };
          localStorage.setItem(XP_KEY, JSON.stringify(mergedXp));
        }

        if (dbHasQuizHistory) {
          // Merge: DB wins for questions it has, local keeps questions DB doesn't
          const merged = { questions: {} as Record<string, unknown> };
          if (localQuizHistory?.questions) {
            merged.questions = { ...localQuizHistory.questions };
          }
          merged.questions = { ...merged.questions, ...dbData.quizHistory.questions };
          localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(merged));
        }

        if (dbData.provider && dbData.provider !== "claude-code") {
          localStorage.setItem(PROVIDER_KEY, dbData.provider);
        }

        // 4. If local has data that DB doesn't, upload it (first login migration)
        if (!alreadySynced && (localHasProgress || localHasXp || localHasQuizHistory)) {
          const needsSync =
            (localHasProgress && !dbHasProgress) ||
            (localHasXp && !dbHasXp) ||
            (localHasQuizHistory && !dbHasQuizHistory);

          if (needsSync) {
            await fetch("/api/user-data/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                progress: localProgress,
                xp: localXp,
                quizHistory: localQuizHistory,
                provider: localProvider || "claude-code",
              }),
            });
          }
        }

        localStorage.setItem(SYNCED_KEY, "true");

        // Trigger re-render in components that listen for storage changes
        window.dispatchEvent(new Event("storage"));
      } catch {
        // Sync is best-effort — app works fine with localStorage alone
      }
    })();
  }, [user, loading]);

  return <>{children}</>;
}

function safeJsonParse(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
