import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET: Return all active experiment assignments for the current user
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch active experiments
  const { data: experiments } = await supabase
    .from("ab_experiments")
    .select("*")
    .eq("status", "active");

  // Fetch user's existing assignments
  const { data: assignments } = await supabase
    .from("ab_assignments")
    .select("experiment_id, variant_id")
    .eq("user_id", user.id);

  const assignmentMap = new Map(
    (assignments ?? []).map((a) => [a.experiment_id, a.variant_id])
  );

  // Build assignment list, auto-assigning if needed
  const result: { experimentId: string; variantId: string }[] = [];
  const overrides: Record<string, unknown> = {};

  for (const exp of experiments ?? []) {
    let variantId = assignmentMap.get(exp.id);

    if (!variantId) {
      // Auto-assign via weighted random
      const variants = (exp.variants as { id: string; weight: number; value?: unknown }[]) ?? [];
      variantId = weightedRandomVariant(variants);

      if (variantId) {
        await supabase.from("ab_assignments").insert({
          user_id: user.id,
          experiment_id: exp.id,
          variant_id: variantId,
        });
      }
    }

    if (variantId) {
      result.push({ experimentId: exp.id, variantId });

      // Find the variant value for config overrides
      const variants = (exp.variants as { id: string; weight: number; value?: unknown }[]) ?? [];
      const variant = variants.find((v) => v.id === variantId);
      if (variant?.value !== undefined && exp.parameter_key) {
        overrides[exp.parameter_key] = variant.value;
      }
    }
  }

  return NextResponse.json({ assignments: result, overrides });
}

// POST: Manually assign user to experiment variant
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { experimentId, variantId } = body;

  if (!experimentId || !variantId) {
    return NextResponse.json(
      { error: "Missing experimentId or variantId" },
      { status: 400 }
    );
  }

  // Verify experiment exists and is active
  const { data: experiment } = await supabase
    .from("ab_experiments")
    .select("id, variants")
    .eq("id", experimentId)
    .eq("status", "active")
    .single();

  if (!experiment) {
    return NextResponse.json(
      { error: "Experiment not found or not active" },
      { status: 404 }
    );
  }

  // Upsert assignment
  const { error } = await supabase.from("ab_assignments").upsert(
    {
      user_id: user.id,
      experiment_id: experimentId,
      variant_id: variantId,
    },
    { onConflict: "user_id,experiment_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ experimentId, variantId });
}

function weightedRandomVariant(
  variants: { id: string; weight: number }[]
): string | null {
  if (variants.length === 0) return null;

  const totalWeight = variants.reduce((sum, v) => sum + (v.weight ?? 1), 0);
  let random = Math.random() * totalWeight;

  for (const variant of variants) {
    random -= variant.weight ?? 1;
    if (random <= 0) return variant.id;
  }

  return variants[0].id;
}
