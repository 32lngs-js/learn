"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { SparkPurchaseTier } from "@/types/sparks";

interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
  tier: SparkPurchaseTier;
  isFirstPurchase?: boolean;
}

export function PurchaseModal({ open, onClose, tier, isFirstPurchase }: PurchaseModalProps) {
  const totalSparks = tier.sparks + tier.bonusSparks;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="text-4xl mb-2">&#9889;</div>
          <DialogTitle>{tier.label} Pack</DialogTitle>
          <DialogDescription>
            {tier.sparks.toLocaleString()} Sparks + {tier.bonusSparks.toLocaleString()} bonus
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
              {totalSparks.toLocaleString()} &#9889;
            </div>
            <div className="text-2xl font-bold mt-1">${tier.priceUsd.toFixed(2)}</div>
          </div>

          {isFirstPurchase && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 text-center">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                &#127881; First Purchase Bonus! Extra {tier.bonusSparks} Sparks included.
              </p>
            </div>
          )}

          <Button className="w-full" size="lg">
            Buy Now
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
