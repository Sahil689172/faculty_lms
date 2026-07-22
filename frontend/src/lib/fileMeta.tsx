import type { IconType } from "react-icons";
import {
  FaFile,
  FaFileImage,
  FaFileLines,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileVideo,
  FaFileWord,
} from "react-icons/fa6";

export interface FileMeta {
  label: string;
  Icon: IconType;
  /** Text/icon color class (tailwind) */
  color: string;
  /** Soft background tint for icon container */
  tint: string;
}

const PDF: FileMeta = {
  label: "PDF",
  Icon: FaFilePdf,
  color: "text-red-500",
  tint: "bg-red-500/10",
};
const PPT: FileMeta = {
  label: "Slides",
  Icon: FaFilePowerpoint,
  color: "text-orange-500",
  tint: "bg-orange-500/10",
};
const DOC: FileMeta = {
  label: "Document",
  Icon: FaFileWord,
  color: "text-sky-500",
  tint: "bg-sky-500/10",
};
const VIDEO: FileMeta = {
  label: "Video",
  Icon: FaFileVideo,
  color: "text-violet-500",
  tint: "bg-violet-500/10",
};
const IMAGE: FileMeta = {
  label: "Image",
  Icon: FaFileImage,
  color: "text-emerald-500",
  tint: "bg-emerald-500/10",
};
const TEXT: FileMeta = {
  label: "Text",
  Icon: FaFileLines,
  color: "text-slate-500",
  tint: "bg-slate-500/10",
};
const GENERIC: FileMeta = {
  label: "File",
  Icon: FaFile,
  color: "text-slate-500",
  tint: "bg-slate-500/10",
};

export function getFileMeta(mimeType: string | undefined, fileName = ""): FileMeta {
  const mime = (mimeType ?? "").toLowerCase();
  const ext = fileName.toLowerCase().split(".").pop() ?? "";

  if (mime.includes("pdf") || ext === "pdf") return PDF;
  if (
    mime.includes("presentation") ||
    mime.includes("powerpoint") ||
    ext === "ppt" ||
    ext === "pptx"
  ) {
    return PPT;
  }
  if (mime.includes("word") || ext === "doc" || ext === "docx") return DOC;
  if (mime.startsWith("video/") || ["mp4", "mov", "webm", "mkv"].includes(ext)) return VIDEO;
  if (mime.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return IMAGE;
  if (mime.startsWith("text/") || ext === "txt") return TEXT;

  return GENERIC;
}

export function isPdf(mimeType: string | undefined, fileName = ""): boolean {
  return getFileMeta(mimeType, fileName) === PDF;
}
