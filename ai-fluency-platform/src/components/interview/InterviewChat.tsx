"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { InterviewMessage } from "./InterviewMessage";
import { InterviewHeader } from "./InterviewHeader";
import { InterviewSummary } from "./InterviewSummary";
import { SignInPromptDialog } from "@/components/learning/SignInPromptDialog";
import { useInterviewSession } from "@/lib/use-interview-session";

interface StudiedTopic {
  levelTitle: string;
  moduleTitle: string;
  completed: boolean;
}

interface InterviewChatProps {
  courseId: string;
  courseName: string;
  studiedTopics: StudiedTopic[];
  difficulty: string;
  focusAreas: string[];
  onBack: () => void;
}

export function InterviewChat({
  courseId,
  courseName,
  studiedTopics,
  difficulty,
  focusAreas,
  onBack,
}: InterviewChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const session = useInterviewSession({
    courseId,
    studiedTopics,
    difficulty,
    focusAreas,
  });

  // Start interview on mount
  useEffect(() => {
    if (session.phase === "idle") {
      session.startInterview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages, session.streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || session.isStreaming) return;
    const content = input;
    setInput("");
    await session.sendMessage(content);
  };

  if (session.phase === "summary" && session.summary) {
    return (
      <InterviewSummary
        summary={session.summary}
        courseName={courseName}
        questionCount={session.questionCount}
        elapsedTime={session.elapsedTime}
        onRestart={onBack}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <InterviewHeader
        courseName={courseName}
        questionCount={session.questionCount}
        elapsedTime={session.elapsedTime}
        onEnd={session.endInterview}
        isStreaming={session.isStreaming}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {session.messages.map((msg, i) => (
          <InterviewMessage key={i} role={msg.role} content={msg.content} />
        ))}
        {session.isStreaming && session.streamingContent && (
          <InterviewMessage
            role="assistant"
            content={session.streamingContent}
            isStreaming={true}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        {session.rateLimitHit && (
          <p className="text-xs text-red-600 dark:text-red-400 mb-2">
            Daily AI usage limit reached. Sign in for more uses.
          </p>
        )}
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Textarea
            placeholder="Type your answer..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="min-h-[44px] max-h-[120px] resize-none"
            disabled={
              session.isStreaming ||
              session.rateLimitHit ||
              session.phase === "ending"
            }
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={
              !input.trim() ||
              session.isStreaming ||
              session.rateLimitHit ||
              session.phase === "ending"
            }
            className="shrink-0 h-11 w-11"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <SignInPromptDialog
        open={session.showSignInPrompt}
        remaining={session.remaining}
        limit={session.limit}
        onContinue={session.continueAsAnonymous}
        onClose={session.dismissSignInPrompt}
      />
    </div>
  );
}
