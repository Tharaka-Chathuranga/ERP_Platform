import { Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DataTable, type Column } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { PageHeader } from "@ui/layout/PageHeader";
import { useUserLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import type { DeviationRequest } from "@core/types";
import { listDeviationsByStatus } from "./qa.api";

export function QualityAssuranceDefectReviewPage() {
  const navigate = useNavigate();
  const userLabel = useUserLabels();

  const { data, isLoading, error } = useQuery({
    queryKey: qk.deviationsByStatus("PENDING"),
    queryFn: () => listDeviationsByStatus("PENDING"),
  });

  const columns: Column<DeviationRequest>[] = [
    { header: "Reported by", emphasis: true, render: (d) => userLabel(d.requestedByUserId) },
    { header: "Reason", render: (d) => d.reason || "—" },
    { header: "Items", align: "right", render: (d) => d.items.length },
    {
      header: "Raised",
      render: (d) => new Date(d.requestedAt).toLocaleDateString(),
    },
    { header: "Stage", render: (d) => <StatusBadge status={d.stage} /> },
    { header: "Status", render: (d) => <StatusBadge status={d.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Defect review" />

      <DataTable<DeviationRequest>
        data={data}
        loading={isLoading}
        error={error}
        rowKey={(d) => d.id}
        onRowClick={(d) => navigate(`/defects/${d.id}`)}
        empty={
          <Text c="dimmed" p="md">
            No defect reports awaiting review.
          </Text>
        }
        columns={columns}
      />
    </div>
  );
}
