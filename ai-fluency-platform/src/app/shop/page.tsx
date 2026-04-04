"use client";

import { SparkShop } from "@/components/sparks/SparkShop";

export default function ShopPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Spark Shop</h1>
        <p className="text-muted-foreground">
          Earn and spend Sparks to unlock courses, items, and more
        </p>
      </div>
      <SparkShop />
    </main>
  );
}
