"use client";

import { useEffect, useState } from "react";
import { shouldShowQuiz } from "@/lib/store/xp";
import { getAllProgress } from "@/lib/store/progress";
import { selectQuestions } from "@/lib/store/quiz-history";
import { DailyQuizModal } from "./DailyQuizModal";
import type { ReviewQuestion } from "@/types/review";

export function DailyQuizProvider() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);

  useEffect(() => {
    if (!shouldShowQuiz()) return;

    const timer = setTimeout(async () => {
      try {
        const progress = getAllProgress();
        const completedModules = new Set(
          Object.entries(progress.modules)
            .filter(([, m]) => m.completed)
            .map(([key]) => key)
        );

        if (completedModules.size === 0) return;

        const res = await fetch("/review-questions.json");
        if (!res.ok) return;
        const allQuestions: ReviewQuestion[] = await res.json();

        const eligible = allQuestions.filter((q) =>
          completedModules.has(q.modulePath)
        );

        if (eligible.length === 0) return;

        const selected = selectQuestions(eligible, 5);

        if (selected.length === 0) return;

        setQuestions(selected);
        setShowQuiz(true);
      } catch {
        // Silently fail — quiz is optional
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!showQuiz || questions.length === 0) return null;

  return (
    <DailyQuizModal
      open={showQuiz}
      onClose={() => setShowQuiz(false)}
      questions={questions}
    />
  );
}
