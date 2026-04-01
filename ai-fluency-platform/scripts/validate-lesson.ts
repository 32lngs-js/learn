/**
 * Validates a lesson JSON file has required reviewQuestions.
 * Used as a Claude Code hook after editing content files.
 * Usage: npx tsx scripts/validate-lesson.ts <file-path>
 */

import * as fs from "fs";

const filePath = process.argv[2];
if (!filePath) {
  process.exit(0);
}

// Only validate lesson content files
if (!filePath.includes("/content/") || !filePath.endsWith(".json")) {
  process.exit(0);
}

try {
  const raw = fs.readFileSync(filePath, "utf-8");
  const lesson = JSON.parse(raw);

  // Skip non-lesson files
  if (!lesson.meta || !lesson.meta.slug) process.exit(0);
  if (lesson.meta.isIndex || lesson.meta.isCheckpoint) process.exit(0);
  if (lesson.meta.isPracticeOnly || lesson.meta.isExamBank) process.exit(0);

  // Skip curriculum.json, courses.json, etc.
  const basename = filePath.split("/").pop();
  if (basename === "curriculum.json" || basename === "courses.json") {
    process.exit(0);
  }

  // Check for reviewQuestions
  const questions = lesson.reviewQuestions;
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    console.error(
      `\n⚠️  Missing reviewQuestions in ${filePath}\n` +
        `   Lessons must include 2-3 review questions for the daily quiz.\n` +
        `   See CLAUDE.md for the schema and examples.\n`
    );
    process.exit(1);
  }

  // Validate each question
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const prefix = `reviewQuestions[${i}]`;
    const errors: string[] = [];

    if (!q.question || typeof q.question !== "string")
      errors.push(`${prefix}.question is required`);
    if (!Array.isArray(q.options) || q.options.length < 3)
      errors.push(`${prefix}.options must have at least 3 items`);
    if (typeof q.correctIndex !== "number" || q.correctIndex < 0)
      errors.push(`${prefix}.correctIndex must be a non-negative number`);
    if (q.options && q.correctIndex >= q.options.length)
      errors.push(`${prefix}.correctIndex is out of bounds`);
    if (!q.explanation) errors.push(`${prefix}.explanation is required`);
    if (!q.encourageCorrect)
      errors.push(`${prefix}.encourageCorrect is required`);
    if (!q.encourageIncorrect)
      errors.push(`${prefix}.encourageIncorrect is required`);

    if (errors.length > 0) {
      console.error(`\n⚠️  Invalid reviewQuestions in ${filePath}:`);
      errors.forEach((e) => console.error(`   - ${e}`));
      process.exit(1);
    }
  }
} catch (e) {
  if (e instanceof SyntaxError) {
    console.error(`\n⚠️  Invalid JSON in ${filePath}: ${e.message}`);
    process.exit(1);
  }
  // File doesn't exist or other error — not our problem
  process.exit(0);
}
