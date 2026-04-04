"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BENEFITS = [
  "2x Spark earning on all activities",
  "Daily bonus Sparks",
  "Exclusive achievements",
  "Priority support",
  "Support the platform",
];

const PLANS = {
  monthly: { price: 9.99, label: "Monthly" },
  annual: { price: 79.99, label: "Annual", savings: "33% off" },
};

export function SparkPassCard() {
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");

  return (
    <Card className="border-amber-200 dark:border-amber-800 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />
      <CardHeader className="text-center">
        <div className="text-3xl mb-1">&#9889;</div>
        <CardTitle className="text-xl">Spark Pass</CardTitle>
        <CardDescription>Supercharge your learning</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Plan toggle */}
        <div className="flex items-center justify-center gap-2 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setPlan("monthly")}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              plan === "monthly"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setPlan("annual")}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              plan === "annual"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Annual
            {PLANS.annual.savings && (
              <span className="ml-1.5 text-xs text-green-600 dark:text-green-400 font-semibold">
                {PLANS.annual.savings}
              </span>
            )}
          </button>
        </div>

        {/* Price */}
        <div className="text-center">
          <span className="text-3xl font-bold">${PLANS[plan].price}</span>
          <span className="text-muted-foreground text-sm">
            /{plan === "monthly" ? "mo" : "yr"}
          </span>
        </div>

        {/* Benefits */}
        <ul className="space-y-2">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-sm">
              <span className="text-green-500">&#10003;</span>
              {benefit}
            </li>
          ))}
        </ul>

        <Button className="w-full" size="lg">
          Subscribe
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Cancel anytime. No commitment.
        </p>
      </CardContent>
    </Card>
  );
}
