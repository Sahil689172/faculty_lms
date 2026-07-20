import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteLesson, listLessons } from "../features/lessons/lessons.api";
import type { Lesson } from "../features/lessons/lessons.types";
import { getApiErrorMessage } from "../lib/apiError";
import { formatDate, formatFileSize } from "../lib/format";
import { Alert, Button, Spinner } from "../components/ui";

export function DashboardPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setLessons(await listLessons());
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load lessons"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this lesson? This cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      await deleteLesson(id);
      setLessons((current) => current.filter((lesson) => lesson.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete lesson"));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My Lessons</h1>
          <p className="text-sm text-slate-500">Upload, review, and manage your lessons</p>
        </div>
        <Link to="/lessons/new">
          <Button>Upload lesson</Button>
        </Link>
      </div>

      {error ? <Alert>{error}</Alert> : null}

      {loading ? (
        <Spinner label="Loading lessons..." />
      ) : lessons.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">You have not uploaded any lessons yet.</p>
          <Link to="/lessons/new" className="mt-2 inline-block text-sm font-medium text-indigo-600">
            Upload your first lesson
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="space-y-1">
                <Link
                  to={`/lessons/${lesson.id}`}
                  className="text-lg font-medium text-slate-900 hover:text-indigo-600"
                >
                  {lesson.title}
                </Link>
                {lesson.description ? (
                  <p className="line-clamp-2 text-sm text-slate-500">{lesson.description}</p>
                ) : null}
                <p className="text-xs text-slate-400">
                  {lesson.originalFileName} · {formatFileSize(lesson.fileSize)} ·{" "}
                  {formatDate(lesson.createdAt)}
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <Link to={`/lessons/${lesson.id}`}>
                  <Button variant="secondary">View</Button>
                </Link>
                <Link to={`/lessons/${lesson.id}/edit`}>
                  <Button variant="secondary">Edit</Button>
                </Link>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(lesson.id)}
                  disabled={deletingId === lesson.id}
                >
                  {deletingId === lesson.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
