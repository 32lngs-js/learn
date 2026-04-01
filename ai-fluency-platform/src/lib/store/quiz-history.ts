"use client";

import type { ReviewQuestion, QuestionRecord, QuizHistoryStore } from "@/types/review";
import { syncQuizAnswer } from "./db-sync";

const STORE_KEY = "aif_quiz_history";

const BOX_INTERVALS = [0, 1, 3, 7, 14, 30];

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function getStore(): QuizHistoryStore {
  if (typeof window === "undefined") return { questions: {} };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupted data
  }
  return { questions: {} };
}

function saveStore(store: QuizHistoryStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function getQuestionRecord(questionId: string): QuestionRecord | undefined {
  return getStore().questions[questionId];
}

export function recordAnswer(questionId: string, correct: boolean): void {
  const store = getStore();
  const today = getTodayString();
  const existing = store.questions[questionId];

  if (correct) {
    const newBox = existing ? Math.min(existing.box + 1, 5) : 1;
    store.questions[questionId] = {
      lastSeen: today,
      nextDue: addDays(today, BOX_INTERVALS[newBox]),
      box: newBox,
      correctStreak: (existing?.correctStreak ?? 0) + 1,
      totalSeen: (existing?.totalSeen ?? 0) + 1,
      totalCorrect: (existing?.totalCorrect ?? 0) + 1,
    };
  } else {
    store.questions[questionId] = {
      lastSeen: today,
      nextDue: today,
      box: 0,
      correctStreak: 0,
      totalSeen: (existing?.totalSeen ?? 0) + 1,
      totalCorrect: existing?.totalCorrect ?? 0,
    };
  }

  saveStore(store);

  // Sync to DB (fire-and-forget)
  const record = store.questions[questionId];
  syncQuizAnswer(
    questionId,
    record.lastSeen,
    record.nextDue,
    record.box,
    record.correctStreak,
    record.totalSeen,
    record.totalCorrect
  );
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickWithCourseVariety(pool: ReviewQuestion[], count: number): ReviewQuestion[] {
  if (pool.length <= count) return shuffleArray(pool);

  const byCourse = new Map<string, ReviewQuestion[]>();
  for (const q of pool) {
    const list = byCourse.get(q.courseId) || [];
    list.push(q);
    byCourse.set(q.courseId, list);
  }

  // Shuffle within each course pool
  for (const [key, list] of byCourse) {
    byCourse.set(key, shuffleArray(list));
  }

  const selected: ReviewQuestion[] = [];
  const courseKeys = shuffleArray([...byCourse.keys()]);
  let courseIdx = 0;

  while (selected.length < count) {
    const courseId = courseKeys[courseIdx % courseKeys.length];
    const coursePool = byCourse.get(courseId)!;
    if (coursePool.length > 0) {
      selected.push(coursePool.shift()!);
    }
    courseIdx++;
    if ([...byCourse.values()].every((p) => p.length === 0)) break;
  }

  return selected;
}

export function selectQuestions(eligible: ReviewQuestion[], count: number): ReviewQuestion[] {
  const today = getTodayString();
  const store = getStore();

  const overdueWrong: ReviewQuestion[] = [];
  const overdueReview: ReviewQuestion[] = [];
  const unseen: ReviewQuestion[] = [];
  const mastered: ReviewQuestion[] = [];

  for (const q of eligible) {
    const record = store.questions[q.id];
    if (!record) {
      unseen.push(q);
    } else if (record.box === 0 && record.nextDue <= today) {
      overdueWrong.push(q);
    } else if (record.box >= 1 && record.box <= 4 && record.nextDue <= today) {
      overdueReview.push(q);
    } else if (record.box === 5 && record.nextDue <= today) {
      mastered.push(q);
    }
    // Questions not yet due are skipped
  }

  // Sort overdue reviews by most overdue first
  overdueReview.sort((a, b) => {
    const ra = store.questions[a.id]!;
    const rb = store.questions[b.id]!;
    return ra.nextDue.localeCompare(rb.nextDue);
  });

  mastered.sort((a, b) => {
    const ra = store.questions[a.id]!;
    const rb = store.questions[b.id]!;
    return ra.nextDue.localeCompare(rb.nextDue);
  });

  const selected: ReviewQuestion[] = [];

  // 1. Overdue wrong answers (up to 2)
  selected.push(...pickWithCourseVariety(overdueWrong, Math.min(2, count - selected.length)));

  // 2. Overdue reviews (up to 3, or fill remaining)
  if (selected.length < count) {
    selected.push(...pickWithCourseVariety(overdueReview, Math.min(3, count - selected.length)));
  }

  // 3. New questions (up to 2, or fill remaining)
  if (selected.length < count) {
    selected.push(...pickWithCourseVariety(unseen, Math.min(2, count - selected.length)));
  }

  // 4. Backfill from mastered, then remaining unseen
  if (selected.length < count) {
    const selectedIds = new Set(selected.map((q) => q.id));
    const remainingMastered = mastered.filter((q) => !selectedIds.has(q.id));
    selected.push(...pickWithCourseVariety(remainingMastered, count - selected.length));
  }

  if (selected.length < count) {
    const selectedIds = new Set(selected.map((q) => q.id));
    const remainingUnseen = unseen.filter((q) => !selectedIds.has(q.id));
    selected.push(...pickWithCourseVariety(remainingUnseen, count - selected.length));
  }

  return shuffleArray(selected);
}
