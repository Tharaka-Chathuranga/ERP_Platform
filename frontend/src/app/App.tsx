import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@auth/AuthContext";
import { AppLayout } from "@ui/layout/AppLayout";
import { LoginPage } from "@screens/LoginPage";
import { DashboardHome } from "@home/DashboardHome";
import { storeRoutes } from "@store/store.routes";
import { usersRoutes } from "@users/users.routes";
import { dashboardRoutes } from "@dashboard/dashboard.routes";

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
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardHome />} />

        {/* Each management feature contributes its own route subtree;
            permission-gated routes guard themselves via RequirePermission. */}
        {storeRoutes}
        {usersRoutes}
        {dashboardRoutes}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
