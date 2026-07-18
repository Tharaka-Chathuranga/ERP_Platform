import { useState } from "react";
import { Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DataTable, TableToolbar, type Column } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { PageHeader } from "@ui/layout/PageHeader";
import { useUserLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import type { NonconformityReport, NonconformityStatus } from "@core/types";
import { listNonconformitiesByStatus } from "../api";

export function QualityAssuranceNonconformityReviewPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("RAISED");
  const userLabel = useUserLabels();

  const status = statusFilter === "ALL" ? undefined : (statusFilter as NonconformityStatus);
  const { data, isLoading, error } = useQuery({
    queryKey: qk.nonconformitiesByStatus(statusFilter),
    queryFn: () => listNonconformitiesByStatus(status),
  });

  const STAGE_OPTIONS = [
    { label: "All stages", value: "ALL" },
    { label: "Incoming", value: "INCOMING" },
    { label: "In progress", value: "IN_PROGRESS" },
    { label: "Final", value: "FINAL" },
  ];

  const STATUS_OPTIONS = [
    { label: "All statuses", value: "ALL" },
    { label: "Raised", value: "RAISED" },
    { label: "Under review", value: "UNDER_REVIEW" },
    { label: "Dispositioned", value: "DISPOSITIONED" },
    { label: "Rejected", value: "REJECTED" },
    { label: "Closed", value: "CLOSED" },
  ];

  const term = search.trim().toLowerCase();
  const rows = (data ?? []).filter((d) => {
    if (stageFilter !== "ALL" && d.detectionStage !== stageFilter) return false;
    if (term && !userLabel(d.reportedByUserId).toLowerCase().includes(term) && !(d.description ?? "").toLowerCase().includes(term)) return false;
    return true;
  });

  const columns: Column<NonconformityReport>[] = [
    { header: "Reported by", emphasis: true, render: (d) => userLabel(d.reportedByUserId) },
    { header: "Description", render: (d) => d.description || "—" },
    { header: "Items", align: "right", render: (d) => d.items.length },
    { header: "Raised", render: (d) => new Date(d.reportedAt).toLocaleDateString() },
    { header: "Stage", render: (d) => <StatusBadge status={d.detectionStage} /> },
    { header: "Status", render: (d) => <StatusBadge status={d.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Nonconformity review" />

      <TableToolbar
        filters={[
          { label: "Status", value: statusFilter, onChange: setStatusFilter, options: STATUS_OPTIONS },
          { label: "Stage", value: stageFilter, onChange: setStageFilter, options: STAGE_OPTIONS },
        ]}
        search={{ value: search, onChange: setSearch, placeholder: "Search reporter or description…" }}
      />

      <DataTable<NonconformityReport>
        data={rows}
        loading={isLoading}
        error={error}
        rowKey={(d) => d.id}
        onRowClick={(d) => navigate(`/nonconformities/${d.id}`)}
        empty={
          <Text c="dimmed" p="md">
            No nonconformity reports match this filter.
          </Text>
        }
        columns={columns}
      />
    </div>
  );
}
