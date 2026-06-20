import { Navigate } from "react-router-dom";
import { useAuth } from "@auth/AuthContext";
import { StorekeeperDashboard } from "./StorekeeperDashboard";

/** Renders a role-specific home dashboard.
 *  Admin users go to the analytics overview; QA users go to the defect queue;
 *  store keepers see the operational dashboard here. */
export function DashboardPage() {
  const { role } = useAuth();

  if (role === "ADMIN") return <Navigate to="/overview" replace />;
  if (role === "QUALITY_ASSURANCE") return <Navigate to="/qa" replace />;

  return <StorekeeperDashboard />;
}
