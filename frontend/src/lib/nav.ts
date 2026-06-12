import {
  IconAlertTriangle,
  IconBuildingWarehouse,
  IconClipboardList,
  IconHome,
  IconPackageExport,
  IconPackageImport,
  type Icon,
} from "@tabler/icons-react";

/** Single source of truth for the main navigation — shared by the sidebar and
 *  the dashboard tiles so they can never drift apart. */
export interface NavItem {
  to: string;
  label: string;
  icon: Icon;
  color: string;
  description: string;
}

export const NAV: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: IconHome, color: "brand", description: "Your store at a glance" },
  { to: "/receiving", label: "Receiving", icon: IconPackageImport, color: "teal", description: "Record goods receipts" },
  { to: "/issuing", label: "Goods Issue", icon: IconPackageExport, color: "yellow", description: "Issue stock to users & record returns" },
  { to: "/store", label: "Store", icon: IconBuildingWarehouse, color: "brand", description: "Items & stock levels" },
  { to: "/defects", label: "Defects", icon: IconAlertTriangle, color: "red", description: "Report & triage deviations" },
  { to: "/requests", label: "Requests", icon: IconClipboardList, color: "grape", description: "Process borrow requests" },
];
