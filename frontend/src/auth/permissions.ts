/**
 * Capability-based access control. Roles map to a fixed set of permissions in
 * ONE place; the rest of the app gates routes, nav and UI on permissions (via
 * `useCan` / `Can` / `RequirePermission`), never on the role string directly.
 *
 * Adding a new role is a single new row here; adding a new gated capability is a
 * single new permission. The backend `@PreAuthorize` rules are the real
 * enforcement — this only drives the UX so users don't see what they can't do.
 */
export type Role =
  | "ADMIN"
  | "STORE_KEEPER"
  | "QUALITY_ASSURANCE"
  | "OIL_MART_ASSISTANT"
  | "STORES_MANAGER";

export type Permission =
  | "stock:view" // view stock levels, movements, low-stock warnings
  | "item:edit" // edit / deactivate item master data
  | "count:request" // raise & view stock count-adjustment requests
  | "count:approve" // approve / reject count-adjustment requests
  | "supplier:manage" // create / activate / deactivate suppliers
  | "user:manage" // manage users, roles & access
  | "dashboard:overview" // the shared role overview (store / fuel / compliance KPIs)
  | "dashboard:admin" // admin overview & cross-cutting analytics
  | "ncr:view" // see the nonconformity board, reports & detail
  | "ncr:review" // review, disposition / reject & close nonconformity reports
  | "dashboard:qa" // quality-assurance overview
  | "fuel:view" // view fuel tanks, vehicle issues, refills, readings & prices
  | "fuel:manage" // manage vehicle master data & add fuel prices
  | "oilmart:view"
  | "oilmart:receive"
  | "oilmart:client:manage"
  | "oilmart:sale:create"
  | "oilmart:sale:approve"
  | "oilmart:item:manage"
  | "oilmart:price:manage"
  | "oilmart:profit:view" // see cost & margin on quotations and invoices
  | "oilmart:report";

const OIL_MART_ALL: Permission[] = [
  "oilmart:view",
  "oilmart:receive",
  "oilmart:client:manage",
  "oilmart:sale:create",
  "oilmart:sale:approve",
  "oilmart:item:manage",
  "oilmart:price:manage",
  "oilmart:profit:view",
  "oilmart:report",
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  STORE_KEEPER: ["dashboard:overview", "stock:view", "count:request", "ncr:view", "fuel:view"],
  QUALITY_ASSURANCE: ["dashboard:overview", "ncr:view", "ncr:review", "dashboard:qa"],
  OIL_MART_ASSISTANT: [
    "oilmart:view",
    "oilmart:receive",
    "oilmart:client:manage",
    "oilmart:sale:create",
  ],
  STORES_MANAGER: [
    "oilmart:view",
    "oilmart:sale:create",
    "oilmart:sale:approve",
    "oilmart:item:manage",
    "oilmart:price:manage",
    "oilmart:profit:view",
    "oilmart:report",
  ],
  ADMIN: [
    "dashboard:overview",
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
    ...OIL_MART_ALL,
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
export const DASHBOARD_OVERVIEW: Permission = "dashboard:overview";
export const DASHBOARD_ADMIN: Permission = "dashboard:admin";
export const NCR_VIEW: Permission = "ncr:view";
export const NCR_REVIEW: Permission = "ncr:review";
export const DASHBOARD_QA: Permission = "dashboard:qa";
export const FUEL_VIEW: Permission = "fuel:view";
export const FUEL_MANAGE: Permission = "fuel:manage";
export const OILMART_VIEW: Permission = "oilmart:view";
export const OILMART_RECEIVE: Permission = "oilmart:receive";
export const OILMART_CLIENT_MANAGE: Permission = "oilmart:client:manage";
export const OILMART_SALE_CREATE: Permission = "oilmart:sale:create";
export const OILMART_SALE_APPROVE: Permission = "oilmart:sale:approve";
export const OILMART_ITEM_MANAGE: Permission = "oilmart:item:manage";
export const OILMART_PRICE_MANAGE: Permission = "oilmart:price:manage";
export const OILMART_PROFIT_VIEW: Permission = "oilmart:profit:view";
export const OILMART_REPORT: Permission = "oilmart:report";
