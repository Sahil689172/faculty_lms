import multer from "multer";
import { env } from "../config/env.js";
import { AppError } from "../lib/AppError.js";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "image/png",
  "image/jpeg",
]);

export const uploadLessonFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxFileSizeBytes },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new AppError(415, "UNSUPPORTED_MEDIA_TYPE", `Unsupported file type: ${file.mimetype}`));
  },
}).single("file");
