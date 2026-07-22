import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AccessTokenPayload } from "../modules/auth/auth.types.js";
import { AppError } from "../lib/AppError.js";

const JWT_ALGORITHM = "HS256" as const;

function isAccessTokenPayload(value: unknown): value is AccessTokenPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return (
    typeof payload.sub === "string" &&
    payload.sub.length > 0 &&
    typeof payload.email === "string" &&
    payload.email.length > 0 &&
    typeof payload.role === "string" &&
    payload.role.length > 0
  );
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
    algorithm: JWT_ALGORITHM,
  };

  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.jwtSecret, {
      algorithms: [JWT_ALGORITHM],
    });

    if (!isAccessTokenPayload(decoded)) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid or expired token");
    }

    return decoded;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(401, "UNAUTHORIZED", "Invalid or expired token");
  }
}
