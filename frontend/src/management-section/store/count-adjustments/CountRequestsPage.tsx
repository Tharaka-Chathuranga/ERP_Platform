import { useState } from "react";
import { Button, Group, Text } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useAuth } from "@auth/AuthContext";
import { useCan } from "@auth/useCan";
import { COUNT_APPROVE } from "@auth/permissions";
import { useItemLabels, useUserLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { AppButton } from "@ui/buttons/AppButton";
import { DataTable, TableToolbar, type Column } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { PageHeader } from "@ui/layout/PageHeader";
import type { CountAdjustmentRequest, CountAdjustmentStatus } from "@core/types";
import {
  approveCountRequest,
  listCountRequests,
  rejectCountRequest,
} from "./count-requests.api";
import { CountRequestModal } from "./CountRequestModal";

const FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

/** Stock count-adjustment requests. Both roles can raise/view; only users with
 *  `count:approve` see the approve/reject actions. */
export function CountRequestsPage() {
  const qc = useQueryClient();
  const { userId } = useAuth();
  const canApprove = useCan()(COUNT_APPROVE);
  const itemLabel = useItemLabels();
  const userLabel = useUserLabels();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("PENDING");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const status = filter === "ALL" ? undefined : (filter as CountAdjustmentStatus);
  const { data, isLoading, error } = useQuery({
    queryKey: qk.countRequests(filter),
    queryFn: () => listCountRequests(status),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.countRequests() });
    qc.invalidateQueries({ queryKey: qk.adminSummary() });
    qc.invalidateQueries({ queryKey: qk.lowStock() });
    qc.invalidateQueries({ queryKey: ["items"] });
  };

  const approve = useMutation({
    mutationFn: (id: string) => approveCountRequest(id, userId!),
    onSuccess: () => {
      notifySuccess("Request approved & stock adjusted");
      invalidate();
    },
    onError: notifyError,
  });

  const reject = useMutation({
    mutationFn: (id: string) => rejectCountRequest(id, userId!),
    onSuccess: () => {
      notifySuccess("Request rejected");
      invalidate();
    },
    onError: notifyError,
  });

  const busy = approve.isPending || reject.isPending;

  const term = search.trim().toLowerCase();
  const filtered = (data ?? []).filter(
    (r) =>
      !term ||
      itemLabel(r.itemId).toLowerCase().includes(term) ||
      userLabel(r.requestedByUserId).toLowerCase().includes(term) ||
      (r.reason ?? "").toLowerCase().includes(term),
  );

  const columns: Column<CountAdjustmentRequest>[] = [
    { header: "Item", render: (r) => itemLabel(r.itemId), emphasis: true },
    { header: "Current", render: (r) => r.currentQuantity, align: "right" },
    { header: "Requested", render: (r) => r.requestedQuantity, align: "right" },
    { header: "Reason", render: (r) => r.reason ?? "—" },
    { header: "By", render: (r) => userLabel(r.requestedByUserId) },
    { header: "Raised", render: (r) => dayjs(r.requestedAt).format("MMM D, HH:mm") },
    { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  if (canApprove) {
    columns.push({
      header: "Actions",
      align: "right",
      render: (r) =>
        r.status === "PENDING" ? (
          <Group gap="xs" justify="flex-end" wrap="nowrap">
            <Button size="xs" variant="light" color="green" leftSection={<IconCheck size={14} />} styles={{ root: { paddingInline: 8, paddingBlock: 1 }, section: { marginInlineEnd: 2 } }} onClick={() => !busy && approve.mutate(r.id)}>
              Approve
            </Button>
            <Button size="xs" variant="light" color="red" leftSection={<IconX size={14} />} styles={{ root: { paddingInline: 8, paddingBlock: 1 }, section: { marginInlineEnd: 2 } }} onClick={() => !busy && reject.mutate(r.id)}>
              Reject
            </Button>
          </Group>
        ) : (
          <Text size="xs" c="dimmed">Already taken</Text>
        ),
    });
  }

  return (
    <div>
      <PageHeader title="Count requests" />

      <TableToolbar
        filters={[{
          label: "Status",
          value: filter,
          onChange: (v) => setFilter(v as (typeof FILTERS)[number]),
          options: FILTERS.map((f) => ({ value: f, label: f.charAt(0) + f.slice(1).toLowerCase() })),
        }]}
        search={{ value: search, onChange: setSearch, placeholder: "Search item, user or reason…" }}
        actions={<AppButton label="New count request" onClick={() => setCreating(true)} />}
      />

      <DataTable<CountAdjustmentRequest>
        data={filtered}
        loading={isLoading}
        error={error}
        rowKey={(r) => r.id}
        columns={columns}
      />

      <CountRequestModal opened={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
