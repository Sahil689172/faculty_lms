import { Router } from "express";
import { lessonController } from "./lesson.controller.js";
import {
  createLessonSchema,
  lessonIdParamSchema,
  updateLessonSchema,
} from "./lesson.validation.js";
import { validateBody, validateParams } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { uploadLessonFile } from "../../middleware/upload.js";
import { Roles } from "../../constants/roles.js";

export const lessonRouter = Router();

lessonRouter.use(authenticate, authorize(Roles.FACULTY));

lessonRouter.post("/", uploadLessonFile, validateBody(createLessonSchema), lessonController.create);
lessonRouter.get("/", lessonController.list);
lessonRouter.get("/:id", validateParams(lessonIdParamSchema), lessonController.detail);
lessonRouter.get(
  "/:id/download",
  validateParams(lessonIdParamSchema),
  lessonController.download,
);
lessonRouter.patch(
  "/:id",
  validateParams(lessonIdParamSchema),
  uploadLessonFile,
  validateBody(updateLessonSchema),
  lessonController.update,
);
lessonRouter.delete("/:id", validateParams(lessonIdParamSchema), lessonController.remove);
