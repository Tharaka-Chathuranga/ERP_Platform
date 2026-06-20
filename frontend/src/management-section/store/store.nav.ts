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
import { STOCK_VIEW, COUNT_REQUEST, DEFECT_VIEW, DASHBOARD_ADMIN } from "@auth/permissions";

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
  { to: "/dashboard", label: "Home", icon: IconHome, color: "brand", description: "Your dashboard" },

  // ── Operations: day-to-day goods movement ──
  { to: "/receiving", label: "Receiving", icon: IconPackageImport, color: "teal", description: "Record goods receipts", group: "Operations", requiredPermission: STOCK_VIEW },
  { to: "/issuing", label: "Goods Issue", icon: IconPackageExport, color: "yellow", description: "Issue stock to users & record returns", group: "Operations", requiredPermission: STOCK_VIEW },
  { to: "/movements", label: "Stock Movements", icon: IconArrowsExchange, color: "grape", description: "Full movement ledger", group: "Operations", requiredPermission: STOCK_VIEW },

  // ── Inventory: master data & stock levels ──
  { to: "/store", label: "Items", icon: IconBuildingWarehouse, color: "brand", description: "Item catalog & stock levels", group: "Inventory", requiredPermission: STOCK_VIEW },
  { to: "/store/suppliers", label: "Suppliers", icon: IconTruck, color: "brand", description: "Supplier master data", group: "Inventory", requiredPermission: STOCK_VIEW },
  { to: "/warnings", label: "Low Stock", icon: IconAlertHexagon, color: "red", description: "Items below reorder level", group: "Inventory", requiredPermission: STOCK_VIEW },

  // ── Compliance: adjustments & defects ──
  { to: "/count-requests", label: "Count Requests", icon: IconClipboardCheck, color: "indigo", description: "Stock count adjustments", group: "Compliance", requiredPermission: COUNT_REQUEST },
  { to: "/defects", label: "Defects", icon: IconAlertTriangle, color: "orange", description: "Report & triage deviations", group: "Compliance", requiredPermission: DEFECT_VIEW },
  { to: "/defects/items", label: "Defect Line Items", icon: IconListDetails, color: "orange", description: "Every defective item line", group: "Compliance", requiredPermission: DASHBOARD_ADMIN },
];
