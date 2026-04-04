"use client";

import type { ExperimentAssignment } from "@/types/sparks";

const EXPERIMENTS_KEY = "aif_experiments";

function getCachedAssignments(): ExperimentAssignment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EXPERIMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupted data
  }
  return [];
}

function saveCachedAssignments(assignments: ExperimentAssignment[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(EXPERIMENTS_KEY, JSON.stringify(assignments));
}

/**
 * Get the user's variant assignment for a specific experiment.
 * Checks local cache first, then fetches from server.
 */
export async function getExperimentAssignment(
  experimentId: string
): Promise<string | null> {
  // Check cache first
  const cached = getCachedAssignments();
  const existing = cached.find((a) => a.experimentId === experimentId);
  if (existing) return existing.variantId;

  // Fetch from server
  try {
    const res = await fetch("/api/sparks/experiments");
    if (!res.ok) return null;
    const data = await res.json();
    const assignments: ExperimentAssignment[] = data.assignments ?? [];
    saveCachedAssignments(assignments);
    const found = assignments.find((a) => a.experimentId === experimentId);
    return found?.variantId ?? null;
  } catch {
    return null;
  }
}

/**
 * Get a config value that may be overridden by an experiment.
 * Returns the experiment override value or the default.
 */
export async function getConfigValue<T>(
  parameterKey: string,
  defaultValue: T
): Promise<T> {
  try {
    const res = await fetch("/api/sparks/experiments");
    if (!res.ok) return defaultValue;
    const data = await res.json();
    const assignments: ExperimentAssignment[] = data.assignments ?? [];
    saveCachedAssignments(assignments);

    // Look for an experiment that overrides this parameter
    const overrides: Record<string, unknown> = data.overrides ?? {};
    if (parameterKey in overrides) {
      return overrides[parameterKey] as T;
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
}
