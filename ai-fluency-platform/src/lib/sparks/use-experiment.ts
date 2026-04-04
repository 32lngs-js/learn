"use client";

import { useState, useEffect } from "react";
import type { ExperimentAssignment } from "@/types/sparks";

const EXPERIMENTS_KEY = "aif_experiments";

/**
 * React hook for getting a user's experiment variant assignment.
 */
export function useExperiment(experimentId: string): {
  variantId: string | null;
  isLoading: boolean;
} {
  const [variantId, setVariantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check cache first
    try {
      const raw = localStorage.getItem(EXPERIMENTS_KEY);
      if (raw) {
        const cached: ExperimentAssignment[] = JSON.parse(raw);
        const found = cached.find((a) => a.experimentId === experimentId);
        if (found) {
          setVariantId(found.variantId);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Ignore cache errors
    }

    // Fetch from server
    fetch("/api/sparks/experiments")
      .then((res) => res.json())
      .then((data) => {
        const assignments: ExperimentAssignment[] = data.assignments ?? [];
        localStorage.setItem(EXPERIMENTS_KEY, JSON.stringify(assignments));
        const found = assignments.find((a) => a.experimentId === experimentId);
        setVariantId(found?.variantId ?? null);
      })
      .catch(() => {
        setVariantId(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [experimentId]);

  return { variantId, isLoading };
}

/**
 * React hook for getting an experiment-overridden config value.
 */
export function useConfigValue<T>(
  parameterKey: string,
  defaultValue: T
): { value: T; isLoading: boolean } {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sparks/experiments")
      .then((res) => res.json())
      .then((data) => {
        const overrides: Record<string, unknown> = data.overrides ?? {};
        if (parameterKey in overrides) {
          setValue(overrides[parameterKey] as T);
        }
        // Cache assignments
        if (data.assignments) {
          localStorage.setItem(
            EXPERIMENTS_KEY,
            JSON.stringify(data.assignments)
          );
        }
      })
      .catch(() => {
        // Keep default
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [parameterKey, defaultValue]);

  return { value, isLoading };
}
