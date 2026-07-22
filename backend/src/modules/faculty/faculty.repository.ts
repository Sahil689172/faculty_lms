import type { Faculty } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

export interface CreateFacultyData {
  name: string;
  email: string;
  passwordHash: string;
}

export const facultyRepository = {
  findByEmail(email: string): Promise<Faculty | null> {
    return prisma.faculty.findUnique({ where: { email } });
  },

  findById(id: string): Promise<Faculty | null> {
    return prisma.faculty.findUnique({ where: { id } });
  },

  create(data: CreateFacultyData): Promise<Faculty> {
    return prisma.faculty.create({ data });
  },
};
