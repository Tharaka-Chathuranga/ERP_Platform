import type { ReactNode } from "react";
import {
  IconBan,
  IconClipboardList,
  IconFileDescription,
  IconGavel,
  IconReceipt,
  IconTruckDelivery,
  IconX,
} from "@tabler/icons-react";
import type { OilMartPaymentMethod, OilMartSaleStatus } from "@core/types";

export interface OilMartSaleStatusMeta {
  label: string;
  bg: string;
  border: string;
  badge: string;
  iconColor: string;
  icon: ReactNode;
}

export const OIL_MART_SALE_STATUS_META: Record<OilMartSaleStatus, OilMartSaleStatusMeta> = {
  QUOTATION:  { label: "Quotation",  bg: "var(--mantine-color-gray-light)",   border: "var(--mantine-color-gray-5)",   badge: "gray",   iconColor: "gray",   icon: <IconFileDescription size={28} /> },
  ORDERED:    { label: "Ordered",    bg: "var(--mantine-color-yellow-light)", border: "var(--mantine-color-yellow-5)", badge: "yellow", iconColor: "yellow", icon: <IconClipboardList size={28} /> },
  APPROVED:   { label: "Approved",   bg: "var(--mantine-color-blue-light)",   border: "var(--mantine-color-blue-5)",   badge: "blue",   iconColor: "blue",   icon: <IconGavel size={28} /> },
  REJECTED:   { label: "Rejected",   bg: "var(--mantine-color-red-light)",    border: "var(--mantine-color-red-5)",    badge: "red",    iconColor: "red",    icon: <IconX size={28} /> },
  DISPATCHED: { label: "Dispatched", bg: "var(--mantine-color-grape-light)",  border: "var(--mantine-color-grape-5)",  badge: "grape",  iconColor: "grape",  icon: <IconTruckDelivery size={28} /> },
  INVOICED:   { label: "Invoiced",   bg: "var(--mantine-color-green-light)",  border: "var(--mantine-color-green-5)",  badge: "green",  iconColor: "green",  icon: <IconReceipt size={28} /> },
  CANCELLED:  { label: "Cancelled",  bg: "var(--mantine-color-dark-light)",   border: "var(--mantine-color-dark-5)",   badge: "dark",   iconColor: "dark",   icon: <IconBan size={28} /> },
};

export const OIL_MART_BOARD_STATUSES: OilMartSaleStatus[] = [
  "QUOTATION",
  "ORDERED",
  "APPROVED",
  "DISPATCHED",
  "INVOICED",
];

export const OIL_MART_TERMINAL_STATUSES: OilMartSaleStatus[] = ["REJECTED", "CANCELLED"];

export const PAYMENT_METHOD_LABELS: Record<OilMartPaymentMethod, string> = {
  CASH: "Cash",
  CARD: "Card",
  BANK_TRANSFER: "Bank transfer",
};

export const PAYMENT_METHOD_OPTIONS = (
  Object.keys(PAYMENT_METHOD_LABELS) as OilMartPaymentMethod[]
).map((value) => ({ value, label: PAYMENT_METHOD_LABELS[value] }));
