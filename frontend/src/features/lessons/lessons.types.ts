export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  facultyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonDownload {
  url: string;
  originalFileName: string;
  mimeType: string;
}

export interface CreateLessonPayload {
  title: string;
  description?: string;
  file: File;
}

export interface UpdateLessonPayload {
  title?: string;
  description?: string;
  file?: File;
}
