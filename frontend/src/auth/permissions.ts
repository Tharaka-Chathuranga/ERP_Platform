/**
 * Capability-based access control. Roles map to a fixed set of permissions in
 * ONE place; the rest of the app gates routes, nav and UI on permissions (via
 * `useCan` / `Can` / `RequirePermission`), never on the role string directly.
 *
 * Adding a new role is a single new row here; adding a new gated capability is a
 * single new permission. The backend `@PreAuthorize` rules are the real
 * enforcement — this only drives the UX so users don't see what they can't do.
 */
export type Role = "ADMIN" | "STORE_KEEPER";

export type Permission =
  | "stock:view" // view stock levels, movements, low-stock warnings
  | "item:edit" // edit / deactivate item master data
  | "count:request" // raise & view stock count-adjustment requests
  | "count:approve" // approve / reject count-adjustment requests
  | "supplier:manage" // create / activate / deactivate suppliers
  | "user:manage" // manage users, roles & access
  | "dashboard:admin"; // admin overview & cross-cutting analytics

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  STORE_KEEPER: ["stock:view", "count:request"],
  ADMIN: [
    "stock:view",
    "item:edit",
    "count:request",
    "count:approve",
    "supplier:manage",
    "user:manage",
    "dashboard:admin",
  ],
};

/** Permissions for a role string; unknown roles get none. */
export function permissionsFor(role: string | null | undefined): Set<Permission> {
  return new Set(ROLE_PERMISSIONS[(role as Role) ?? ""] ?? []);
}
