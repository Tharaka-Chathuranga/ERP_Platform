import { useState } from "react";
import { Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useItemLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { DataTable, TableToolbar } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { PageHeader } from "@ui/layout/PageHeader";
import type { DeviationItemRow, DeviationStage } from "@core/types";
import { getDefectItems } from "./deviations.api";

const FILTERS = ["ALL", "INCOMING", "IN_PROGRESS", "FINAL"] as const;

/** Flattened view of every defective item line across all deviation requests. */
export function DefectItemsPage() {
  const itemLabel = useItemLabels();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [search, setSearch] = useState("");

  const stage = filter === "ALL" ? undefined : (filter as DeviationStage);
  const { data, isLoading, error } = useQuery({
    queryKey: qk.defectItems(filter),
    queryFn: () => getDefectItems(stage),
  });

  const term = search.trim().toLowerCase();
  const filtered = (data ?? []).filter(
    (r) =>
      !term ||
      itemLabel(r.itemId).toLowerCase().includes(term) ||
      (r.reason ?? "").toLowerCase().includes(term),
  );

  return (
    <div>
      <PageHeader title="Defect items" />
      <TableToolbar
        filters={[{
          label: "Stage",
          value: filter,
          onChange: (v) => setFilter(v as (typeof FILTERS)[number]),
          options: FILTERS.map((f) => ({ value: f, label: f.replace(/_/g, " ") })),
        }]}
        search={{ value: search, onChange: setSearch, placeholder: "Search item or reason…" }}
      />

      <DataTable<DeviationItemRow>
        data={filtered}
        loading={isLoading}
        error={error}
        rowKey={(r) => `${r.requestId}:${r.itemId}`}
        empty={<Text c="dimmed" p="md">No defective items.</Text>}
        columns={[
          { header: "Item", render: (r) => itemLabel(r.itemId), emphasis: true },
          { header: "Qty", render: (r) => r.quantity, align: "right" },
          { header: "Reason", render: (r) => r.reason ?? "—" },
          { header: "Raised", render: (r) => dayjs(r.requestedAt).format("MMM D, HH:mm") },
          { header: "Stage", render: (r) => <StatusBadge status={r.stage} /> },
          { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  );
}
