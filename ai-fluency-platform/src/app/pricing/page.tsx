"use client";

import { PURCHASE_TIERS } from "@/lib/sparks/config";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SparkPassCard } from "@/components/sparks/SparkPassCard";

export default function PricingPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Pricing</h1>
        <p className="text-muted-foreground">
          Choose a plan or buy Sparks to unlock content
        </p>
      </div>

      {/* Spark Pass */}
      <section className="max-w-md mx-auto mb-16">
        <SparkPassCard />
      </section>

      {/* Purchase Tiers */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-6">Buy Sparks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {PURCHASE_TIERS.map((tier) => (
            <Card key={tier.id}>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{tier.label}</CardTitle>
                <CardDescription>
                  {tier.sparks.toLocaleString()} + {tier.bonusSparks.toLocaleString()} bonus
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                  {(tier.sparks + tier.bonusSparks).toLocaleString()} &#9889;
                </div>
                <div className="text-lg font-semibold mb-3">${tier.priceUsd.toFixed(2)}</div>
                <Button className="w-full">Buy</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
