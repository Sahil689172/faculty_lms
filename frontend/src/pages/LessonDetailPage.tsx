import { Suspense, lazy, useEffect, useState } from "react";
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

const PdfViewer = lazy(() =>
  import("../components/PdfViewer").then((m) => ({ default: m.PdfViewer })),
);

export function LessonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const scope = useStaggerReveal<HTMLDivElement>([id]);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

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
        if (["PDF", "Image", "Video", "Slides"].includes(meta.label)) {
          try {
            const { url } = await getLessonDownload(id);
            if (active) setPreviewUrl(url);
          } catch {
            // Preview is best-effort; download button still works.
            if (active) setPreviewError(true);
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
        <Skeleton className="h-[70vh] w-full" />
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

      {/* Metadata header + actions */}
      <div data-reveal className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${meta.tint}`}>
            <meta.Icon className={`h-7 w-7 ${meta.color}`} />
          </span>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge tone="indigo">{meta.label}</Badge>
              <span className="text-xs text-slate-400">{formatFileSize(lesson.fileSize)}</span>
              <span className="text-xs text-slate-400">· {formatDate(lesson.createdAt)}</span>
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

      {/* Large preview */}
      <div data-reveal>
        <LessonPreview
          label={meta.label}
          previewUrl={previewUrl}
          previewError={previewError}
          lesson={lesson}
          onDownload={handleDownload}
          downloading={downloading}
        />
      </div>

      {/* Details + description */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card data-reveal className="p-6 lg:col-span-1">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Details</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <MetaRow label="File name" value={lesson.originalFileName} />
            <MetaRow label="File size" value={formatFileSize(lesson.fileSize)} />
            <MetaRow label="Type" value={lesson.mimeType} />
            <MetaRow label="Uploaded" value={formatDate(lesson.createdAt)} />
            <MetaRow label="Last updated" value={formatDate(lesson.updatedAt)} />
          </dl>
        </Card>

        <Card data-reveal className="p-6 lg:col-span-2">
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

function LessonPreview({
  label,
  previewUrl,
  previewError,
  lesson,
  onDownload,
  downloading,
}: {
  label: string;
  previewUrl: string | null;
  previewError: boolean;
  lesson: Lesson;
  onDownload: () => void;
  downloading: boolean;
}) {
  const meta = getFileMeta(lesson.mimeType, lesson.originalFileName);

  if (label === "PDF") {
    if (previewError) {
      return (
        <Card className="flex min-h-[24rem] flex-col items-center justify-center px-6 py-16 text-center">
          <span className={`flex h-20 w-20 items-center justify-center rounded-3xl ${meta.tint}`}>
            <meta.Icon className={`h-10 w-10 ${meta.color}`} />
          </span>
          <h3 className="mt-5 font-display text-lg font-bold text-slate-900 dark:text-white">
            Couldn&apos;t load the preview
          </h3>
          <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
            We couldn&apos;t generate a preview link. You can still download the file.
          </p>
          <Button onClick={onDownload} loading={downloading} className="mt-6">
            <FiDownload className="h-4 w-4" />
            Download file
          </Button>
        </Card>
      );
    }
    if (!previewUrl) {
      return <Card className="h-[60vh]"><Skeleton className="h-full w-full" /></Card>;
    }
    return (
      <Suspense fallback={<Card className="h-[60vh]"><Skeleton className="h-full w-full" /></Card>}>
        <PdfViewer url={previewUrl} onDownload={onDownload} />
      </Suspense>
    );
  }

  if (previewUrl && label === "Image") {
    return (
      <Card className="flex min-h-[24rem] items-center justify-center overflow-hidden bg-slate-100 p-4 dark:bg-black/20">
        <img src={previewUrl} alt={lesson.originalFileName} className="max-h-[70vh] max-w-full rounded-xl" />
      </Card>
    );
  }

  if (previewUrl && label === "Video") {
    return (
      <Card className="flex min-h-[24rem] items-center justify-center overflow-hidden bg-black">
        <video src={previewUrl} controls className="max-h-[70vh] w-full">
          Your browser does not support embedded video.
        </video>
      </Card>
    );
  }

  if (label === "Slides") {
    return (
      <PptPreview
        previewUrl={previewUrl}
        lesson={lesson}
        onDownload={onDownload}
        downloading={downloading}
      />
    );
  }

  return (
    <Card className="flex min-h-[24rem] flex-col items-center justify-center px-6 py-16 text-center">
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
    </Card>
  );
}

function PptPreview({
  previewUrl,
  lesson,
  onDownload,
  downloading,
}: {
  previewUrl: string | null;
  lesson: Lesson;
  onDownload: () => void;
  downloading: boolean;
}) {
  const meta = getFileMeta(lesson.mimeType, lesson.originalFileName);
  const [useOffice, setUseOffice] = useState(true);

  // Microsoft Office Online can render public (signed) URLs in an iframe.
  if (previewUrl && useOffice) {
    const officeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      previewUrl,
    )}`;
    return (
      <Card className="overflow-hidden">
        <div className="glass-header flex items-center justify-between gap-2 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <meta.Icon className={`h-4 w-4 shrink-0 ${meta.color}`} />
            <span className="truncate text-sm font-medium text-slate-600 dark:text-slate-300">
              {lesson.originalFileName}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setUseOffice(false)}
              className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-500/10 dark:text-slate-400"
            >
              Preview unavailable?
            </button>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-500/10 dark:text-indigo-400"
            >
              <FiExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Open</span>
            </a>
          </div>
        </div>
        <iframe
          title={`Preview of ${lesson.originalFileName}`}
          src={officeSrc}
          className="h-[calc(100vh-16rem)] min-h-[28rem] w-full border-0 bg-white"
        />
      </Card>
    );
  }

  return (
    <Card className="flex min-h-[24rem] flex-col items-center justify-center px-6 py-16 text-center">
      <span className={`flex h-20 w-20 items-center justify-center rounded-3xl ${meta.tint}`}>
        <meta.Icon className={`h-10 w-10 ${meta.color}`} />
      </span>
      <h3 className="mt-5 font-display text-lg font-bold text-slate-900 dark:text-white">
        {lesson.originalFileName}
      </h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {meta.label} · {formatFileSize(lesson.fileSize)} · {formatDate(lesson.createdAt)}
      </p>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        PowerPoint files can&apos;t be previewed reliably in the browser. Download the file or open
        it in a new tab.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={onDownload} loading={downloading}>
          <FiDownload className="h-4 w-4" />
          Download
        </Button>
        {previewUrl ? (
          <a href={previewUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">
              <FiExternalLink className="h-4 w-4" />
              Open in new tab
            </Button>
          </a>
        ) : null}
      </div>
    </Card>
  );
}
