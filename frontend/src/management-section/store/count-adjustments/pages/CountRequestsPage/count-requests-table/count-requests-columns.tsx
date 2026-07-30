import dayjs from "dayjs";
import { type Column } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { CountAdjustmentRequest } from "@core/types";
import { CountRequestActions } from "../count-request-actions";

interface CountRequestsColumnsOptions {
  itemLabel: (id: string) => string;
  userLabel: (id: string) => string;
  canApprove: boolean;
  busy: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function buildCountRequestsColumns({
  itemLabel,
  userLabel,
  canApprove,
  busy,
  onApprove,
  onReject,
}: CountRequestsColumnsOptions): Column<CountAdjustmentRequest>[] {
  const columns: Column<CountAdjustmentRequest>[] = [
    { header: "Item", render: (r) => itemLabel(r.itemId), emphasis: true },
    { header: "Current", render: (r) => r.currentQuantity, align: "right" },
    { header: "Requested", render: (r) => r.requestedQuantity, align: "right" },
    { header: "By", render: (r) => userLabel(r.requestedByUserId) },
    { header: "Raised", render: (r) => dayjs(r.requestedAt).format("MMM D, HH:mm") },
    { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  if (canApprove) {
    columns.push({
      header: "Actions",
      align: "right",
      render: (r) => (
        <CountRequestActions
          status={r.status}
          busy={busy}
          onApprove={() => onApprove(r.id)}
          onReject={() => onReject(r.id)}
        />
      ),
    });
  }

  return columns;
}
