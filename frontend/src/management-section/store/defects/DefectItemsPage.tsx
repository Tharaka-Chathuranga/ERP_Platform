import { useState } from "react";
import { Group, SegmentedControl, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useItemLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { DataTable } from "@ui/data/DataTable";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { PageHeader } from "@ui/layout/PageHeader";
import type { DeviationItemRow, DeviationStage } from "@core/types";
import { getDefectItems } from "./deviations.api";

const FILTERS = ["ALL", "INCOMING", "IN_PROGRESS", "FINAL"] as const;

/** Flattened view of every defective item line across all deviation requests. */
export function DefectItemsPage() {
  const itemLabel = useItemLabels();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");

  const stage = filter === "ALL" ? undefined : (filter as DeviationStage);
  const { data, isLoading, error } = useQuery({
    queryKey: qk.defectItems(filter),
    queryFn: () => getDefectItems(stage),
  });

  return (
    <div>
      <PageHeader title="Defect items" />
      <Group mb="md">
        <SegmentedControl
          value={filter}
          onChange={(v) => setFilter(v as (typeof FILTERS)[number])}
          data={FILTERS.map((f) => ({ value: f, label: f.replace(/_/g, " ") }))}
        />
      </Group>

      <DataTable<DeviationItemRow>
        data={data}
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
