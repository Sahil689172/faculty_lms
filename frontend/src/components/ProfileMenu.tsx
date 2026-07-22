import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiLogOut } from "react-icons/fi";
import { useAuth } from "../features/auth/useAuth";
import { cn } from "../lib/cn";

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfileMenu() {
  const { faculty, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function handleLogout() {
    setOpen(false);
    logout();
    navigate("/login", { replace: true });
  }

  const name = faculty?.name ?? "Faculty";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-slate-500/10 dark:hover:bg-white/10"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-soft">
          {initialsOf(name) || "F"}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block max-w-[9rem] truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
            {name}
          </span>
        </span>
        <FiChevronDown
          className={cn(
            "hidden h-4 w-4 text-slate-400 transition-transform duration-200 sm:block",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        role="menu"
        className={cn(
          "glass absolute right-0 mt-2 w-60 origin-top-right rounded-2xl p-2 transition-all duration-200",
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <div className="border-b border-slate-200/70 px-3 py-2.5 dark:border-white/10">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            {name}
          </p>
          {faculty?.email ? (
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{faculty.email}</p>
          ) : null}
        </div>
        <button
          type="button"
          role="menuitem"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
        >
          <FiLogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );
}
