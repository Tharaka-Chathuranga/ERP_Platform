import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useItemLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { listMovements } from "@store/stock-movements/movements.api";
import { DataTable } from "@ui/data/DataTable";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { StockMovement } from "@core/types";

/** The full stock-movement ledger, newest first. */
export function MovementsTab() {
  const itemLabel = useItemLabels();
  const { data, isLoading, error } = useQuery({
    queryKey: qk.allMovements(),
    queryFn: listMovements,
  });

  return (
    <DataTable<StockMovement>
      data={data?.content}
      loading={isLoading}
      error={error}
      rowKey={(r) => r.id}
      columns={[
        { header: "When", render: (r) => dayjs(r.occurredAt).format("MMM D, HH:mm") },
        { header: "Item", render: (r) => itemLabel(r.itemId), emphasis: true },
        { header: "Type", render: (r) => <StatusBadge status={r.type} /> },
        { header: "Qty", render: (r) => r.quantity, align: "right" },
        { header: "Unit cost", render: (r) => r.unitCost ?? "—", align: "right" },
        { header: "Reference", render: (r) => r.reference ?? "—" },
      ]}
    />
  );
}
