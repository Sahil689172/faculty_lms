import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiDownload, FiEdit2, FiExternalLink, FiTrash2 } from "react-icons/fi";
import {
  deleteLesson,
  getLesson,
  getLessonDownload,
} from "../features/lessons/lessons.api";
import type { Lesson } from "../features/lessons/lessons.types";
import { getApiErrorMessage } from "../lib/apiError";
import { formatDate, formatFileSize } from "../lib/format";
import { getFileMeta } from "../lib/fileMeta";
import { useStaggerReveal } from "../lib/useGsap";
import { Alert, Badge, Button, Card, Skeleton } from "../components/ui";

export function LessonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const scope = useStaggerReveal<HTMLDivElement>([id]);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    let active = true;
    setLoading(true);

    getLesson(id)
      .then(async (loaded) => {
        if (!active) return;
        setLesson(loaded);

        const meta = getFileMeta(loaded.mimeType, loaded.originalFileName);
        if (["PDF", "Image", "Video"].includes(meta.label)) {
          try {
            const { url } = await getLessonDownload(id);
            if (active) setPreviewUrl(url);
          } catch {
            // Preview is best-effort; download button still works.
          }
        }
      })
      .catch((err) => active && setError(getApiErrorMessage(err, "Failed to load lesson")))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
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
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-2/3" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="space-y-4">
        <Alert>{error ?? "Lesson not found"}</Alert>
        <Link to="/" className="text-sm font-medium text-indigo-600">
          Back to lessons
        </Link>
      </div>
    );
  }

  const meta = getFileMeta(lesson.mimeType, lesson.originalFileName);

  return (
    <div ref={scope} className="space-y-6">
      <Link
        to="/"
        data-reveal
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to lessons
      </Link>

      {error ? <Alert>{error}</Alert> : null}

      {/* Header */}
      <div data-reveal className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${meta.tint}`}>
            <meta.Icon className={`h-7 w-7 ${meta.color}`} />
          </span>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge tone="indigo">{meta.label}</Badge>
              <span className="text-xs text-slate-400">{formatFileSize(lesson.fileSize)}</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
              {lesson.title}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleDownload} loading={downloading}>
            <FiDownload className="h-4 w-4" />
            {downloading ? "Preparing..." : "Download"}
          </Button>
          <Link to={`/lessons/${lesson.id}/edit`}>
            <Button variant="secondary">
              <FiEdit2 className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="ghost" onClick={handleDelete} className="text-red-600 dark:text-red-400">
            <FiTrash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Preview */}
        <Card data-reveal className="overflow-hidden lg:col-span-2">
          <FilePreview
            label={meta.label}
            previewUrl={previewUrl}
            fileName={lesson.originalFileName}
            onDownload={handleDownload}
            downloading={downloading}
          />
        </Card>

        {/* Metadata */}
        <div className="space-y-6">
          <Card data-reveal className="p-6">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Details</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <MetaRow label="File name" value={lesson.originalFileName} />
              <MetaRow label="File size" value={formatFileSize(lesson.fileSize)} />
              <MetaRow label="Type" value={lesson.mimeType} />
              <MetaRow label="Uploaded" value={formatDate(lesson.createdAt)} />
              <MetaRow label="Last updated" value={formatDate(lesson.updatedAt)} />
            </dl>
          </Card>

          <Card data-reveal className="p-6">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Description
            </h2>
            {lesson.description ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {lesson.description}
              </p>
            ) : (
              <p className="mt-3 text-sm italic text-slate-400">No description provided.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 break-words font-medium text-slate-700 dark:text-slate-200">{value}</dd>
    </div>
  );
}

function FilePreview({
  label,
  previewUrl,
  fileName,
  onDownload,
  downloading,
}: {
  label: string;
  previewUrl: string | null;
  fileName: string;
  onDownload: () => void;
  downloading: boolean;
}) {
  const meta = getFileMeta(undefined, fileName);

  if (previewUrl && label === "PDF") {
    return (
      <iframe
        title={`Preview of ${fileName}`}
        src={previewUrl}
        className="h-[70vh] w-full border-0 bg-white"
      />
    );
  }

  if (previewUrl && label === "Image") {
    return (
      <div className="flex min-h-[24rem] items-center justify-center bg-slate-100 p-4 dark:bg-black/20">
        <img src={previewUrl} alt={fileName} className="max-h-[70vh] max-w-full rounded-xl" />
      </div>
    );
  }

  if (previewUrl && label === "Video") {
    return (
      <div className="flex min-h-[24rem] items-center justify-center bg-black">
        <video src={previewUrl} controls className="max-h-[70vh] w-full">
          Your browser does not support embedded video.
        </video>
      </div>
    );
  }

  return (
    <div className="flex min-h-[24rem] flex-col items-center justify-center px-6 py-16 text-center">
      <span className={`flex h-20 w-20 items-center justify-center rounded-3xl ${meta.tint}`}>
        <meta.Icon className={`h-10 w-10 ${meta.color}`} />
      </span>
      <h3 className="mt-5 font-display text-lg font-bold text-slate-900 dark:text-white">
        Preview not available
      </h3>
      <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
        This file type can&apos;t be previewed in the browser. Download it to view the full content.
      </p>
      <Button onClick={onDownload} loading={downloading} className="mt-6">
        <FiExternalLink className="h-4 w-4" />
        Open file
      </Button>
    </div>
  );
}
