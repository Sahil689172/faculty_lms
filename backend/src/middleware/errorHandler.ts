import type { NextFunction, Request, Response } from "express";
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
