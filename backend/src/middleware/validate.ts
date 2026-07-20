import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { AppError } from "../lib/AppError.js";

function toValidationError(error: ZodError): AppError {
  return new AppError(
    400,
    "VALIDATION_ERROR",
    "Request validation failed",
    error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  );
}

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(toValidationError(error));
        return;
      }

      next(error);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(toValidationError(error));
        return;
      }

      next(error);
    }
  };
}
