import { useState } from "react";
import { Anchor, Group, SegmentedControl } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useAuth } from "@auth/AuthContext";
import { useItemLabels, useUserLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { AppButton } from "@ui/buttons/AppButton";
import { DataTable } from "@ui/data/DataTable";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { CountAdjustmentRequest, CountAdjustmentStatus } from "@core/types";
import {
  approveCountRequest,
  listCountRequests,
  rejectCountRequest,
} from "./count-requests.api";
import { CountRequestModal } from "./CountRequestModal";

const FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

export function CountRequestsTab() {
  const qc = useQueryClient();
  const { userId } = useAuth();
  const itemLabel = useItemLabels();
  const userLabel = useUserLabels();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("PENDING");
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

  return (
    <>
      <Group justify="space-between" mb="md">
        <SegmentedControl
          value={filter}
          onChange={(v) => setFilter(v as (typeof FILTERS)[number])}
          data={FILTERS.map((f) => ({ value: f, label: f.charAt(0) + f.slice(1).toLowerCase() }))}
        />
        <AppButton label="New count request" onClick={() => setCreating(true)} />
      </Group>

      <DataTable<CountAdjustmentRequest>
        data={data}
        loading={isLoading}
        error={error}
        rowKey={(r) => r.id}
        columns={[
          { header: "Item", render: (r) => itemLabel(r.itemId), emphasis: true },
          { header: "Current", render: (r) => r.currentQuantity, align: "right" },
          { header: "Requested", render: (r) => r.requestedQuantity, align: "right" },
          { header: "Reason", render: (r) => r.reason ?? "—" },
          { header: "By", render: (r) => userLabel(r.requestedByUserId) },
          { header: "Raised", render: (r) => dayjs(r.requestedAt).format("MMM D, HH:mm") },
          { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            header: "",
            align: "right",
            render: (r) =>
              r.status === "PENDING" ? (
                <Group gap="xs" justify="flex-end" wrap="nowrap">
                  <Anchor component="button" type="button" onClick={() => !busy && approve.mutate(r.id)}>
                    Approve
                  </Anchor>
                  <Anchor
                    component="button"
                    type="button"
                    c="red"
                    onClick={() => !busy && reject.mutate(r.id)}
                  >
                    Reject
                  </Anchor>
                </Group>
              ) : null,
          },
        ]}
      />

      <CountRequestModal opened={creating} onClose={() => setCreating(false)} />
    </>
  );
}
