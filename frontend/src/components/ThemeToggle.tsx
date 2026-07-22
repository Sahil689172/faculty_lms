import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../lib/theme";
import { cn } from "../lib/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-500/10 dark:text-slate-300 dark:hover:bg-white/10",
        className,
      )}
    >
      {isDark ? <FiMoon className="h-5 w-5" /> : <FiSun className="h-5 w-5" />}
    </button>
  );
}
