"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAIRequest } from "@/lib/use-ai-request";
import { RateLimitError } from "@/lib/ai-client";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface StudiedTopic {
  levelTitle: string;
  moduleTitle: string;
  completed: boolean;
}

interface InterviewSession {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;
  questionCount: number;
  elapsedTime: number;
  phase: "idle" | "active" | "ending" | "summary";
  summary: string | null;
  rateLimitHit: boolean;
  showSignInPrompt: boolean;
  remaining: number;
  limit: number;
  startInterview: () => void;
  sendMessage: (content: string) => Promise<void>;
  endInterview: () => Promise<void>;
  continueAsAnonymous: () => void;
  dismissSignInPrompt: () => void;
}

export function useInterviewSession({
  courseId,
  studiedTopics,
  difficulty,
  focusAreas,
}: {
  courseId: string;
  studiedTopics: StudiedTopic[];
  difficulty: string;
  focusAreas: string[];
}): InterviewSession {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [phase, setPhase] = useState<"idle" | "active" | "ending" | "summary">(
    "idle"
  );
  const [summary, setSummary] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const {
    requestAI,
    showSignInPrompt,
    rateLimitHit,
    remaining,
    limit,
    continueAsAnonymous,
    dismissSignInPrompt,
  } = useAIRequest();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const sendToAPI = useCallback(
    async (msgs: ChatMessage[]) => {
      setIsStreaming(true);
      setStreamingContent("");

      try {
        let fullResponse = "";
        await requestAI(
          "/api/interview",
          {
            courseId,
            studiedTopics,
            messages: msgs,
            difficulty,
            focusAreas,
          },
          (text) => {
            fullResponse += text;
            setStreamingContent(fullResponse);
          },
          () => {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: fullResponse },
            ]);
            setStreamingContent("");
            setIsStreaming(false);

            // Count questions (assistant messages that aren't the summary)
            if (fullResponse.includes("?")) {
              setQuestionCount((prev) => prev + 1);
            }
          }
        );
      } catch (err) {
        const errorMessage =
          err instanceof RateLimitError
            ? "You've reached your daily AI usage limit. Sign in for more uses, or try again tomorrow."
            : "Unable to connect right now. Please try again.";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: errorMessage },
        ]);
        setStreamingContent("");
        setIsStreaming(false);
      }
    },
    [courseId, studiedTopics, difficulty, focusAreas, requestAI]
  );

  const startInterview = useCallback(() => {
    setPhase("active");
    setMessages([]);
    setQuestionCount(0);
    setElapsedTime(0);
    setSummary(null);

    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // Send initial hidden message to trigger first question
    const initialMessages: ChatMessage[] = [
      {
        role: "user",
        content:
          "Please begin the interview. Introduce yourself briefly and ask your first question.",
      },
    ];
    setMessages(initialMessages);
    sendToAPI(initialMessages);
  }, [sendToAPI]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMessage: ChatMessage = { role: "user", content };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      await sendToAPI(newMessages);
    },
    [messages, isStreaming, sendToAPI]
  );

  const endInterview = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPhase("ending");

    const endMessage: ChatMessage = {
      role: "user",
      content: "[END_INTERVIEW] Please provide your final evaluation.",
    };
    const newMessages = [...messages, endMessage];
    setMessages(newMessages);

    setIsStreaming(true);
    setStreamingContent("");

    try {
      let fullResponse = "";
      await requestAI(
        "/api/interview",
        {
          courseId,
          studiedTopics,
          messages: newMessages,
          difficulty,
          focusAreas,
        },
        (text) => {
          fullResponse += text;
          setStreamingContent(fullResponse);
        },
        () => {
          setSummary(fullResponse);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: fullResponse },
          ]);
          setStreamingContent("");
          setIsStreaming(false);
          setPhase("summary");
        }
      );
    } catch {
      setSummary(
        "Unable to generate summary. Please check your connection and try again."
      );
      setIsStreaming(false);
      setPhase("summary");
    }
  }, [
    messages,
    courseId,
    studiedTopics,
    difficulty,
    focusAreas,
    requestAI,
  ]);

  return {
    messages,
    isStreaming,
    streamingContent,
    questionCount,
    elapsedTime,
    phase,
    summary,
    rateLimitHit,
    showSignInPrompt,
    remaining,
    limit,
    startInterview,
    sendMessage,
    endInterview,
    continueAsAnonymous,
    dismissSignInPrompt,
  };
}
