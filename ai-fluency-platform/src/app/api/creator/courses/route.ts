import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: courses, error } = await supabase
    .from("creator_courses")
    .select("*")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

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
      reviewNotes: c.review_notes,
      totalSales: c.total_sales,
      totalRevenue: c.total_revenue,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    })),
  });
}
