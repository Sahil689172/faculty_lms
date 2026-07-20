import type { Faculty } from "@prisma/client";
import { AppError } from "../../lib/AppError.js";
import { Roles } from "../../constants/roles.js";
import { signAccessToken } from "../../utils/jwt.js";
import { verifyPassword } from "../../utils/password.js";
import { facultyRepository } from "../faculty/faculty.repository.js";
import type { LoginInput } from "./auth.validation.js";
import type { PublicFaculty } from "./auth.types.js";

function toPublicFaculty(faculty: Faculty): PublicFaculty {
  return {
    id: faculty.id,
    name: faculty.name,
    email: faculty.email,
  };
}

export const authService = {
  async login(input: LoginInput): Promise<{ accessToken: string; faculty: PublicFaculty }> {
    const faculty = await facultyRepository.findByEmail(input.email);

    if (!faculty) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const passwordMatches = await verifyPassword(input.password, faculty.passwordHash);

    if (!passwordMatches) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const accessToken = signAccessToken({
      sub: faculty.id,
      email: faculty.email,
      role: Roles.FACULTY,
    });

    return { accessToken, faculty: toPublicFaculty(faculty) };
  },

  async getProfile(facultyId: string): Promise<PublicFaculty> {
    const faculty = await facultyRepository.findById(facultyId);

    if (!faculty) {
      throw new AppError(404, "NOT_FOUND", "Faculty not found");
    }

    return toPublicFaculty(faculty);
  },
};
