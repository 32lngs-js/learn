"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CreatorGate from "@/components/creator/CreatorGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SubmitCourseForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sparkPrice, setSparkPrice] = useState(100);
  const [contentJson, setContentJson] = useState("{}");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    let parsedContent: Record<string, unknown>;
    try {
      parsedContent = JSON.parse(contentJson);
    } catch {
      setError("Content must be valid JSON");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/creator/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          content: parsedContent,
          sparkPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Submission failed");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error, please try again");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Submitted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your course has been submitted for review. You&apos;ll be notified
              once it&apos;s approved or if changes are needed.
            </p>
            <button
              onClick={() => router.push("/creator")}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Back to Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit a Course</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="My Awesome Course"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={10}
                rows={3}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="What will learners gain from this course?"
              />
            </div>

            <div>
              <label
                htmlFor="sparkPrice"
                className="block text-sm font-medium"
              >
                Spark Price (50-5000)
              </label>
              <input
                id="sparkPrice"
                type="number"
                value={sparkPrice}
                onChange={(e) => setSparkPrice(Number(e.target.value))}
                min={50}
                max={5000}
                required
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium"
              >
                Course Content (JSON)
              </label>
              <textarea
                id="content"
                value={contentJson}
                onChange={(e) => setContentJson(e.target.value)}
                rows={8}
                className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm"
                placeholder='{"lessons": [...]}'
              />
              <p className="mt-1 text-xs text-muted-foreground">
                A rich editor is coming soon. For now, paste your course
                structure as JSON.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit for Review"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubmitCoursePage() {
  return (
    <CreatorGate>
      <SubmitCourseForm />
    </CreatorGate>
  );
}
