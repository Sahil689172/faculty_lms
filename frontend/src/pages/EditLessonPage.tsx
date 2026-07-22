import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { getLesson, updateLesson } from "../features/lessons/lessons.api";
import { getApiErrorMessage } from "../lib/apiError";
import { editLessonSchema, type EditLessonFormValues } from "../validation/schemas";
import { getFileMeta } from "../lib/fileMeta";
import { useStaggerReveal } from "../lib/useGsap";
import { Alert, Button, Card, Input, Skeleton, TextArea } from "../components/ui";
import { FileDropzone } from "../components/FileDropzone";

export function EditLessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const scope = useStaggerReveal<HTMLDivElement>([id]);

  const [loading, setLoading] = useState(true);
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditLessonFormValues>({ resolver: zodResolver(editLessonSchema) });

  useEffect(() => {
    if (!id) {
      return;
    }

    getLesson(id)
      .then((lesson) => {
        reset({ title: lesson.title, description: lesson.description ?? "" });
        setCurrentFileName(lesson.originalFileName);
      })
      .catch((err) => setFormError(getApiErrorMessage(err, "Failed to load lesson")))
      .finally(() => setLoading(false));
  }, [id, reset]);

  async function onSubmit(values: EditLessonFormValues) {
    if (!id) {
      return;
    }

    setFormError(null);

    try {
      await updateLesson(id, {
        title: values.title,
        description: values.description ?? "",
        file: replacementFile ?? undefined,
      });
      navigate(`/lessons/${id}`, { replace: true });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Failed to update lesson"));
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  const currentMeta = getFileMeta(undefined, currentFileName);

  return (
    <div ref={scope} className="mx-auto max-w-2xl space-y-6">
      <Link
        to={`/lessons/${id}`}
        data-reveal
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to lesson
      </Link>

      <div data-reveal>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Edit lesson
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Update the details or replace the attached file.
        </p>
      </div>

      <Card data-reveal className="p-6 sm:p-8">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          {formError ? <Alert>{formError}</Alert> : null}

          <Input label="Lesson title" error={errors.title?.message} {...register("title")} />

          <TextArea
            label="Description"
            rows={4}
            error={errors.description?.message}
            {...register("description")}
          />

          <div className="space-y-2">
            <p className="pl-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Replace file{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </p>
            {currentFileName && !replacementFile ? (
              <div className="glass mb-3 flex items-center gap-3 rounded-2xl p-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${currentMeta.tint}`}>
                  <currentMeta.Icon className={`h-5 w-5 ${currentMeta.color}`} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                    {currentFileName}
                  </p>
                  <p className="text-xs text-slate-400">Current file</p>
                </div>
              </div>
            ) : null}
            <FileDropzone
              file={replacementFile}
              onFileSelect={setReplacementFile}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
            <Link to={`/lessons/${id}`}>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
