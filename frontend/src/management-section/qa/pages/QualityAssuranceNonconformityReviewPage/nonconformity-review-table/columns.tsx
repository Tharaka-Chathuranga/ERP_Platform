import type { Column } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { NonconformityReport } from "@core/types";

export function buildNonconformityColumns(userLabel: (id: string) => string): Column<NonconformityReport>[] {
  return [
    { header: "Reported by", emphasis: true, render: (d) => userLabel(d.reportedByUserId) },
    { header: "Description", render: (d) => d.description || "—" },
    { header: "Items", align: "right", render: (d) => d.items.length },
    { header: "Raised", render: (d) => new Date(d.reportedAt).toLocaleDateString() },
    { header: "Stage", render: (d) => <StatusBadge status={d.detectionStage} /> },
    { header: "Status", render: (d) => <StatusBadge status={d.status} /> },
  ];
}
