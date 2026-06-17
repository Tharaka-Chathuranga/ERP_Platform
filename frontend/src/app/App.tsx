import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@auth/AuthContext";
import { AppLayout } from "@ui/layout/AppLayout";
import { LoginPage } from "@screens/LoginPage";
import { DashboardHome } from "@home/DashboardHome";
import { storeRoutes } from "@store/store.routes";
import { adminRoutes } from "@admin/admin.routes";

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

/** Layout-route guard for the admin section: non-admins are bounced to the
 *  dashboard. The backend enforces the same with @PreAuthorize. */
function RequireAdmin() {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
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

        {/* Each management section contributes its own route subtree */}
        {storeRoutes}

        {/* Admin section, gated to administrators */}
        <Route element={<RequireAdmin />}>{adminRoutes}</Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
