import { useState } from "react";
import { Anchor, Group } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useAuth } from "@auth/AuthContext";
import { Can } from "@auth/Can";
import { COUNT_APPROVE } from "@auth/permissions";
import { useItemLabels, useUserLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { AppButton } from "@ui/buttons/AppButton";
import { DataTable, TableToolbar } from "@ui/data";
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
                <Can perform={COUNT_APPROVE}>
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
                </Can>
              ) : null,
          },
        ]}
      />

      <CountRequestModal opened={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
