export type SparkTxType =
  | "lesson_completed"
  | "quiz_completed"
  | "streak_bonus"
  | "weekly_milestone"
  | "achievement_earned"
  | "course_unlock"
  | "cooldown_skip"
  | "cosmetic_purchase"
  | "giveaway_entry"
  | "spark_purchase"
  | "subscription_daily"
  | "creator_revenue"
  | "admin_adjustment";

export interface SparkWallet {
  user_id: string;
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  is_subscriber: boolean;
  subscriber_since: string | null;
  subscriber_until: string | null;
  updated_at: string;
}

export interface SparkTransaction {
  id: string;
  user_id: string;
  tx_type: SparkTxType;
  amount: number;
  balance_after: number;
  idempotency_key: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PendingSparkTx {
  txType: SparkTxType;
  amount: number;
  idempotencyKey: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface SparkStore {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  pendingTransactions: PendingSparkTx[];
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  freezesRemaining: number;
  graceDaysUsed: number;
  streakAtGraceStart: number;
}

export interface CooldownState {
  courseId: string;
  lessonsUsedToday: number;
  nextLessonAvailable: string | null;
  cooldownDate: string;
}

export interface CourseUnlock {
  courseId: string;
  unlockedAt: string;
  unlockMethod: string;
  sparkCost: number;
}

export type AchievementCriteria =
  | { type: "lessons_completed"; count: number }
  | { type: "streak"; days: number }
  | { type: "courses_completed"; count: number }
  | { type: "quiz_perfect" }
  | { type: "quiz_streak"; days: number }
  | { type: "purchase" }
  | { type: "courses_created"; count: number };

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  spark_reward: number;
  category: string;
  criteria: AchievementCriteria;
  sort_order: number;
}

export interface UserAchievement {
  achievementId: string;
  earnedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: "active" | "cancelled" | "expired" | "paused";
  startedAt: string;
  expiresAt: string | null;
  paymentProvider: string | null;
  externalId: string | null;
}

export interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
}

export interface SparkPurchaseTier {
  id: string;
  sparks: number;
  priceUsd: number;
  bonusSparks: number;
  label: string;
}

export interface SparkEconConfig {
  lessonReward: number;
  lessonRepeatReward: number;
  lessonRepeatMaxRewards: number;
  quizBaseReward: number;
  quizPerCorrectBonus: number;
  quizPerfectBonus: number;
  streakBonusTable: Record<number, number>;
  weeklyMilestoneReward: number;
  dailyEarnCap: number;
  subscriberDailyEarnCap: number;
  subscriberMultiplier: number;
  subscriberDailyBonus: number;
  cooldownHours: number;
  freeLessonsPerDay: number;
  cooldownSkipCost: number;
  streakFreezeCost: number;
  coursePrices: Record<string, number>;
  freeCourses: string[];
  diminishingReturnsThreshold: number;
  diminishingReturnsMultiplier: number;
}

export interface CreatorCourse {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  content: Record<string, unknown>;
  sparkPrice: number;
  status: "draft" | "pending_review" | "approved" | "rejected" | "published";
  reviewNotes: string | null;
  totalSales: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}
