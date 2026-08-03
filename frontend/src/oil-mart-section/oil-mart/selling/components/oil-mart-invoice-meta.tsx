import type { ReactNode } from "react";
import { IconCircleCheck, IconHourglassHigh, IconX } from "@tabler/icons-react";
import type { OilMartInvoiceStatus } from "@core/types";

export interface OilMartInvoiceStatusMeta {
  label: string;
  bg: string;
  border: string;
  badge: string;
  iconColor: string;
  icon: ReactNode;
}

export const OIL_MART_INVOICE_STATUS_META: Record<
  OilMartInvoiceStatus,
  OilMartInvoiceStatusMeta
> = {
  PENDING_APPROVAL: { label: "Pending approval", bg: "var(--mantine-color-orange-light)", border: "var(--mantine-color-orange-5)", badge: "orange", iconColor: "orange", icon: <IconHourglassHigh size={28} /> },
  APPROVED:         { label: "Approved",         bg: "var(--mantine-color-green-light)",  border: "var(--mantine-color-green-5)",  badge: "green",  iconColor: "green",  icon: <IconCircleCheck size={28} /> },
  REJECTED:         { label: "Rejected",         bg: "var(--mantine-color-red-light)",    border: "var(--mantine-color-red-5)",    badge: "red",    iconColor: "red",    icon: <IconX size={28} /> },
};

export const OIL_MART_INVOICE_BOARD_STATUSES: OilMartInvoiceStatus[] = [
  "PENDING_APPROVAL",
  "APPROVED",
];

export const OIL_MART_INVOICE_TERMINAL_STATUSES: OilMartInvoiceStatus[] = ["REJECTED"];
