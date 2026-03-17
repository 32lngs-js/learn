"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface StudiedTopic {
  levelTitle: string;
  moduleTitle: string;
  completed: boolean;
}

interface InterviewSetupProps {
  courseName: string;
  studiedTopics: StudiedTopic[];
  onStart: (difficulty: string, focusAreas: string[]) => void;
}

const DIFFICULTIES = [
  {
    id: "foundational",
    label: "Foundational",
    description: "Core concepts, definitions, and basic application",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    description: "Trade-offs, comparisons, and scenario analysis",
  },
  {
    id: "advanced",
    label: "Advanced",
    description: "System design, edge cases, and deep technical drilling",
  },
];

export function InterviewSetup({
  courseName,
  studiedTopics,
  onStart,
}: InterviewSetupProps) {
  const [difficulty, setDifficulty] = useState("intermediate");
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());

  const completedTopics = studiedTopics.filter((t) => t.completed);

  // Group topics by level
  const topicsByLevel = completedTopics.reduce(
    (acc, topic) => {
      if (!acc[topic.levelTitle]) acc[topic.levelTitle] = [];
      acc[topic.levelTitle].push(topic);
      return acc;
    },
    {} as Record<string, StudiedTopic[]>
  );

  const toggleTopic = (moduleTitle: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(moduleTitle)) {
        next.delete(moduleTitle);
      } else {
        next.add(moduleTitle);
      }
      return next;
    });
  };

  const handleStart = () => {
    onStart(difficulty, Array.from(selectedTopics));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-1">{courseName}</h2>
      <p className="text-sm text-muted-foreground mb-8">
        {completedTopics.length} topics available for interview
      </p>

      {/* Difficulty */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold mb-3">Difficulty</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              onClick={() => setDifficulty(d.id)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                difficulty === d.id
                  ? "border-primary bg-primary/5"
                  : "hover:border-foreground/20"
              }`}
            >
              <div className="font-medium text-sm">{d.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {d.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Topic Filter */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold mb-1">
          Focus Areas{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Leave empty to be quizzed on all studied topics, or select specific
          areas to focus on.
        </p>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {Object.entries(topicsByLevel).map(([level, topics]) => (
            <div key={level}>
              <div className="text-xs font-medium text-muted-foreground mb-1.5">
                {level}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topics.map((topic) => (
                  <button
                    key={topic.moduleTitle}
                    onClick={() => toggleTopic(topic.moduleTitle)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selectedTopics.has(topic.moduleTitle)
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:border-foreground/20"
                    }`}
                  >
                    {topic.moduleTitle}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleStart} size="lg" className="gap-2">
        <Play className="h-4 w-4" />
        Start Interview
      </Button>
    </div>
  );
}
