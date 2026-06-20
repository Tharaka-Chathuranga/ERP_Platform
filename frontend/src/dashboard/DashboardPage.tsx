import { Navigate } from "react-router-dom";

/** Every authenticated user is sent to /overview which renders their role-specific content. */
export function DashboardPage() {
  return <Navigate to="/overview" replace />;
}
