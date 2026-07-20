import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { AppError } from "../lib/AppError.js";
import { env } from "../config/env.js";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, "NOT_FOUND", "Route not found"));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (err instanceof MulterError) {
    const isSizeError = err.code === "LIMIT_FILE_SIZE";
    res.status(isSizeError ? 413 : 400).json({
      success: false,
      error: {
        code: isSizeError ? "FILE_TOO_LARGE" : "UPLOAD_ERROR",
        message: isSizeError ? "Uploaded file exceeds the maximum allowed size" : err.message,
      },
    });
    return;
  }

  console.error(err);

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: env.isProduction
        ? "An unexpected error occurred"
        : err instanceof Error
          ? err.message
          : "An unexpected error occurred",
    },
  });
}
