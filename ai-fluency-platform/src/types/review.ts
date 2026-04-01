export interface ReviewQuestion {
  id: string;
  modulePath: string;
  courseId: string;
  lessonTitle: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  encourageCorrect: string;
  encourageIncorrect: string;
}

export interface XpStore {
  totalXp: number;
  dailyStreak: number;
  lastQuizDate: string | null;
  longestStreak: number;
  quizHistory: QuizHistoryEntry[];
}

export interface QuizHistoryEntry {
  date: string;
  questionsAnswered: number;
  correctCount: number;
  xpEarned: number;
}

export interface RankTier {
  name: string;
  minXp: number;
  emoji: string;
  color: string;
}

export interface QuestionRecord {
  lastSeen: string;
  nextDue: string;
  box: number;
  correctStreak: number;
  totalSeen: number;
  totalCorrect: number;
}

export interface QuizHistoryStore {
  questions: Record<string, QuestionRecord>;
}
