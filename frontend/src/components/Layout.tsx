import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { Button } from "./ui";

export function Layout() {
  const { faculty, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold text-indigo-700">
            Faculty LMS
          </Link>
          <div className="flex items-center gap-4">
            {faculty ? (
              <span className="hidden text-sm text-slate-600 sm:inline">{faculty.name}</span>
            ) : null}
            <Button variant="secondary" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
