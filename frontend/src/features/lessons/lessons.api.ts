import { apiClient } from "../../lib/apiClient";
import type {
  CreateLessonPayload,
  Lesson,
  LessonDownload,
  UpdateLessonPayload,
} from "./lessons.types";

export async function listLessons(): Promise<Lesson[]> {
  const { data } = await apiClient.get<{ data: Lesson[] }>("/lessons");
  return data.data;
}

export async function getLesson(id: string): Promise<Lesson> {
  const { data } = await apiClient.get<{ data: Lesson }>(`/lessons/${id}`);
  return data.data;
}

export interface UploadOptions {
  onUploadProgress?: (percent: number) => void;
}

export async function createLesson(
  payload: CreateLessonPayload,
  options: UploadOptions = {},
): Promise<Lesson> {
  const form = new FormData();
  form.append("title", payload.title);

  if (payload.description) {
    form.append("description", payload.description);
  }

  form.append("file", payload.file);

  const { data } = await apiClient.post<{ data: Lesson }>("/lessons", form, {
    onUploadProgress: (event) => {
      if (options.onUploadProgress && event.total) {
        options.onUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return data.data;
}

export async function updateLesson(id: string, payload: UpdateLessonPayload): Promise<Lesson> {
  const form = new FormData();

  if (payload.title !== undefined) {
    form.append("title", payload.title);
  }

  if (payload.description !== undefined) {
    form.append("description", payload.description);
  }

  if (payload.file) {
    form.append("file", payload.file);
  }

  const { data } = await apiClient.patch<{ data: Lesson }>(`/lessons/${id}`, form);
  return data.data;
}

export async function deleteLesson(id: string): Promise<void> {
  await apiClient.delete(`/lessons/${id}`);
}

export async function getLessonDownload(id: string): Promise<LessonDownload> {
  const { data } = await apiClient.get<{ data: LessonDownload }>(`/lessons/${id}/download`);
  return data.data;
}
