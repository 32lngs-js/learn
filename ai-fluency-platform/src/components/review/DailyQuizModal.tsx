"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QuizQuestion } from "./QuizQuestion";
import { QuizSummary } from "./QuizSummary";
import { useXp } from "@/lib/store/use-xp";
import {
  updateStreak,
  dismissQuiz,
  recordQuiz,
  addXp as addXpToStore,
  getXpProgress,
  getCurrentRank,
  getNextRank,
} from "@/lib/store/xp";
import { recordAnswer } from "@/lib/store/quiz-history";
import { celebrateInteraction } from "@/lib/celebrations";
import type { ReviewQuestion } from "@/types/review";

type QuizState = "intro" | "question" | "summary";

interface DailyQuizModalProps {
  open: boolean;
  onClose: () => void;
  questions: ReviewQuestion[];
}

export function DailyQuizModal({
  open,
  onClose,
  questions,
}: DailyQuizModalProps) {
  const [state, setState] = useState<QuizState>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [didRankUp, setDidRankUp] = useState(false);
  const [streak, setStreak] = useState(0);
  const { refresh } = useXp();

  const handleStart = useCallback(() => {
    const { streak: s } = updateStreak();
    setStreak(s);
    setState("question");
  }, []);

  const handleDismiss = useCallback(() => {
    dismissQuiz();
    onClose();
  }, [onClose]);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      // Record answer for spaced repetition scheduling
      const currentQuestion = questions[currentIndex];
      if (currentQuestion) {
        recordAnswer(currentQuestion.id, correct);
      }

      const xp = correct ? 10 : 3;
      const result = addXpToStore(xp);
      setSessionXp((prev) => prev + xp);
      if (correct) {
        setCorrectCount((prev) => prev + 1);
        celebrateInteraction("#6366f1");
      }
      if (result.rankUp) setDidRankUp(true);

      setTimeout(() => {
        if (currentIndex + 1 < questions.length) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          // Quiz complete — add completion bonus + streak bonus
          const completionXp = 5;
          const streakBonus = streak * 5;
          const bonusTotal = completionXp + streakBonus;
          const bonusResult = addXpToStore(bonusTotal);
          setSessionXp((prev) => prev + bonusTotal);
          if (bonusResult.rankUp) setDidRankUp(true);

          recordQuiz({
            date: new Date().toISOString().slice(0, 10),
            questionsAnswered: questions.length,
            correctCount: correctCount + (correct ? 1 : 0),
            xpEarned: sessionXp + xp + bonusTotal,
          });

          refresh();
          setState("summary");
        }
      }, 100);
    },
    [currentIndex, questions.length, streak, correctCount, sessionXp, refresh]
  );

  const handleFinish = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleDismiss()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md overflow-hidden"
      >
        {state === "intro" && (
          <div className="flex flex-col items-center gap-5 py-4 animate-in fade-in duration-300">
            <DialogHeader className="items-center">
              <div className="text-4xl mb-2">{"\ud83c\udf1f"}</div>
              <DialogTitle className="text-xl text-center">
                Welcome back!
              </DialogTitle>
              <p className="text-muted-foreground text-sm text-center">
                Ready for your daily review? Just {questions.length} quick
                questions to keep your knowledge fresh.
              </p>
            </DialogHeader>

            <div className="flex flex-col gap-3 w-full">
              <Button onClick={handleStart} className="w-full" size="lg">
                Let&apos;s Go!
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="w-full text-muted-foreground"
              >
                Not Now
              </Button>
            </div>
          </div>
        )}

        {state === "question" && questions[currentIndex] && (
          <div
            key={currentIndex}
            className="animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <QuizQuestion
              question={questions[currentIndex]}
              questionNumber={currentIndex}
              totalQuestions={questions.length}
              onAnswer={handleAnswer}
            />
          </div>
        )}

        {state === "summary" && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <QuizSummary
              xpEarned={sessionXp}
              totalXp={getXpProgress().current}
              currentRank={getCurrentRank()}
              nextRank={getNextRank()}
              xpPercentage={getXpProgress().percentage}
              streak={streak}
              didRankUp={didRankUp}
              correctCount={correctCount}
              totalQuestions={questions.length}
            />
            <Button
              onClick={handleFinish}
              className="w-full mt-6"
              size="lg"
            >
              See You Tomorrow!
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
