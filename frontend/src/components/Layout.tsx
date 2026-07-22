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
