import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/AppError.js";
import { lessonService } from "./lesson.service.js";

export const lessonController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError(400, "FILE_REQUIRED", "A lesson file is required");
      }

      const data = await lessonService.create(req.user!.id, req.body, req.file);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await lessonService.list(req.user!.id);
      res.status(200).json({ success: true, data, meta: { total: data.length } });
    } catch (error) {
      next(error);
    }
  },

  async detail(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await lessonService.getById(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description } = req.body as {
        title?: string;
        description?: string | null;
      };

      if (title === undefined && description === undefined && !req.file) {
        throw new AppError(400, "NOTHING_TO_UPDATE", "Provide a field or file to update");
      }

      const data = await lessonService.update(req.user!.id, req.params.id, req.body, req.file);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await lessonService.remove(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: { id: req.params.id, deleted: true } });
    } catch (error) {
      next(error);
    }
  },

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await lessonService.getDownloadUrl(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
