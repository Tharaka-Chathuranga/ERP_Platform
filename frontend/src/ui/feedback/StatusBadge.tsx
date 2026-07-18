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
  // Borrow
  PENDING: "yellow",
  // Nonconformity (NCR) lifecycle
  RAISED: "yellow",
  UNDER_REVIEW: "blue",
  DISPOSITIONED: "green",
  CLOSED: "teal",
  // Detection stages
  INCOMING: "gray",
  IN_PROGRESS: "blue",
  FINAL: "green",
  // Item / supplier
  ACTIVE: "green",
  INACTIVE: "gray",
  CRITICAL: "red",
};

function label(status?: string): string {
  return (status ?? "—").replace(/_/g, " ");
}

// `status` is intentionally tolerant of undefined: a stale/partial API response
// (e.g. a backend that predates a new status field) must not crash the page.
export function StatusBadge({ status }: { status?: string }) {
  return (
    <Badge color={COLORS[status ?? ""] ?? "gray"} variant="light" radius="sm">
      {label(status)}
    </Badge>
  );
}
