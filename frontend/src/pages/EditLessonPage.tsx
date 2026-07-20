import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getLesson, updateLesson } from "../features/lessons/lessons.api";
import { getApiErrorMessage } from "../lib/apiError";
import { editLessonSchema, type EditLessonFormValues } from "../validation/schemas";
import { Alert, Button, Field, Input, Spinner, TextArea } from "../components/ui";

export function EditLessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [currentFileName, setCurrentFileName] = useState<string>("");
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
    const file = fileInputRef.current?.files?.[0];

    try {
      await updateLesson(id, {
        title: values.title,
        description: values.description ?? "",
        file,
      });
      navigate(`/lessons/${id}`, { replace: true });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Failed to update lesson"));
    }
  }

  if (loading) {
    return <Spinner label="Loading lesson..." />;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link to={`/lessons/${id}`} className="text-sm font-medium text-indigo-600">
        &larr; Back to lesson
      </Link>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Edit lesson</h1>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {formError ? <Alert>{formError}</Alert> : null}

          <Field label="Title" error={errors.title?.message}>
            <Input {...register("title")} />
          </Field>

          <Field label="Description" error={errors.description?.message}>
            <TextArea rows={4} {...register("description")} />
          </Field>

          <Field label="Replace file (optional)">
            <Input ref={fileInputRef} type="file" />
          </Field>

          {currentFileName ? (
            <p className="text-xs text-slate-400">Current file: {currentFileName}</p>
          ) : null}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
            <Link to={`/lessons/${id}`}>
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
