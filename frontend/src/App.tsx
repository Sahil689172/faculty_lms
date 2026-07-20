import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LessonDetailPage } from "./pages/LessonDetailPage";
import { UploadLessonPage } from "./pages/UploadLessonPage";
import { EditLessonPage } from "./pages/EditLessonPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

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
  );
}
