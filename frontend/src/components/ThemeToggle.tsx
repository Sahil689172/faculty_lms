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
        "relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl text-slate-600 transition-all duration-200 hover:bg-slate-500/10 active:scale-95 dark:text-slate-300 dark:hover:bg-white/10",
        className,
      )}
    >
      <FiSun
        className={cn(
          "absolute h-5 w-5 transition-all duration-300",
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
        )}
      />
      <FiMoon
        className={cn(
          "absolute h-5 w-5 transition-all duration-300",
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
        )}
      />
    </button>
  );
}
