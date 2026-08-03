import type { ReactNode } from "react";
import {
  IconBan,
  IconCircleCheck,
  IconFileDescription,
  IconHourglassHigh,
  IconX,
} from "@tabler/icons-react";
import type { OilMartQuotationStatus } from "@core/types";

export interface OilMartQuotationStatusMeta {
  label: string;
  bg: string;
  border: string;
  badge: string;
  iconColor: string;
  icon: ReactNode;
}

export const OIL_MART_QUOTATION_STATUS_META: Record<
  OilMartQuotationStatus,
  OilMartQuotationStatusMeta
> = {
  DRAFT:            { label: "Draft",            bg: "var(--mantine-color-gray-light)",   border: "var(--mantine-color-gray-5)",   badge: "gray",   iconColor: "gray",   icon: <IconFileDescription size={28} /> },
  PENDING_APPROVAL: { label: "Pending approval", bg: "var(--mantine-color-orange-light)", border: "var(--mantine-color-orange-5)", badge: "orange", iconColor: "orange", icon: <IconHourglassHigh size={28} /> },
  APPROVED:         { label: "Approved",         bg: "var(--mantine-color-green-light)",  border: "var(--mantine-color-green-5)",  badge: "green",  iconColor: "green",  icon: <IconCircleCheck size={28} /> },
  REJECTED:         { label: "Rejected",         bg: "var(--mantine-color-red-light)",    border: "var(--mantine-color-red-5)",    badge: "red",    iconColor: "red",    icon: <IconX size={28} /> },
  CANCELLED:        { label: "Cancelled",        bg: "var(--mantine-color-dark-light)",   border: "var(--mantine-color-dark-5)",   badge: "dark",   iconColor: "dark",   icon: <IconBan size={28} /> },
};

export const OIL_MART_QUOTATION_BOARD_STATUSES: OilMartQuotationStatus[] = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
];

export const OIL_MART_QUOTATION_TERMINAL_STATUSES: OilMartQuotationStatus[] = [
  "REJECTED",
  "CANCELLED",
];
