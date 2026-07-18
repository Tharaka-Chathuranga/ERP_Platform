import { useState } from "react";
import { Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useItemLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { DataTable, TableToolbar } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { PageHeader } from "@ui/layout/PageHeader";
import type { DetectionStage, NonconformityItemRow } from "@core/types";
import { getNonconformityItems } from "../api";

const FILTERS = ["ALL", "INCOMING", "IN_PROGRESS", "FINAL"] as const;

/** Flattened view of every nonconforming item line across all reports. */
export function NonconformityItemsPage() {
  const itemLabel = useItemLabels();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [search, setSearch] = useState("");

  const detectionStage = filter === "ALL" ? undefined : (filter as DetectionStage);
  const { data, isLoading, error } = useQuery({
    queryKey: qk.nonconformityItems(filter),
    queryFn: () => getNonconformityItems(detectionStage),
  });

  const term = search.trim().toLowerCase();
  const filtered = (data ?? []).filter(
    (r) =>
      !term ||
      itemLabel(r.itemId).toLowerCase().includes(term) ||
      (r.description ?? "").toLowerCase().includes(term),
  );

  return (
    <div>
      <PageHeader title="Nonconforming items" />
      <TableToolbar
        filters={[{
          label: "Stage",
          value: filter,
          onChange: (v) => setFilter(v as (typeof FILTERS)[number]),
          options: FILTERS.map((f) => ({ value: f, label: f.replace(/_/g, " ") })),
        }]}
        search={{ value: search, onChange: setSearch, placeholder: "Search item or description…" }}
      />

      <DataTable<NonconformityItemRow>
        data={filtered}
        loading={isLoading}
        error={error}
        rowKey={(r) => `${r.reportId}:${r.itemId}`}
        empty={<Text c="dimmed" p="md">No nonconforming items.</Text>}
        columns={[
          { header: "Item", render: (r) => itemLabel(r.itemId), emphasis: true },
          { header: "Qty", render: (r) => r.quantity, align: "right" },
          { header: "Description", render: (r) => r.description ?? "—" },
          { header: "Raised", render: (r) => dayjs(r.reportedAt).format("MMM D, HH:mm") },
          { header: "Stage", render: (r) => <StatusBadge status={r.detectionStage} /> },
          { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  );
}
