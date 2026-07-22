import { Suspense, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { PageTransition } from "./PageTransition";
import { Spinner } from "./ui";
import { cn } from "../lib/cn";

const COLLAPSE_KEY = "faculty_lms_sidebar_collapsed";

export function Layout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<boolean>(
    () => window.localStorage.getItem(COLLAPSE_KEY) === "true",
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(COLLAPSE_KEY, String(collapsed));
  }, [collapsed]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      {/* Ambient background wash */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/10" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-500/10" />
      </div>

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={cn("transition-all duration-300", collapsed ? "lg:pl-20" : "lg:pl-64")}>
        <Header onOpenMobile={() => setMobileOpen(true)} />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center">
                <Spinner label="Loading..." />
              </div>
            }
          >
            <PageTransition>
              <Outlet />
            </PageTransition>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
