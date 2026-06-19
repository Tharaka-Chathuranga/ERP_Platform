import { Navigate, Outlet } from "react-router-dom";
import { useCan } from "@auth/useCan";
import type { Permission } from "@auth/permissions";

/**
 * Layout-route guard: renders the nested routes only if the current user holds
 * `perform`, otherwise redirects to the dashboard. The backend enforces the
 * same rule with `@PreAuthorize`; this just keeps unauthorized users out of the UI.
 */
export function RequirePermission({ perform }: { perform: Permission }) {
  return useCan()(perform) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
