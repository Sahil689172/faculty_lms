import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";

const BEARER_PREFIX = "Bearer ";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    return;
  }

  const token = header.slice(BEARER_PREFIX.length).trim();

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError(401, "UNAUTHORIZED", "Invalid or expired token"));
  }
}
