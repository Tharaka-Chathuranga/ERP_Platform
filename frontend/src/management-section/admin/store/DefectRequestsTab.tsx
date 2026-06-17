import { useState } from "react";
import { SegmentedControl, Group } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useUserLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { listDeviations } from "@store/defects/deviations.api";
import { DataTable } from "@ui/data/DataTable";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { DeviationRequest, DeviationStage } from "@core/types";

const STAGES: DeviationStage[] = ["INCOMING", "IN_PROGRESS", "FINAL"];

/** Deviation (defect) request documents, filtered by workflow stage. */
export function DefectRequestsTab() {
  const navigate = useNavigate();
  const userLabel = useUserLabels();
  const [stage, setStage] = useState<DeviationStage>("INCOMING");

  const { data, isLoading, error } = useQuery({
    queryKey: qk.deviations(stage),
    queryFn: () => listDeviations(stage),
  });

  return (
    <>
      <Group mb="md">
        <SegmentedControl
          value={stage}
          onChange={(v) => setStage(v as DeviationStage)}
          data={STAGES.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}
        />
      </Group>

      <DataTable<DeviationRequest>
        data={data}
        loading={isLoading}
        error={error}
        rowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/defects/${r.id}`)}
        columns={[
          { header: "Request", render: (r) => r.id.slice(0, 8), emphasis: true },
          { header: "Items", render: (r) => r.items.length, align: "right" },
          { header: "Reason", render: (r) => r.reason ?? "—" },
          { header: "By", render: (r) => userLabel(r.requestedByUserId) },
          { header: "Raised", render: (r) => dayjs(r.requestedAt).format("MMM D, HH:mm") },
          { header: "Stage", render: (r) => <StatusBadge status={r.stage} /> },
          { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </>
  );
}
