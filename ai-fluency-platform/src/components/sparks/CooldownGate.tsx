"use client";

import { useCooldown } from "@/lib/sparks/use-cooldown";
import { useSparks } from "@/lib/sparks/use-sparks";
import { useAuth } from "@/lib/auth-context";
import { SPARK_CONFIG } from "@/lib/sparks/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

interface CooldownGateProps {
  courseId: string;
  children: React.ReactNode;
}

export function CooldownGate({ courseId, children }: CooldownGateProps) {
  const { canAccess, timeRemaining, skip } = useCooldown(courseId);
  const { balance, refresh: refreshSparks } = useSparks();
  const { user } = useAuth();

  if (canAccess) {
    return <>{children}</>;
  }

  const canAffordSkip = balance >= SPARK_CONFIG.cooldownSkipCost;

  const handleSkip = () => {
    const result = skip(user?.id || "anon");
    if (result.success) {
      refreshSparks();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="text-4xl mb-2">&#9203;</div>
          <CardTitle>Cooldown Active</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground">
            Next lesson available in
          </p>
          <div className="text-3xl font-bold tabular-nums">
            {formatTime(timeRemaining)}
          </div>

          <div className="border-t pt-4 mt-2">
            <Button
              onClick={handleSkip}
              disabled={!canAffordSkip}
              className="w-full"
              size="lg"
            >
              Skip cooldown for {SPARK_CONFIG.cooldownSkipCost} &#9889; Sparks
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Your balance: <span className="font-medium">{balance.toLocaleString()} &#9889;</span>
              {!canAffordSkip && (
                <span className="block text-red-500 mt-1">
                  Need {SPARK_CONFIG.cooldownSkipCost - balance} more Sparks
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
