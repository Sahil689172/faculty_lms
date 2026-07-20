import type { Faculty } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

export const facultyRepository = {
  findByEmail(email: string): Promise<Faculty | null> {
    return prisma.faculty.findUnique({ where: { email } });
  },

  findById(id: string): Promise<Faculty | null> {
    return prisma.faculty.findUnique({ where: { id } });
  },
};
