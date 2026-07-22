import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { Prisma } from "@prisma/client";
import { AppError } from "../lib/AppError.js";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, "NOT_FOUND", "Route not found"));
}

function sendAppError(res: Response, err: AppError): void {
  res.status(err.statusCode).json({
    success: false,
    error: {
      code: err.code,
      message: err.message,
      ...(err.details !== undefined ? { details: err.details } : {}),
    },
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    sendAppError(res, err);
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

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_JSON",
        message: "Request body contains invalid JSON",
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      sendAppError(res, new AppError(409, "CONFLICT", "A record with that value already exists"));
      return;
    }

    if (err.code === "P2025") {
      sendAppError(res, new AppError(404, "NOT_FOUND", "Record not found"));
      return;
    }

    logger.error("Prisma known request error", { code: err.code, meta: err.meta });
    sendAppError(
      res,
      new AppError(400, "DATABASE_ERROR", env.isProduction ? "Database request failed" : err.message),
    );
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    sendAppError(
      res,
      new AppError(400, "VALIDATION_ERROR", env.isProduction ? "Invalid database query" : err.message),
    );
    return;
  }

  logger.error("Unhandled error", {
    message: err instanceof Error ? err.message : String(err),
    ...(env.isProduction ? {} : { stack: err instanceof Error ? err.stack : undefined }),
  });

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
