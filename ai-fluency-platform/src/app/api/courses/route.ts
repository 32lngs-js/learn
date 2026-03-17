import { getCourses } from "@/lib/content";

export async function GET() {
  const courses = getCourses();
  return Response.json(courses);
}
