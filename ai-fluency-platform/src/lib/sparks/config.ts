import type { SparkEconConfig, SparkPurchaseTier } from "@/types/sparks";

export const SPARK_CONFIG: SparkEconConfig = {
  lessonReward: 10,
  lessonRepeatReward: 5,
  lessonRepeatMaxRewards: 3,
  quizBaseReward: 5,
  quizPerCorrectBonus: 2,
  quizPerfectBonus: 5,
  streakBonusTable: { 7: 20, 14: 35, 21: 50, 30: 75 },
  weeklyMilestoneReward: 10,
  dailyEarnCap: 500,
  subscriberDailyEarnCap: 1000,
  subscriberMultiplier: 2,
  subscriberDailyBonus: 5,
  cooldownHours: 20,
  freeLessonsPerDay: 1,
  cooldownSkipCost: 25,
  streakFreezeCost: 50,
  coursePrices: {
    "web-fundamentals": 300,
    "react-literacy": 300,
    "claude-code": 500,
    "system-design": 500,
    "cfa-1": 750,
    "cfa-2": 750,
    "cfa-3": 750,
  },
  freeCourses: ["ai-fluency", "texas-holdem"],
  diminishingReturnsThreshold: 3,
  diminishingReturnsMultiplier: 0.5,
};

export const PURCHASE_TIERS: SparkPurchaseTier[] = [
  { id: "starter", sparks: 50, priceUsd: 0.99, bonusSparks: 25, label: "Starter" },
  { id: "explorer", sparks: 300, priceUsd: 4.99, bonusSparks: 100, label: "Explorer" },
  { id: "adventurer", sparks: 700, priceUsd: 9.99, bonusSparks: 200, label: "Adventurer" },
  { id: "champion", sparks: 2000, priceUsd: 24.99, bonusSparks: 500, label: "Champion" },
  { id: "legend", sparks: 4500, priceUsd: 49.99, bonusSparks: 1000, label: "Legend" },
];
