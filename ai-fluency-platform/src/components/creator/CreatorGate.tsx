"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface EligibilityData {
  eligible: boolean;
  coursesCompleted: number;
  lifetimeSparks: number;
  requiresCourses: number;
  requiresSparks: number;
}

export default function CreatorGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/creator/eligibility")
      .then((res) => res.json())
      .then((data) => setEligibility(data))
      .catch(() =>
        setEligibility({
          eligible: false,
          coursesCompleted: 0,
          lifetimeSparks: 0,
          requiresCourses: 3,
          requiresSparks: 500,
        })
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!eligibility || !eligibility.eligible) {
    const data = eligibility ?? {
      coursesCompleted: 0,
      lifetimeSparks: 0,
      requiresCourses: 3,
      requiresSparks: 500,
    };

    const courseProgress = Math.min(
      100,
      (data.coursesCompleted / data.requiresCourses) * 100
    );
    const sparkProgress = Math.min(
      100,
      (data.lifetimeSparks / data.requiresSparks) * 100
    );

    return (
      <div className="mx-auto max-w-lg p-6">
        <Card>
          <CardHeader>
            <CardTitle>Become a Creator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Meet one of these requirements to start creating courses:
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Courses completed</span>
                <span>
                  {data.coursesCompleted} / {data.requiresCourses}
                </span>
              </div>
              <Progress value={courseProgress} />
            </div>

            <div className="text-center text-xs text-muted-foreground">OR</div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Lifetime sparks earned</span>
                <span>
                  {data.lifetimeSparks} / {data.requiresSparks}
                </span>
              </div>
              <Progress value={sparkProgress} />
            </div>

            <p className="text-xs text-muted-foreground">
              Keep learning and earning sparks to unlock creator mode!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
