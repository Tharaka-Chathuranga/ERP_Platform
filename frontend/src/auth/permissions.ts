/**
 * Capability-based access control. Roles map to a fixed set of permissions in
 * ONE place; the rest of the app gates routes, nav and UI on permissions (via
 * `useCan` / `Can` / `RequirePermission`), never on the role string directly.
 *
 * Adding a new role is a single new row here; adding a new gated capability is a
 * single new permission. The backend `@PreAuthorize` rules are the real
 * enforcement — this only drives the UX so users don't see what they can't do.
 */
export type Role = "ADMIN" | "STORE_KEEPER" | "QUALITY_ASSURANCE";

export type Permission =
  | "stock:view" // view stock levels, movements, low-stock warnings
  | "item:edit" // edit / deactivate item master data
  | "count:request" // raise & view stock count-adjustment requests
  | "count:approve" // approve / reject count-adjustment requests
  | "supplier:manage" // create / activate / deactivate suppliers
  | "user:manage" // manage users, roles & access
  | "dashboard:admin" // admin overview & cross-cutting analytics
  | "ncr:view" // see the nonconformity board, reports & detail
  | "ncr:review" // review, disposition / reject & close nonconformity reports
  | "dashboard:qa" // quality-assurance overview
  | "fuel:view" // view fuel tanks, vehicle issues, refills, readings & prices
  | "fuel:manage"; // manage vehicle master data & add fuel prices

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  STORE_KEEPER: ["stock:view", "count:request", "ncr:view", "fuel:view"],
  QUALITY_ASSURANCE: ["ncr:view", "ncr:review", "dashboard:qa"],
  ADMIN: [
    "stock:view",
    "item:edit",
    "count:request",
    "count:approve",
    "supplier:manage",
    "user:manage",
    "dashboard:admin",
    "ncr:view",
    "ncr:review",
    "dashboard:qa",
    "fuel:view",
    "fuel:manage",
  ],
};

/** Permissions for a role string; unknown roles get none. */
export function permissionsFor(role: string | null | undefined): Set<Permission> {
  return new Set(ROLE_PERMISSIONS[(role as Role) ?? ""] ?? []);
}

// Named exports for permission keys to avoid string literals across the UI.
export const STOCK_VIEW: Permission = "stock:view";
export const ITEM_EDIT: Permission = "item:edit";
export const COUNT_REQUEST: Permission = "count:request";
export const COUNT_APPROVE: Permission = "count:approve";
export const SUPPLIER_MANAGE: Permission = "supplier:manage";
export const USER_MANAGE: Permission = "user:manage";
export const DASHBOARD_ADMIN: Permission = "dashboard:admin";
export const NCR_VIEW: Permission = "ncr:view";
export const NCR_REVIEW: Permission = "ncr:review";
export const DASHBOARD_QA: Permission = "dashboard:qa";
export const FUEL_VIEW: Permission = "fuel:view";
export const FUEL_MANAGE: Permission = "fuel:manage";
