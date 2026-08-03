import dayjs from "dayjs";
import { type Column } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { NonconformityItemRow } from "@core/types";

interface NonconformityItemsColumnsOptions {
  itemLabel: (id: string) => string;
}

export function buildNonconformityItemsColumns({
  itemLabel,
}: NonconformityItemsColumnsOptions): Column<NonconformityItemRow>[] {
  return [
    { header: "Item", render: (r) => itemLabel(r.itemId), emphasis: true },
    { header: "Qty", render: (r) => r.quantity, align: "right" },
    { header: "Description", render: (r) => r.description ?? "—" },
    { header: "Raised", render: (r) => dayjs(r.reportedAt).format("MMM D, HH:mm") },
    { header: "Stage", render: (r) => <StatusBadge status={r.detectionStage} /> },
    { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];
}
