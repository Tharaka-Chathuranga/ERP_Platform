import { useMemo } from "react";
import { useAuth } from "@auth/AuthContext";
import { permissionsFor, type Permission } from "@auth/permissions";

/**
 * Returns a `can(permission)` predicate for the current user. Use it to gate UI
 * and behaviour; prefer the `Can` component for conditional rendering.
 */
export function useCan(): (permission: Permission) => boolean {
  const { role } = useAuth();
  return useMemo(() => {
    const perms = permissionsFor(role);
    return (permission: Permission) => perms.has(permission);
  }, [role]);
}
