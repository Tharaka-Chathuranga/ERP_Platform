import { Badge } from "@mantine/core";

// Single source of truth for status → color across all document types.
const COLORS: Record<string, string> = {
  // GRN
  DRAFT: "gray",
  POSTED: "green",
  // Issue
  PENDING_APPROVAL: "yellow",
  APPROVED: "blue",
  ISSUED: "green",
  REJECTED: "red",
  RETURNED: "teal",
  // Deviation / Borrow
  PENDING: "yellow",
  // Deviation stages
  INCOMING: "gray",
  IN_PROGRESS: "blue",
  FINAL: "green",
  // Item / supplier
  ACTIVE: "green",
  INACTIVE: "gray",
};

function label(status: string): string {
  return status.replace(/_/g, " ");
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge color={COLORS[status] ?? "gray"} variant="light" radius="sm">
      {label(status)}
    </Badge>
  );
}
