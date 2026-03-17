"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { InterviewSetup } from "@/components/interview/InterviewSetup";
import { InterviewChat } from "@/components/interview/InterviewChat";
import { getAllProgress } from "@/lib/store/progress";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface StudiedTopic {
  levelTitle: string;
  moduleTitle: string;
  completed: boolean;
}

interface CurriculumLevel {
  level: number;
  title: string;
}

interface CurriculumModule {
  title: string;
  level: string;
  slug: string;
  isIndex: boolean;
  isCheckpoint: boolean;
}

interface CurriculumData {
  levels: CurriculumLevel[];
  modules: Record<string, CurriculumModule[]>;
}

interface CourseInfo {
  id: string;
  title: string;
  description: string;
  color: string;
}

export default function InterviewCoursePage() {
  const params = useParams();
  const courseId = params.course as string;

  const [phase, setPhase] = useState<"loading" | "setup" | "interview">(
    "loading"
  );
  const [courseName, setCourseName] = useState("");
  const [studiedTopics, setStudiedTopics] = useState<StudiedTopic[]>([]);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch course info
        const coursesRes = await fetch("/api/courses");
        const courses: CourseInfo[] = await coursesRes.json();
        const course = courses.find((c) => c.id === courseId);
        if (course) setCourseName(course.title);

        // Fetch curriculum
        const currRes = await fetch(`/api/curriculum/${courseId}`);
        const curriculum: CurriculumData = await currRes.json();

        const progress = getAllProgress();

        // Build studied topics list
        const topics: StudiedTopic[] = [];
        for (const level of curriculum.levels) {
          const levelSlug =
            level.level === 0 ? "foundations" : `level-${level.level}`;
          const mods = curriculum.modules[levelSlug] || [];

          for (const mod of mods) {
            if (mod.isIndex || mod.isCheckpoint) continue;

            const progressKey = `${courseId}/${mod.level}/${mod.slug}`;
            const isCompleted =
              progress.modules[progressKey]?.completed || false;

            topics.push({
              levelTitle: level.title,
              moduleTitle: mod.title,
              completed: isCompleted,
            });
          }
        }

        setStudiedTopics(topics);
        setPhase("setup");
      } catch {
        setPhase("setup");
      }
    }

    loadData();
  }, [courseId]);

  const handleStart = (diff: string, focus: string[]) => {
    setDifficulty(diff);
    setFocusAreas(focus);
    setPhase("interview");
  };

  const handleBack = () => {
    setPhase("setup");
  };

  if (phase === "loading") {
    return (
      <div className="text-center text-muted-foreground py-24">
        Loading...
      </div>
    );
  }

  if (phase === "setup") {
    const completedCount = studiedTopics.filter((t) => t.completed).length;

    if (completedCount === 0) {
      return (
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <h2 className="text-xl font-bold mb-2">No topics studied yet</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Complete some modules in this course before starting an interview.
          </p>
          <Link href="/interview">
            <Button variant="outline" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
        </div>
      );
    }

    return <InterviewSetup courseName={courseName} studiedTopics={studiedTopics} onStart={handleStart} />;
  }

  return (
    <InterviewChat
      courseId={courseId}
      courseName={courseName}
      studiedTopics={studiedTopics}
      difficulty={difficulty}
      focusAreas={focusAreas}
      onBack={handleBack}
    />
  );
}
