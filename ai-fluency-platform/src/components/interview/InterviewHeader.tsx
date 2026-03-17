"use client";

import { Button } from "@/components/ui/button";
import { Clock, MessageSquare, Square } from "lucide-react";

interface InterviewHeaderProps {
  courseName: string;
  questionCount: number;
  elapsedTime: number;
  onEnd: () => void;
  isStreaming: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function InterviewHeader({
  courseName,
  questionCount,
  elapsedTime,
  onEnd,
  isStreaming,
}: InterviewHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-sm">{courseName}</span>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{questionCount} questions</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatTime(elapsedTime)}</span>
        </div>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={onEnd}
        disabled={isStreaming}
        className="gap-1.5"
      >
        <Square className="h-3.5 w-3.5" />
        End Interview
      </Button>
    </div>
  );
}
