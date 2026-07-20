export interface CreateLessonData {
  title: string;
  description?: string | null;
}

export interface UpdateLessonData {
  title?: string;
  description?: string | null;
}

export interface LessonFileInput {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface LessonPersistenceCreate {
  title: string;
  description: string | null;
  facultyId: string;
  storagePath: string;
  originalFileName: string;
  mimeType: string;
  fileSize: bigint;
}

export interface LessonPersistenceUpdate {
  title?: string;
  description?: string | null;
  storagePath?: string;
  originalFileName?: string;
  mimeType?: string;
  fileSize?: bigint;
}

export interface LessonResponse {
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
