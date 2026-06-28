import {
  IconChartBar,
  IconGasStation,
  IconGauge,
  IconReportMoney,
  IconTruck,
} from "@tabler/icons-react";
import type { NavItem } from "@store/store.nav";
import { DASHBOARD_ADMIN, FUEL_VIEW } from "@auth/permissions";

/** Fuel feature navigation — a collapsible "Fuel" group in the sidebar. */
export const NAV: NavItem[] = [
  { to: "/fuel/issues", label: "Vehicle Issues", icon: IconGasStation, color: "yellow", description: "Issue fuel to vehicles", group: "Fuel", requiredPermission: FUEL_VIEW },
  { to: "/fuel/vehicles", label: "Vehicles", icon: IconTruck, color: "brand", description: "Vehicle master & drivers", group: "Fuel", requiredPermission: FUEL_VIEW },
  { to: "/fuel/tanks", label: "Tanks", icon: IconGauge, color: "grape", description: "Tank levels, readings & refills", group: "Fuel", requiredPermission: FUEL_VIEW },
  { to: "/fuel/prices", label: "Fuel Prices", icon: IconReportMoney, color: "teal", description: "Dated fuel price history", group: "Fuel", requiredPermission: FUEL_VIEW },
  { to: "/fuel/efficiency", label: "Efficiency Report", icon: IconChartBar, color: "violet", description: "km/L per vehicle & driver over time", group: "Fuel", requiredPermission: DASHBOARD_ADMIN },
];
