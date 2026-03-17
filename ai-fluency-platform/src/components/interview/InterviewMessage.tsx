"use client";

import { StreamingText } from "@/components/learning/StreamingText";

interface InterviewMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function InterviewMessage({
  role,
  content,
  isStreaming = false,
}: InterviewMessageProps) {
  if (role === "user") {
    // Hide the initial trigger message and end interview message
    if (
      content === "Please begin the interview. Introduce yourself briefly and ask your first question." ||
      content === "[END_INTERVIEW] Please provide your final evaluation."
    ) {
      return null;
    }

    return (
      <div className="flex justify-end">
        <div className="ml-12 bg-primary text-primary-foreground rounded-xl rounded-br-md p-4 text-sm max-w-[80%]">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="mr-12 bg-muted rounded-xl rounded-bl-md p-4 text-sm max-w-[80%]">
        <StreamingText content={content} isStreaming={isStreaming} />
      </div>
    </div>
  );
}
