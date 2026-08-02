import {
  IconAlertHexagon,
  IconAlertTriangle,
  IconArrowsExchange,
  IconBuildingWarehouse,
  IconClipboardCheck,
  IconLayoutDashboard,
  IconListDetails,
  IconPackageExport,
  IconPackageImport,
  IconTruck,
  type Icon,
} from "@tabler/icons-react";
import type { Permission } from "@auth/permissions";
import { STOCK_VIEW, COUNT_REQUEST, NCR_VIEW, DASHBOARD_ADMIN, DASHBOARD_OVERVIEW } from "@auth/permissions";

export interface NavItem {
  to: string;
  label: string;
  icon: Icon;
  color: string;
  description: string;
  requiredPermission?: Permission;
  group?: string;
}

export const NAV: NavItem[] = [
  { to: "/overview", label: "Overview", icon: IconLayoutDashboard, color: "indigo", description: "Your role overview & KPIs", requiredPermission: DASHBOARD_OVERVIEW },

  // ── Operations: day-to-day goods movement ──
  { to: "/receiving", label: "Receiving", icon: IconPackageImport, color: "teal", description: "Record goods receipts", group: "Operations", requiredPermission: STOCK_VIEW },
  { to: "/issuing", label: "Goods Issue", icon: IconPackageExport, color: "yellow", description: "Issue stock to users & record returns", group: "Operations", requiredPermission: STOCK_VIEW },
  { to: "/movements", label: "Stock Movements", icon: IconArrowsExchange, color: "grape", description: "Full movement ledger", group: "Operations", requiredPermission: STOCK_VIEW },

  // ── Inventory: master data & stock levels ──
  { to: "/store", label: "Items", icon: IconBuildingWarehouse, color: "brand", description: "Item catalog & stock levels", group: "Inventory", requiredPermission: STOCK_VIEW },
  { to: "/store/suppliers", label: "Suppliers", icon: IconTruck, color: "brand", description: "Supplier master data", group: "Inventory", requiredPermission: STOCK_VIEW },
  { to: "/warnings", label: "Low Stock", icon: IconAlertHexagon, color: "red", description: "Items below reorder level", group: "Inventory", requiredPermission: STOCK_VIEW },

  // ── Compliance: adjustments & nonconformities ──
  { to: "/count-requests", label: "Count Requests", icon: IconClipboardCheck, color: "indigo", description: "Stock count adjustments", group: "Compliance", requiredPermission: COUNT_REQUEST },
  { to: "/nonconformities", label: "Nonconformities", icon: IconAlertTriangle, color: "orange", description: "Report & triage nonconformities", group: "Compliance", requiredPermission: NCR_VIEW },
  { to: "/nonconformities/items", label: "Nonconforming Items", icon: IconListDetails, color: "orange", description: "Every nonconforming item line", group: "Compliance", requiredPermission: DASHBOARD_ADMIN },
];
