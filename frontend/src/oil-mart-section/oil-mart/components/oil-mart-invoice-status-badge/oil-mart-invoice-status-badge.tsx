import { Badge, type BadgeProps } from "@mantine/core";
import type { OilMartInvoiceStatus } from "@core/types";

const INVOICE_COLORS: Record<OilMartInvoiceStatus, string> = {
  PENDING_APPROVAL: "orange",
  APPROVED: "green",
  REJECTED: "red",
  CANCELLED: "dark",
};

const INVOICE_LABELS: Record<OilMartInvoiceStatus, string> = {
  PENDING_APPROVAL: "Pending approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

interface OilMartInvoiceStatusBadgeProps extends Omit<BadgeProps, "color" | "children"> {
  status?: OilMartInvoiceStatus;
}

export function OilMartInvoiceStatusBadge({ status, ...rest }: OilMartInvoiceStatusBadgeProps) {
  const color = status ? INVOICE_COLORS[status] : "gray";
  const label = status ? INVOICE_LABELS[status] : "—";

  return (
    <Badge color={color} variant="light" radius="sm" {...rest}>
      {label}
    </Badge>
  );
}

export const OIL_MART_INVOICE_STATUSES: OilMartInvoiceStatus[] = [
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

export { INVOICE_LABELS as OIL_MART_INVOICE_STATUS_LABELS };
