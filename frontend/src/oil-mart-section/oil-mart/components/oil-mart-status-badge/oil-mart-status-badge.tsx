import { Badge, type BadgeProps } from "@mantine/core";
import type { OilMartQuotationStatus } from "@core/types";

const QUOTATION_COLORS: Record<OilMartQuotationStatus, string> = {
  DRAFT: "gray",
  PENDING_APPROVAL: "orange",
  APPROVED: "green",
  REJECTED: "red",
  CANCELLED: "dark",
};

const QUOTATION_LABELS: Record<OilMartQuotationStatus, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

interface OilMartStatusBadgeProps extends Omit<BadgeProps, "color" | "children"> {
  status?: OilMartQuotationStatus;
}

export function OilMartStatusBadge({ status, ...rest }: OilMartStatusBadgeProps) {
  const color = status ? QUOTATION_COLORS[status] : "gray";
  const label = status ? QUOTATION_LABELS[status] : "—";

  return (
    <Badge color={color} variant="light" radius="sm" {...rest}>
      {label}
    </Badge>
  );
}

export const OIL_MART_QUOTATION_STATUSES: OilMartQuotationStatus[] = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

export { QUOTATION_LABELS as OIL_MART_QUOTATION_STATUS_LABELS };
