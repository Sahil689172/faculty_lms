import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteLesson,
  getLesson,
  getLessonDownload,
} from "../features/lessons/lessons.api";
import type { Lesson } from "../features/lessons/lessons.types";
import { getApiErrorMessage } from "../lib/apiError";
import { formatDate, formatFileSize } from "../lib/format";
import { Alert, Button, Spinner } from "../components/ui";

export function LessonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    setLoading(true);
    getLesson(id)
      .then(setLesson)
      .catch((err) => setError(getApiErrorMessage(err, "Failed to load lesson")))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDownload() {
    if (!id) {
      return;
    }

    setDownloading(true);
    setError(null);

    try {
      const { url } = await getLessonDownload(id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to generate download link"));
    } finally {
      setDownloading(false);
    }
  }

  async function handleDelete() {
    if (!id || !window.confirm("Delete this lesson? This cannot be undone.")) {
      return;
    }

    try {
      await deleteLesson(id);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete lesson"));
    }
  }

  if (loading) {
    return <Spinner label="Loading lesson..." />;
  }

  if (!lesson) {
    return (
      <div className="space-y-4">
        {error ? <Alert>{error}</Alert> : <Alert>Lesson not found</Alert>}
        <Link to="/" className="text-sm font-medium text-indigo-600">
          Back to lessons
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm font-medium text-indigo-600">
        &larr; Back to lessons
      </Link>

      {error ? <Alert>{error}</Alert> : null}

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{lesson.title}</h1>
        {lesson.description ? (
          <p className="mt-2 whitespace-pre-line text-slate-600">{lesson.description}</p>
        ) : (
          <p className="mt-2 text-sm italic text-slate-400">No description</p>
        )}

        <dl className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-400">File</dt>
            <dd className="text-slate-700">{lesson.originalFileName}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Size</dt>
            <dd className="text-slate-700">{formatFileSize(lesson.fileSize)}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Type</dt>
            <dd className="text-slate-700">{lesson.mimeType}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Uploaded</dt>
            <dd className="text-slate-700">{formatDate(lesson.createdAt)}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={handleDownload} disabled={downloading}>
            {downloading ? "Preparing..." : "Download file"}
          </Button>
          <Link to={`/lessons/${lesson.id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
