import type { Lesson } from "@prisma/client";
import { AppError } from "../../lib/AppError.js";
import { logger } from "../../lib/logger.js";
import { storageService } from "../storage/storage.service.js";
import { lessonRepository } from "./lesson.repository.js";
import type {
  CreateLessonData,
  LessonDownload,
  LessonFileInput,
  LessonPersistenceUpdate,
  LessonResponse,
  UpdateLessonData,
} from "./lesson.types.js";

function toLessonResponse(lesson: Lesson): LessonResponse {
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    originalFileName: lesson.originalFileName,
    mimeType: lesson.mimeType,
    fileSize: Number(lesson.fileSize),
    facultyId: lesson.facultyId,
    createdAt: lesson.createdAt.toISOString(),
    updatedAt: lesson.updatedAt.toISOString(),
  };
}

async function getOwnedLessonOrThrow(id: string, facultyId: string): Promise<Lesson> {
  const lesson = await lessonRepository.findByIdAndFaculty(id, facultyId);

  if (!lesson) {
    throw new AppError(404, "LESSON_NOT_FOUND", "Lesson not found");
  }

  return lesson;
}

// Best-effort storage cleanup: failures must not mask the primary operation result.
async function safeRemove(storagePath: string): Promise<void> {
  try {
    await storageService.remove(storagePath);
  } catch (error) {
    logger.error(`Failed to remove storage object "${storagePath}"`, error);
  }
}

export const lessonService = {
  async create(
    facultyId: string,
    data: CreateLessonData,
    file: LessonFileInput,
  ): Promise<LessonResponse> {
    const storagePath = await storageService.upload(facultyId, file);

    try {
      const lesson = await lessonRepository.create({
        title: data.title,
        description: data.description ?? null,
        facultyId,
        storagePath,
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: BigInt(file.size),
      });

      return toLessonResponse(lesson);
    } catch (error) {
      await safeRemove(storagePath);
      throw error;
    }
  },

  async list(facultyId: string): Promise<LessonResponse[]> {
    const lessons = await lessonRepository.findManyByFaculty(facultyId);
    return lessons.map(toLessonResponse);
  },

  async getById(facultyId: string, id: string): Promise<LessonResponse> {
    const lesson = await getOwnedLessonOrThrow(id, facultyId);
    return toLessonResponse(lesson);
  },

  async update(
    facultyId: string,
    id: string,
    data: UpdateLessonData,
    file?: LessonFileInput,
  ): Promise<LessonResponse> {
    const existing = await getOwnedLessonOrThrow(id, facultyId);

    const updateData: LessonPersistenceUpdate = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    let uploadedPath: string | null = null;

    if (file) {
      uploadedPath = await storageService.upload(facultyId, file);
      updateData.storagePath = uploadedPath;
      updateData.originalFileName = file.originalname;
      updateData.mimeType = file.mimetype;
      updateData.fileSize = BigInt(file.size);
    }

    try {
      const updated = await lessonRepository.update(id, updateData);

      if (file) {
        await safeRemove(existing.storagePath);
      }

      return toLessonResponse(updated);
    } catch (error) {
      if (uploadedPath) {
        await safeRemove(uploadedPath);
      }
      throw error;
    }
  },

  async remove(facultyId: string, id: string): Promise<void> {
    const lesson = await getOwnedLessonOrThrow(id, facultyId);
    await lessonRepository.delete(id);
    await safeRemove(lesson.storagePath);
  },

  async getDownloadUrl(facultyId: string, id: string): Promise<LessonDownload> {
    const lesson = await getOwnedLessonOrThrow(id, facultyId);
    const url = await storageService.createSignedUrl(lesson.storagePath);

    return {
      url,
      originalFileName: lesson.originalFileName,
      mimeType: lesson.mimeType,
    };
  },
};
