import { forwardRef, useId } from "react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "../lib/cn";

/* --------------------------------- Button --------------------------------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white shadow-soft hover:bg-indigo-500 hover:shadow-soft-lg focus-visible:ring-indigo-500",
  secondary:
    "border border-slate-200 bg-white/70 text-slate-700 backdrop-blur hover:bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10",
  ghost:
    "text-slate-600 hover:bg-slate-500/10 dark:text-slate-300 dark:hover:bg-white/10",
  danger:
    "bg-red-600 text-white shadow-soft hover:bg-red-500 focus-visible:ring-red-500",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        buttonVariants[variant],
        buttonSizes[size],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}

/* ------------------------------- Icon Button ------------------------------ */

export function IconButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-all duration-200 hover:bg-slate-500/10 active:scale-95 dark:text-slate-300 dark:hover:bg-white/10",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------------------------------- Input --------------------------------- */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightSlot?: ReactNode;
}

const floatingLabel = cn(
  "pointer-events-none absolute left-4 z-[1] origin-left text-slate-400 transition-all duration-200",
  "top-1/2 -translate-y-1/2 text-sm",
  "peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-medium peer-focus:text-indigo-500",
  "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs",
);

const inputBase = cn(
  "peer block w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200",
  "placeholder-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10",
  "dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:ring-indigo-400/10",
);

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, rightSlot, id, placeholder, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hasLabel = Boolean(label);

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          placeholder={hasLabel ? " " : placeholder}
          aria-invalid={error ? true : undefined}
          className={cn(
            inputBase,
            hasLabel ? "pb-2 pt-6" : "py-3",
            rightSlot != null ? "pr-11" : undefined,
            error && "border-red-400 focus:border-red-500 focus:ring-red-500/10 dark:border-red-400/60",
            className,
          )}
          {...props}
        />
        {hasLabel ? (
          <label htmlFor={inputId} className={floatingLabel}>
            {label}
          </label>
        ) : null}
        {rightSlot ? (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>
        ) : null}
      </div>
      {error ? <p className="pl-1 text-xs font-medium text-red-500">{error}</p> : null}
    </div>
  );
});

/* -------------------------------- TextArea -------------------------------- */

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { className, label, error, id, placeholder, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hasLabel = Boolean(label);

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <textarea
          id={inputId}
          ref={ref}
          placeholder={hasLabel ? " " : placeholder}
          aria-invalid={error ? true : undefined}
          className={cn(
            inputBase,
            "resize-none leading-relaxed",
            hasLabel ? "pb-2 pt-7" : "py-3",
            error && "border-red-400 focus:border-red-500 focus:ring-red-500/10 dark:border-red-400/60",
            className,
          )}
          {...props}
        />
        {hasLabel ? (
          <label
            htmlFor={inputId}
            className={cn(
              floatingLabel,
              "top-5 -translate-y-0 peer-focus:top-2.5 peer-[:not(:placeholder-shown)]:top-2.5",
            )}
          >
            {label}
          </label>
        ) : null}
      </div>
      {error ? <p className="pl-1 text-xs font-medium text-red-500">{error}</p> : null}
    </div>
  );
});

/* ---------------------------------- Field --------------------------------- */

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <span className="block pl-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      {children}
      {hint && !error ? <p className="pl-1 text-xs text-slate-400">{hint}</p> : null}
      {error ? <p className="pl-1 text-xs font-medium text-red-500">{error}</p> : null}
    </div>
  );
}

/* ---------------------------------- Card ---------------------------------- */

export function Card({
  className,
  hover = false,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "glass rounded-2xl",
        hover && "transition-colors hover:border-slate-300 dark:hover:border-white/20",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ---------------------------------- Badge --------------------------------- */

type BadgeTone = "indigo" | "slate" | "emerald" | "amber" | "red" | "sky";

const badgeTones: Record<BadgeTone, string> = {
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
  slate: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  red: "bg-red-500/10 text-red-600 dark:text-red-300",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
};

export function Badge({
  tone = "slate",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------------------------------- Alert --------------------------------- */

type AlertTone = "error" | "info" | "success";

const alertTones: Record<AlertTone, string> = {
  error:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300",
  info:
    "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
};

export function Alert({ tone = "error", children }: { tone?: AlertTone; children: ReactNode }) {
  return (
    <div
      role="alert"
      className={cn("rounded-2xl border px-4 py-3 text-sm font-medium", alertTones[tone])}
    >
      {children}
    </div>
  );
}

/* --------------------------------- Spinner -------------------------------- */

export function Spinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600 dark:border-slate-600 dark:border-t-indigo-400" />
      {label}
    </div>
  );
}

/* -------------------------------- Skeleton -------------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("rounded-xl bg-slate-200/70 dark:bg-white/5", className)} />;
}
