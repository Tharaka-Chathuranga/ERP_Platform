import dayjs from "dayjs";
import { PersonCell, type Column } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { BorrowRequest } from "@core/types";

interface RequestListColumnsOptions {
  userLabel: (id: string) => string;
}

export function buildRequestListColumns({ userLabel }: RequestListColumnsOptions): Column<BorrowRequest>[] {
  return [
    {
      header: "Requested by",
      render: (r) => <PersonCell name={userLabel(r.requestedByUserId)} />,
    },
    { header: "Reason", render: (r) => r.reason || "—" },
    { header: "Requested", render: (r) => dayjs(r.requestedAt).format("MMM DD, YYYY") },
    { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];
}
