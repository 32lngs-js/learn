import Link from "next/link";
import { getCourses } from "@/lib/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CourseLockIcon } from "@/components/sparks/CourseLockIcon";

export default function CurriculumPage() {
  const courses = getCourses();

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Curriculum</h1>
        <p className="text-muted-foreground">
          Choose a course to start learning
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Link key={course.id} href={`/curriculum/${course.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
              <div
                className="h-2"
                style={{ backgroundColor: course.color }}
              />
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  {course.title}
                  <CourseLockIcon courseId={course.id} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {course.description}
                </p>
                <Button
                  variant="outline"
                  className="gap-2"
                  style={{ borderColor: course.color, color: course.color }}
                >
                  Explore Course <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
