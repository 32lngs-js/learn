"use client";

import { useState } from "react";
import type { ReviewQuestion } from "@/types/review";
import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  question: ReviewQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (correct: boolean) => void;
}

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
}: QuizQuestionProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelected(index);
    setRevealed(true);
    const correct = index === question.correctIndex;
    setTimeout(() => onAnswer(correct), 2000);
  };

  const isCorrect = selected === question.correctIndex;

  return (
    <div className="flex flex-col gap-5">
      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              i < questionNumber
                ? "bg-indigo-500 scale-100"
                : i === questionNumber
                  ? "bg-indigo-500 scale-125"
                  : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Lesson reference */}
      <p className="text-xs text-muted-foreground text-center">
        From your lesson on <span className="font-medium text-foreground">{question.lessonTitle}</span>
      </p>

      {/* Question */}
      <h3 className="text-lg font-semibold text-center leading-snug px-2">
        {question.question}
      </h3>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {question.options.map((option, i) => {
          let variant = "border-muted hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30";
          if (revealed) {
            if (i === question.correctIndex) {
              variant = "border-green-500 bg-green-50 dark:bg-green-950/30";
            } else if (i === selected) {
              variant = "border-amber-500 bg-amber-50 dark:bg-amber-950/30";
            } else {
              variant = "border-muted opacity-50";
            }
          } else if (i === selected) {
            variant = "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium",
                "hover:scale-[1.02] active:scale-[0.98]",
                revealed && "hover:scale-100 active:scale-100",
                variant
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {revealed && (
        <div
          className={cn(
            "text-center rounded-xl px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
            isCorrect
              ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300"
              : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
          )}
        >
          <p className="font-semibold text-sm mb-1">
            {isCorrect ? question.encourageCorrect : question.encourageIncorrect}
          </p>
          {!isCorrect && (
            <p className="text-xs opacity-80">{question.explanation}</p>
          )}
          {/* XP float */}
          <span className="inline-block mt-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-1 duration-500">
            +{isCorrect ? 10 : 3} XP
          </span>
        </div>
      )}
    </div>
  );
}
