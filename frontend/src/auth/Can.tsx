import type { ReactNode } from "react";
import { useCan } from "@auth/useCan";
import type { Permission } from "@auth/permissions";

/**
 * Renders its children only when the current user holds `perform`. Optional
 * `fallback` is shown otherwise. Use for conditional UI (buttons, columns,
 * sections); use `RequirePermission` to guard whole routes.
 */
export function Can({
  perform,
  children,
  fallback = null,
}: {
  perform: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return useCan()(perform) ? <>{children}</> : <>{fallback}</>;
}
