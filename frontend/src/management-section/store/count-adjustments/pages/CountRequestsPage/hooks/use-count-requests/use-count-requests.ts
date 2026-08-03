import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@auth/AuthContext";
import { useCan } from "@auth/useCan";
import { COUNT_APPROVE } from "@auth/permissions";
import { useItemLabels, useUserLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { CountAdjustmentStatus } from "@core/types";
import {
  approveCountRequest,
  listCountRequests,
  rejectCountRequest,
} from "../../../../api";

export const COUNT_REQUEST_FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

export function useCountRequests() {
  const qc = useQueryClient();
  const { userId } = useAuth();
  const canApprove = useCan()(COUNT_APPROVE);
  const itemLabel = useItemLabels();
  const userLabel = useUserLabels();
  const [filter, setFilter] = useState<(typeof COUNT_REQUEST_FILTERS)[number]>("PENDING");
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

  return {
    filter,
    setFilter,
    search,
    setSearch,
    creating,
    setCreating,
    isLoading,
    error,
    itemLabel,
    userLabel,
    canApprove,
    busy,
    filtered,
    onApprove: approve.mutate,
    onReject: reject.mutate,
  };
}
