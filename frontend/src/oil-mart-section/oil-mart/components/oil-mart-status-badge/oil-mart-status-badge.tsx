import { Badge, type BadgeProps } from "@mantine/core";
import type { OilMartSaleStatus } from "@core/types";

const SALE_COLORS: Record<OilMartSaleStatus, string> = {
  QUOTATION: "gray",
  QUOTATION_APPROVAL: "orange",
  ORDERED: "yellow",
  APPROVED: "blue",
  REJECTED: "red",
  DISPATCHED: "grape",
  INVOICED: "green",
  CANCELLED: "dark",
};

const SALE_LABELS: Record<OilMartSaleStatus, string> = {
  QUOTATION: "Quotation",
  QUOTATION_APPROVAL: "Quotation approval",
  ORDERED: "Ordered",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  DISPATCHED: "Dispatched",
  INVOICED: "Invoiced",
  CANCELLED: "Cancelled",
};

interface OilMartStatusBadgeProps extends Omit<BadgeProps, "color" | "children"> {
  status?: OilMartSaleStatus;
}

export function OilMartStatusBadge({ status, ...rest }: OilMartStatusBadgeProps) {
  const color = status ? SALE_COLORS[status] : "gray";
  const label = status ? SALE_LABELS[status] : "—";

  return (
    <Badge color={color} variant="light" radius="sm" {...rest}>
      {label}
    </Badge>
  );
}

export const OIL_MART_SALE_STATUSES: OilMartSaleStatus[] = [
  "QUOTATION",
  "QUOTATION_APPROVAL",
  "ORDERED",
  "APPROVED",
  "REJECTED",
  "DISPATCHED",
  "INVOICED",
  "CANCELLED",
];

export { SALE_LABELS as OIL_MART_SALE_STATUS_LABELS };
