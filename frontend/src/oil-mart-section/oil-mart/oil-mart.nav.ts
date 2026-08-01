import {
  IconBuildingWarehouse,
  IconDroplet,
  IconLayoutDashboard,
  IconPackageImport,
  IconShoppingCart,
  IconTruckLoading,
  IconUsers,
} from "@tabler/icons-react";
import type { NavItem } from "@store/store.nav";
import { OILMART_VIEW } from "@auth/permissions";

export const NAV: NavItem[] = [
  { to: "/oil-mart", label: "Overview", icon: IconLayoutDashboard, color: "orange", description: "Stock value, sales & approvals", group: "Oil Mart", requiredPermission: OILMART_VIEW },
  { to: "/oil-mart/sales", label: "Sales", icon: IconShoppingCart, color: "green", description: "Quotation to invoice pipeline", group: "Oil Mart", requiredPermission: OILMART_VIEW },
  { to: "/oil-mart/stock", label: "Oil Stock", icon: IconBuildingWarehouse, color: "teal", description: "Balances & movement ledger", group: "Oil Mart", requiredPermission: OILMART_VIEW },
  { to: "/oil-mart/receipts", label: "Receipts", icon: IconPackageImport, color: "grape", description: "Oil received from suppliers", group: "Oil Mart", requiredPermission: OILMART_VIEW },
  { to: "/oil-mart/items", label: "Oils", icon: IconDroplet, color: "yellow", description: "Oil types, grades & dated prices", group: "Oil Mart", requiredPermission: OILMART_VIEW },
  { to: "/oil-mart/clients", label: "Clients", icon: IconUsers, color: "brand", description: "Buyers & purchase history", group: "Oil Mart", requiredPermission: OILMART_VIEW },
  { to: "/oil-mart/suppliers", label: "Oil Suppliers", icon: IconTruckLoading, color: "violet", description: "Where the oil is bought from", group: "Oil Mart", requiredPermission: OILMART_VIEW },
];
