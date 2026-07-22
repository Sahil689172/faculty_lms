import { FiMenu, FiSearch } from "react-icons/fi";
import { ThemeToggle } from "./ThemeToggle";
import { ProfileMenu } from "./ProfileMenu";
import { IconButton } from "./ui";

export function Header({ onOpenMobile }: { onOpenMobile: () => void }) {
  return (
    <header className="glass-header sticky top-0 z-20">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <IconButton
          className="lg:hidden"
          onClick={onOpenMobile}
          aria-label="Open navigation menu"
        >
          <FiMenu className="h-5 w-5" />
        </IconButton>

        <div className="relative hidden max-w-md flex-1 sm:block">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search lessons..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white/60 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
