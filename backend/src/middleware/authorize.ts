import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/AppError.js";
import type { Role } from "../constants/roles.js";

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError(403, "FORBIDDEN", "You do not have access to this resource"));
      return;
    }

    next();
  };
}
