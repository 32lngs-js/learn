"use client";

import { useEffect, useState, useRef } from "react";
import { useSparks } from "@/lib/sparks/use-sparks";
import { cn } from "@/lib/utils";

export function SparksBadge() {
  const { balance } = useSparks();
  const [pulse, setPulse] = useState(false);
  const prevBalanceRef = useRef(balance);

  useEffect(() => {
    if (balance > 0 && balance !== prevBalanceRef.current) {
      prevBalanceRef.current = balance;
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(timer);
    }
  }, [balance]);

  if (balance === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
        "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
        "border border-amber-200 dark:border-amber-800",
        "transition-transform duration-300",
        pulse && "scale-110"
      )}
      title={`${balance} Sparks`}
    >
      <span className="text-base">&#9889;</span>
      <span className="tabular-nums">{balance.toLocaleString()}</span>
      <span className="text-xs opacity-70">Sparks</span>
    </div>
  );
}
