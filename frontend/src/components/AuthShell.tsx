import type { ReactNode } from "react";
import gsap from "gsap";
import { FiLayers } from "react-icons/fi";
import { EASE, useGsap } from "../lib/useGsap";
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
  const scope = useGsap<HTMLDivElement>(() => {
    const tl = gsap.timeline({ defaults: { ease: EASE } });
    tl.from("[data-auth-brand]", { x: -30, opacity: 0, duration: 0.6 })
      .from("[data-auth-blurb] > *", { y: 24, opacity: 0, duration: 0.5, stagger: 0.12 }, "-=0.3")
      .from("[data-auth-card]", { y: 28, opacity: 0, duration: 0.6 }, "-=0.4")
      .from(
        "[data-auth-card] [data-auth-field]",
        { y: 16, opacity: 0, duration: 0.4, stagger: 0.07 },
        "-=0.35",
      );
  }, []);

  return (
    <div ref={scope} className="grid min-h-screen lg:grid-cols-2">
      {/* Left — abstract gradient mesh */}
      <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
        <div className="absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-indigo-600/50 blur-3xl animate-blob" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-violet-600/40 blur-3xl animate-blob-slow" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-sky-500/30 blur-3xl animate-blob" />
        <div className="absolute right-16 top-1/3 h-24 w-24 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md animate-float" />
        <div
          className="absolute bottom-24 left-24 h-16 w-16 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md animate-float"
          style={{ animationDelay: "1.5s" }}
        />

        <div className="relative flex h-full flex-col justify-between p-12">
          <div data-auth-brand className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-soft">
              <FiLayers className="h-6 w-6" />
            </span>
            <span className="font-display text-xl font-bold text-white">Faculty LMS</span>
          </div>

          <div data-auth-blurb className="max-w-md space-y-5">
            <h2 className="font-display text-4xl font-bold leading-tight text-white">
              Manage your lessons with clarity and calm.
            </h2>
            <p className="text-lg leading-relaxed text-slate-300">
              Upload, organise and share course materials in one polished workspace built for
              faculty.
            </p>
          </div>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Faculty Lesson Management System
          </p>
        </div>
      </div>

      {/* Right — form card */}
      <div className="relative flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="absolute right-4 top-4 z-10">
          <ThemeToggle />
        </div>
        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />
        </div>

        <div data-auth-card className="glass relative w-full max-w-md rounded-3xl p-8 sm:p-10">
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
