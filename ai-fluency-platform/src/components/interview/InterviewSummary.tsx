"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StreamingText } from "@/components/learning/StreamingText";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface InterviewSummaryProps {
  summary: string;
  courseName: string;
  questionCount: number;
  elapsedTime: number;
  onRestart?: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function InterviewSummary({
  summary,
  courseName,
  questionCount,
  elapsedTime,
  onRestart,
}: InterviewSummaryProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-2">Interview Complete</h2>
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
        <span>{courseName}</span>
        <span>{questionCount} questions</span>
        <span>{formatTime(elapsedTime)}</span>
      </div>

      <div className="bg-muted rounded-xl p-6 mb-8">
        <StreamingText content={summary} isStreaming={false} />
      </div>

      <div className="flex items-center gap-3">
        <Link href="/interview">
          <Button variant="outline" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Button>
        </Link>
        {onRestart && (
          <Button onClick={onRestart} className="gap-1.5">
            <RotateCcw className="h-4 w-4" />
            Interview Again
          </Button>
        )}
      </div>
    </div>
  );
}
