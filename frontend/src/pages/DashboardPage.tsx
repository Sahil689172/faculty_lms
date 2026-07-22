import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { IconType } from "react-icons";
import { FiBookOpen, FiClock, FiHardDrive, FiLayers, FiPlus } from "react-icons/fi";
import { deleteLesson, listLessons } from "../features/lessons/lessons.api";
import type { Lesson } from "../features/lessons/lessons.types";
import { LessonCard } from "../features/lessons/components/LessonCard";
import { useAuth } from "../features/auth/useAuth";
import { getApiErrorMessage } from "../lib/apiError";
import { formatDate, formatFileSize } from "../lib/format";
import { getFileMeta } from "../lib/fileMeta";
import { useStaggerReveal } from "../lib/useGsap";
import { Alert, Button, Card, Skeleton } from "../components/ui";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
  color,
}: {
  icon: IconType;
  label: string;
  value: string;
  tint: string;
  color: string;
}) {
  return (
    <Card data-reveal className="flex items-center gap-4 p-5">
      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tint}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="truncate font-display text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const { faculty } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const scope = useStaggerReveal<HTMLDivElement>([loading, lessons.length]);

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

  const stats = useMemo(() => {
    const totalSize = lessons.reduce((sum, lesson) => sum + lesson.fileSize, 0);
    const types = new Set(
      lessons.map((lesson) => getFileMeta(lesson.mimeType, lesson.originalFileName).label),
    );
    const latest = lessons.reduce<string | null>((newest, lesson) => {
      if (!newest || lesson.updatedAt > newest) return lesson.updatedAt;
      return newest;
    }, null);

    return {
      total: lessons.length,
      totalSize: formatFileSize(totalSize),
      types: types.size,
      latest: latest ? formatDate(latest) : "—",
    };
  }, [lessons]);

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
    <div ref={scope} className="space-y-8">
      {/* Greeting + CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{greeting()},</p>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
            {faculty?.name ?? "Faculty"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Here&apos;s an overview of your teaching material.
          </p>
        </div>
        <Link to="/lessons/new">
          <Button size="lg">
            <FiPlus className="h-5 w-5" />
            Upload lesson
          </Button>
        </Link>
      </div>

      {error ? <Alert>{error}</Alert> : null}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[88px]" />
          ))
        ) : (
          <>
            <StatCard
              icon={FiBookOpen}
              label="Total lessons"
              value={String(stats.total)}
              tint="bg-indigo-500/10"
              color="text-indigo-500"
            />
            <StatCard
              icon={FiHardDrive}
              label="Storage used"
              value={stats.totalSize}
              tint="bg-emerald-500/10"
              color="text-emerald-500"
            />
            <StatCard
              icon={FiLayers}
              label="File types"
              value={String(stats.types)}
              tint="bg-violet-500/10"
              color="text-violet-500"
            />
            <StatCard
              icon={FiClock}
              label="Last updated"
              value={stats.latest}
              tint="bg-amber-500/10"
              color="text-amber-500"
            />
          </>
        )}
      </div>

      {/* Lessons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Recent lessons
          </h2>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-56" />
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onDelete={handleDelete}
                deleting={deletingId === lesson.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <Card data-reveal className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-500/10">
        <FiBookOpen className="h-8 w-8 text-indigo-500" />
      </span>
      <h3 className="mt-5 font-display text-xl font-bold text-slate-900 dark:text-white">
        No lessons yet
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Upload your first lesson to start building your course library. PDFs, slides, documents and
        videos are all supported.
      </p>
      <Link to="/lessons/new" className="mt-6">
        <Button size="lg">
          <FiPlus className="h-5 w-5" />
          Upload your first lesson
        </Button>
      </Link>
    </Card>
  );
}
