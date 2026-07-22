import type { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — clean informational panel */}
      <div className="relative hidden bg-slate-900 lg:block">
        <div className="flex h-full flex-col justify-between p-12">
          <span className="font-display text-xl font-bold text-white">Faculty LMS</span>

          <div className="max-w-md space-y-5">
            <h2 className="font-display text-4xl font-bold leading-tight text-white">
              Manage your lessons with clarity.
            </h2>
            <p className="text-lg leading-relaxed text-slate-400">
              Upload, organise and share course materials in one simple workspace built for faculty.
            </p>
          </div>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Faculty Lesson Management System
          </p>
        </div>
      </div>

      {/* Right — form card */}
      <div className="relative flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-soft dark:border-white/10 dark:bg-slate-900 sm:p-10">
          <div className="mb-8 space-y-2 text-center">
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>

          {children}

          {footer ? (
            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
