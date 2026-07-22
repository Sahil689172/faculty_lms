import type { Faculty } from "@prisma/client";
import { AppError } from "../../lib/AppError.js";
import { Roles } from "../../constants/roles.js";
import { signAccessToken } from "../../utils/jwt.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { facultyRepository } from "../faculty/faculty.repository.js";
import type { LoginInput, RegisterInput } from "./auth.validation.js";
import type { PublicFaculty } from "./auth.types.js";

function toPublicFaculty(faculty: Faculty): PublicFaculty {
  return {
    id: faculty.id,
    name: faculty.name,
    email: faculty.email,
  };
}

function buildAuthResult(faculty: Faculty): { accessToken: string; faculty: PublicFaculty } {
  const accessToken = signAccessToken({
    sub: faculty.id,
    email: faculty.email,
    role: Roles.FACULTY,
  });

  return { accessToken, faculty: toPublicFaculty(faculty) };
}

/** Dummy bcrypt hash so missing-user logins still pay the bcrypt cost (timing safety). */
const DUMMY_PASSWORD_HASH =
  "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export const authService = {
  async login(input: LoginInput): Promise<{ accessToken: string; faculty: PublicFaculty }> {
    const faculty = await facultyRepository.findByEmail(input.email);

    const passwordMatches = await verifyPassword(
      input.password,
      faculty?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    if (!faculty || !passwordMatches) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    return buildAuthResult(faculty);
  },

  async register(input: RegisterInput): Promise<{ accessToken: string; faculty: PublicFaculty }> {
    const existing = await facultyRepository.findByEmail(input.email);

    if (existing) {
      throw new AppError(409, "EMAIL_ALREADY_REGISTERED", "Email already registered");
    }

    const passwordHash = await hashPassword(input.password);

    const faculty = await facultyRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return buildAuthResult(faculty);
  },

  async getProfile(facultyId: string): Promise<PublicFaculty> {
    const faculty = await facultyRepository.findById(facultyId);

    if (!faculty) {
      throw new AppError(404, "NOT_FOUND", "Faculty not found");
    }

    return toPublicFaculty(faculty);
  },
};
