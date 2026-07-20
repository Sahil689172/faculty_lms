import type { Lesson } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import type { LessonPersistenceCreate, LessonPersistenceUpdate } from "./lesson.types.js";

export const lessonRepository = {
  create(data: LessonPersistenceCreate): Promise<Lesson> {
    return prisma.lesson.create({ data });
  },

  findManyByFaculty(facultyId: string): Promise<Lesson[]> {
    return prisma.lesson.findMany({
      where: { facultyId },
      orderBy: { createdAt: "desc" },
    });
  },

  findByIdAndFaculty(id: string, facultyId: string): Promise<Lesson | null> {
    return prisma.lesson.findFirst({ where: { id, facultyId } });
  },

  update(id: string, data: LessonPersistenceUpdate): Promise<Lesson> {
    return prisma.lesson.update({ where: { id }, data });
  },

  delete(id: string): Promise<Lesson> {
    return prisma.lesson.delete({ where: { id } });
  },
};
