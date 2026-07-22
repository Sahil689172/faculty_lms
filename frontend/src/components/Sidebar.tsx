import { NavLink } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiChevronLeft,
  FiGrid,
  FiLayers,
  FiUploadCloud,
} from "react-icons/fi";
import { cn } from "../lib/cn";

interface NavItem {
  to: string;
  label: string;
  icon: IconType;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: FiGrid, end: true },
  { to: "/lessons/new", label: "Upload Lesson", icon: FiUploadCloud },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onCloseMobile}
        aria-hidden={!mobileOpen}
        className={cn(
          "fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "glass-panel fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-out",
          collapsed ? "lg:w-20" : "lg:w-64",
          "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center gap-2.5 px-5",
            collapsed && "lg:justify-center lg:px-0",
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-soft">
            <FiLayers className="h-5 w-5" />
          </span>
          <span
            className={cn(
              "font-display text-lg font-bold tracking-tight text-slate-800 transition-all duration-200 dark:text-white",
              collapsed && "lg:hidden",
            )}
          >
            Faculty LMS
          </span>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onCloseMobile}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                  collapsed && "lg:justify-center",
                  isActive
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
                    : "text-slate-500 hover:bg-slate-500/10 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-indigo-500 transition-all duration-200",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className={cn("truncate", collapsed && "lg:hidden")}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            "m-3 hidden items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-500/10 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 lg:flex",
            collapsed && "justify-center",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FiChevronLeft
            className={cn("h-5 w-5 shrink-0 transition-transform duration-300", collapsed && "rotate-180")}
          />
          <span className={cn(collapsed && "lg:hidden")}>Collapse</span>
        </button>
      </aside>
    </>
  );
}
