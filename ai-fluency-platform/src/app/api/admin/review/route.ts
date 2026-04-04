import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Hardcoded admin user IDs — in production, use a role-based system
const ADMIN_IDS: Set<string> = new Set([
  // Add admin user UUIDs here
]);

async function isAdmin(userId: string): Promise<boolean> {
  if (ADMIN_IDS.size > 0 && ADMIN_IDS.has(userId)) return true;
  // Fallback: could check a profile role column in the future
  return false;
}

// GET: List courses pending review
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: courses, error } = await supabase
    .from("creator_courses")
    .select("*")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    courses: (courses ?? []).map((c) => ({
      id: c.id,
      creatorId: c.creator_id,
      title: c.title,
      description: c.description,
      content: c.content,
      sparkPrice: c.spark_price,
      status: c.status,
      createdAt: c.created_at,
    })),
  });
}

// POST: Approve or reject a course
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { courseId, action, reviewNotes } = body;

  if (!courseId || !action) {
    return NextResponse.json(
      { error: "Missing courseId or action" },
      { status: 400 }
    );
  }

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json(
      { error: 'Action must be "approve" or "reject"' },
      { status: 400 }
    );
  }

  const newStatus = action === "approve" ? "published" : "rejected";

  const { error } = await supabase
    .from("creator_courses")
    .update({
      status: newStatus,
      review_notes: reviewNotes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", courseId)
    .eq("status", "pending_review");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ courseId, status: newStatus });
}
