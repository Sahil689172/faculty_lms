import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { createLesson } from "../features/lessons/lessons.api";
import { getApiErrorMessage } from "../lib/apiError";
import { createLessonSchema, type CreateLessonFormValues } from "../validation/schemas";
import { Alert, Button, Field, Input, TextArea } from "../components/ui";

export function UploadLessonPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateLessonFormValues>({ resolver: zodResolver(createLessonSchema) });

  async function onSubmit(values: CreateLessonFormValues) {
    setFormError(null);
    setFileError(null);

    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setFileError("A lesson file is required");
      return;
    }

    try {
      await createLesson({ title: values.title, description: values.description, file });
      navigate("/", { replace: true });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Failed to upload lesson"));
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link to="/" className="text-sm font-medium text-indigo-600">
        &larr; Back to lessons
      </Link>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Upload a lesson</h1>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {formError ? <Alert>{formError}</Alert> : null}

          <Field label="Title" error={errors.title?.message}>
            <Input {...register("title")} />
          </Field>

          <Field label="Description" error={errors.description?.message}>
            <TextArea rows={4} {...register("description")} />
          </Field>

          <Field label="File (PDF, PPT, DOC, video, image)" error={fileError ?? undefined}>
            <Input ref={fileInputRef} type="file" />
          </Field>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Upload lesson"}
            </Button>
            <Link to="/">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
