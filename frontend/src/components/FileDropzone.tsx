import { useRef, useState, type DragEvent } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";
import { getFileMeta } from "../lib/fileMeta";
import { formatFileSize } from "../lib/format";
import { cn } from "../lib/cn";

const DEFAULT_ACCEPT =
  ".pdf,.ppt,.pptx,.doc,.docx,.mp4,.mov,.webm,.png,.jpg,.jpeg,.gif";

export function FileDropzone({
  file,
  onFileSelect,
  error,
  disabled,
  accept = DEFAULT_ACCEPT,
}: {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) onFileSelect(dropped);
  }

  if (file) {
    const meta = getFileMeta(file.type, file.name);
    return (
      <div className="space-y-1.5">
        <div className="glass flex items-center gap-4 rounded-2xl p-4">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${meta.tint}`}>
            <meta.Icon className={`h-6 w-6 ${meta.color}`} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {file.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {meta.label} · {formatFileSize(file.size)}
            </p>
          </div>
          {!disabled ? (
            <button
              type="button"
              onClick={() => onFileSelect(null)}
              aria-label="Remove file"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
            >
              <FiX className="h-5 w-5" />
            </button>
          ) : null}
        </div>
        {error ? <p className="pl-1 text-xs font-medium text-red-500">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-200",
          dragging
            ? "border-indigo-500 bg-indigo-500/5"
            : "border-slate-300 hover:border-indigo-400 hover:bg-slate-500/[0.03] dark:border-white/15 dark:hover:border-indigo-400/60",
          error && "border-red-400",
        )}
      >
        <span
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 transition-transform duration-200",
            dragging && "scale-110",
          )}
        >
          <FiUploadCloud className="h-7 w-7" />
        </span>
        <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {dragging ? "Drop your file here" : "Drag & drop your file, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-slate-400">PDF, PPT, PPTX, DOC, video or image</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled}
          onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
        />
      </div>
      {error ? <p className="pl-1 text-xs font-medium text-red-500">{error}</p> : null}
    </div>
  );
}
