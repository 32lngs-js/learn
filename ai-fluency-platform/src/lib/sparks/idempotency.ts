/**
 * Generate a deterministic idempotency key for spark transactions.
 *
 * Examples:
 *   generateIdempotencyKey(userId, 'lesson_completed', 'claude-code/level-1/intro:2026-04-04')
 *   generateIdempotencyKey(userId, 'streak_bonus', '7:2026-04-04')
 */
export function generateIdempotencyKey(
  userId: string,
  txType: string,
  context: string
): string {
  return `${userId}:${txType}:${context}`;
}
