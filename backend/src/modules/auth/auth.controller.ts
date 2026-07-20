import type { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service.js";

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await authService.getProfile(req.user!.id);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  },
};
