import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { createLesson } from "../features/lessons/lessons.api";
import { getApiErrorMessage } from "../lib/apiError";
import { createLessonSchema, type CreateLessonFormValues } from "../validation/schemas";
import { useStaggerReveal } from "../lib/useGsap";
import { Alert, Button, Card, Input, TextArea } from "../components/ui";
import { FileDropzone } from "../components/FileDropzone";

export function UploadLessonPage() {
  const navigate = useNavigate();
  const scope = useStaggerReveal<HTMLDivElement>([]);
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateLessonFormValues>({ resolver: zodResolver(createLessonSchema) });

  async function onSubmit(values: CreateLessonFormValues) {
    setFormError(null);
    setFileError(null);

    if (!file) {
      setFileError("A lesson file is required");
      return;
    }

    try {
      setProgress(0);
      await createLesson(
        { title: values.title, description: values.description, file },
        { onUploadProgress: setProgress },
      );
      navigate("/", { replace: true });
    } catch (error) {
      setProgress(null);
      setFormError(getApiErrorMessage(error, "Failed to upload lesson"));
    }
  }

  return (
    <div ref={scope} className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/"
        data-reveal
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to lessons
      </Link>

      <div data-reveal>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Upload a lesson
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Add course material with a title, description and file.
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

          <FileDropzone
            file={file}
            onFileSelect={(selected) => {
              setFile(selected);
              setFileError(null);
            }}
            error={fileError ?? undefined}
            disabled={isSubmitting}
          />

          {progress !== null ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className="flex gap-3">
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Upload lesson"}
            </Button>
            <Link to="/">
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
