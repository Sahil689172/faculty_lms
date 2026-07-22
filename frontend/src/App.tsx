import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Spinner } from "./components/ui";

const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("./pages/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const LessonDetailPage = lazy(() =>
  import("./pages/LessonDetailPage").then((m) => ({ default: m.LessonDetailPage })),
);
const UploadLessonPage = lazy(() =>
  import("./pages/UploadLessonPage").then((m) => ({ default: m.UploadLessonPage })),
);
const EditLessonPage = lazy(() =>
  import("./pages/EditLessonPage").then((m) => ({ default: m.EditLessonPage })),
);

export function App() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Spinner label="Loading..." />
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/lessons/new" element={<UploadLessonPage />} />
            <Route path="/lessons/:id" element={<LessonDetailPage />} />
            <Route path="/lessons/:id/edit" element={<EditLessonPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
