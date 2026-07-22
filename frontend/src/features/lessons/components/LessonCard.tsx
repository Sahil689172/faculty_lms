import { useState } from "react";
import { Link } from "react-router-dom";
import { FiDownload, FiEdit2, FiExternalLink, FiEye, FiTrash2 } from "react-icons/fi";
import type { Lesson } from "../lessons.types";
import { getLessonDownload } from "../lessons.api";
import { getFileMeta, isPdf, isPowerpoint } from "../../../lib/fileMeta";
import { formatDate, formatFileSize } from "../../../lib/format";
import { Badge, Button, Card } from "../../../components/ui";

export function LessonCard({
  lesson,
  onDelete,
  deleting,
}: {
  lesson: Lesson;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const meta = getFileMeta(lesson.mimeType, lesson.originalFileName);
  const pdf = isPdf(lesson.mimeType, lesson.originalFileName);
  const ppt = isPowerpoint(lesson.mimeType, lesson.originalFileName);
  const [busy, setBusy] = useState(false);

  async function openInNewTab() {
    setBusy(true);
    try {
      const { url } = await getLessonDownload(lesson.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card hover data-reveal className="flex flex-col p-5">
      <div className="flex items-start gap-4">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${meta.tint}`}
        >
          <meta.Icon className={`h-6 w-6 ${meta.color}`} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge tone="indigo">{meta.label}</Badge>
            <span className="text-xs text-slate-400">{formatFileSize(lesson.fileSize)}</span>
          </div>
          <Link
            to={`/lessons/${lesson.id}`}
            className="mt-2 block truncate font-display text-lg font-semibold text-slate-900 transition-colors hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
          >
            {lesson.title}
          </Link>
          <p className="mt-0.5 truncate text-xs text-slate-400">{lesson.originalFileName}</p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {lesson.description || "No description provided."}
      </p>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-200/70 pt-4 dark:border-white/10">
        {pdf ? (
          <Link to={`/lessons/${lesson.id}`}>
            <Button size="sm">
              <FiEye className="h-4 w-4" />
              Preview
            </Button>
          </Link>
        ) : ppt ? (
          <Button size="sm" onClick={openInNewTab} loading={busy}>
            <FiExternalLink className="h-4 w-4" />
            Open
          </Button>
        ) : null}

        <Button size="sm" variant="secondary" onClick={openInNewTab} loading={busy}>
          <FiDownload className="h-4 w-4" />
          Download
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <Link
            to={`/lessons/${lesson.id}/edit`}
            aria-label="Edit lesson"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 dark:text-slate-400"
          >
            <FiEdit2 className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(lesson.id)}
            disabled={deleting}
            aria-label="Delete lesson"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 dark:text-slate-400"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-3 truncate text-xs text-slate-400">Updated {formatDate(lesson.updatedAt)}</p>
    </Card>
  );
}
