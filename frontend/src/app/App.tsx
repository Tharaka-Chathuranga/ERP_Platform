import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@auth/AuthContext";
import { AppLayout } from "@ui/layout/AppLayout";
import { AppVoiceCommands } from "./AppVoiceCommands";
import { LoginPage } from "@screens/LoginPage";
import { DashboardPage } from "@dashboard/DashboardPage";
import { storeRoutes } from "@store/store.routes";
import { fuelRoutes } from "@fuel/fuel.routes";
import { usersRoutes } from "@users/users.routes";
import { adminRoutes } from "@admin/admin.routes";
import { qaRoutes } from "@qa/qa.routes";

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppVoiceCommands />
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Each management feature contributes its own route subtree;
            permission-gated routes guard themselves via RequirePermission. */}
        {storeRoutes}
        {fuelRoutes}
        {usersRoutes}
        {adminRoutes}
        {qaRoutes}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
