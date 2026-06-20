import {
  IconAlertHexagon,
  IconAlertTriangle,
  IconArrowsExchange,
  IconBuildingWarehouse,
  IconClipboardCheck,
  IconHome,
  IconListDetails,
  IconPackageExport,
  IconPackageImport,
  IconTruck,
  type Icon,
} from "@tabler/icons-react";
import type { Permission } from "@auth/permissions";

/** Single source of truth for the main navigation — shared by the sidebar and
 *  the dashboard tiles so they can never drift apart. */
export interface NavItem {
  to: string;
  label: string;
  icon: Icon;
  color: string;
  description: string;
  /** When set, the entry is only shown to users holding this permission. */
  requiredPermission?: Permission;
  /** When set, the entry is nested under a collapsible group of this name in the sidebar. */
  group?: string;
}

export const NAV: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: IconHome, color: "brand", description: "Your store at a glance" },

  // ── Store group: the whole store domain lives under one collapsible parent ──
  // Core store operations are gated on `stock:view` so non-store roles (e.g. QA) don't see them.
  { to: "/receiving", label: "Receiving", icon: IconPackageImport, color: "teal", description: "Record goods receipts", group: "Store", requiredPermission: "stock:view" },
  { to: "/issuing", label: "Goods Issue", icon: IconPackageExport, color: "yellow", description: "Issue stock to users & record returns", group: "Store", requiredPermission: "stock:view" },
  { to: "/store", label: "Items", icon: IconBuildingWarehouse, color: "brand", description: "Items & stock levels", group: "Store", requiredPermission: "stock:view" },
  { to: "/store/suppliers", label: "Suppliers", icon: IconTruck, color: "brand", description: "Supplier master data", group: "Store", requiredPermission: "stock:view" },
  { to: "/movements", label: "Stock Movements", icon: IconArrowsExchange, color: "grape", description: "Top movements & full ledger", group: "Store", requiredPermission: "stock:view" },
  { to: "/warnings", label: "Warnings", icon: IconAlertHexagon, color: "red", description: "Items below reorder level", group: "Store", requiredPermission: "stock:view" },
  { to: "/count-requests", label: "Count Requests", icon: IconClipboardCheck, color: "indigo", description: "Stock count adjustments", group: "Store", requiredPermission: "count:request" },
  { to: "/defects", label: "Defects", icon: IconAlertTriangle, color: "red", description: "Report & triage deviations", group: "Store", requiredPermission: "defect:view" },
  { to: "/defects/items", label: "Defect Items", icon: IconListDetails, color: "red", description: "Every defective item line", group: "Store", requiredPermission: "dashboard:admin" },
];
