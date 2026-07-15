import { useState } from "react";
import { Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DataTable, TableToolbar, type Column } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { PageHeader } from "@ui/layout/PageHeader";
import { useUserLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import type { DeviationRequest } from "@core/types";
import { listDeviationsByStatus } from "../api";

export function QualityAssuranceDefectReviewPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const userLabel = useUserLabels();

  const status = statusFilter === "ALL" ? undefined : statusFilter as "PENDING" | "APPROVED" | "REJECTED";
  const { data, isLoading, error } = useQuery({
    queryKey: qk.deviationsByStatus(statusFilter),
    queryFn: () => listDeviationsByStatus(status),
  });

  const STAGE_OPTIONS = [
    { label: "All stages", value: "ALL" },
    { label: "Incoming", value: "INCOMING" },
    { label: "In progress", value: "IN_PROGRESS" },
    { label: "Final", value: "FINAL" },
  ];

  const STATUS_OPTIONS = [
    { label: "All statuses", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  const term = search.trim().toLowerCase();
  const rows = (data ?? []).filter((d) => {
    if (stageFilter !== "ALL" && d.stage !== stageFilter) return false;
    if (term && !userLabel(d.requestedByUserId).toLowerCase().includes(term) && !(d.reason ?? "").toLowerCase().includes(term)) return false;
    return true;
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

      <TableToolbar
        filters={[
          { label: "Status", value: statusFilter, onChange: setStatusFilter, options: STATUS_OPTIONS },
          { label: "Stage", value: stageFilter, onChange: setStageFilter, options: STAGE_OPTIONS },
        ]}
        search={{ value: search, onChange: setSearch, placeholder: "Search reporter or reason…" }}
      />

      <DataTable<DeviationRequest>
        data={rows}
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
