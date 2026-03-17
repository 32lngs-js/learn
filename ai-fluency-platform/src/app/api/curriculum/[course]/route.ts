import { getCurriculum } from "@/lib/content";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ course: string }> }
) {
  const { course } = await params;
  try {
    const curriculum = getCurriculum(course);
    return Response.json(curriculum);
  } catch {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }
}
