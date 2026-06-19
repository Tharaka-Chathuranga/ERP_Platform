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
  { to: "/receiving", label: "Receiving", icon: IconPackageImport, color: "teal", description: "Record goods receipts", group: "Store" },
  { to: "/issuing", label: "Goods Issue", icon: IconPackageExport, color: "yellow", description: "Issue stock to users & record returns", group: "Store" },
  { to: "/store", label: "Items", icon: IconBuildingWarehouse, color: "brand", description: "Items & stock levels", group: "Store" },
  { to: "/store/suppliers", label: "Suppliers", icon: IconTruck, color: "brand", description: "Supplier master data", group: "Store" },
  { to: "/movements", label: "Stock Movements", icon: IconArrowsExchange, color: "grape", description: "Top movements & full ledger", group: "Store" },
  { to: "/warnings", label: "Warnings", icon: IconAlertHexagon, color: "red", description: "Items below reorder level", group: "Store", requiredPermission: "stock:view" },
  { to: "/count-requests", label: "Count Requests", icon: IconClipboardCheck, color: "indigo", description: "Stock count adjustments", group: "Store", requiredPermission: "count:request" },
  { to: "/defects", label: "Defects", icon: IconAlertTriangle, color: "red", description: "Report & triage deviations", group: "Store" },
  { to: "/defects/items", label: "Defect Items", icon: IconListDetails, color: "red", description: "Every defective item line", group: "Store", requiredPermission: "dashboard:admin" },
];
