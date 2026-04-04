import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const CREATOR_MIN_COURSES = 3;
const CREATOR_MIN_SPARKS = 500;
const MIN_SPARK_PRICE = 50;
const MAX_SPARK_PRICE = 5000;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check creator eligibility
  const { count: coursesCompleted } = await supabase
    .from("course_unlocks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: wallet } = await supabase
    .from("spark_wallets")
    .select("lifetime_earned")
    .eq("user_id", user.id)
    .maybeSingle();

  const lifetimeSparks = wallet?.lifetime_earned ?? 0;
  const courses = coursesCompleted ?? 0;

  if (courses < CREATOR_MIN_COURSES && lifetimeSparks < CREATOR_MIN_SPARKS) {
    return NextResponse.json(
      { error: "Not eligible to create courses" },
      { status: 403 }
    );
  }

  // Validate request body
  const body = await request.json();
  const { title, description, content, sparkPrice } = body;

  if (!title || typeof title !== "string" || title.trim().length < 3) {
    return NextResponse.json(
      { error: "Title must be at least 3 characters" },
      { status: 400 }
    );
  }

  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length < 10
  ) {
    return NextResponse.json(
      { error: "Description must be at least 10 characters" },
      { status: 400 }
    );
  }

  if (!content || typeof content !== "object") {
    return NextResponse.json(
      { error: "Content must be a valid object" },
      { status: 400 }
    );
  }

  if (
    typeof sparkPrice !== "number" ||
    sparkPrice < MIN_SPARK_PRICE ||
    sparkPrice > MAX_SPARK_PRICE
  ) {
    return NextResponse.json(
      {
        error: `Spark price must be between ${MIN_SPARK_PRICE} and ${MAX_SPARK_PRICE}`,
      },
      { status: 400 }
    );
  }

  // Insert course
  const { data: course, error } = await supabase
    .from("creator_courses")
    .insert({
      creator_id: user.id,
      title: title.trim(),
      description: description.trim(),
      content,
      spark_price: sparkPrice,
      status: "pending_review",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ courseId: course.id }, { status: 201 });
}
