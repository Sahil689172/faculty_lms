import type { ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import { ThemeToggle } from "./ThemeToggle";

const highlights = [
  "Upload PDFs, slides, documents and videos",
  "Preview lessons right inside the browser",
  "Keep every course material in one place",
];

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
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      {/* Left — form */}
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-indigo-600" />
            <span className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Faculty LMS
            </span>
          </div>
          <ThemeToggle />
        </header>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-2 text-[15px] text-slate-500 dark:text-slate-400">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer ? (
            <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">{footer}</p>
          ) : null}
        </div>

        <footer className="text-xs text-slate-400">
          © {new Date().getFullYear()} Faculty Lesson Management System
        </footer>
      </div>

      {/* Right — brand / value panel */}
      <div className="relative hidden bg-slate-900 lg:flex lg:flex-col lg:justify-center lg:px-16">
        <div className="max-w-md">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
            Faculty workspace
          </p>
          <h2 className="mt-5 font-display text-[2.6rem] font-bold leading-[1.1] text-white">
            A calmer home for your teaching material.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-400">
            Manage your course lessons, share study material with students, and keep every class
            resource in one organised place.
          </p>

          <ul className="mt-10 space-y-4">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-200">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                  <FiCheck className="h-3 w-3" />
                </span>
                <span className="text-[15px] leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
