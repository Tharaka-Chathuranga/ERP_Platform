import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useUserLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import type { NonconformityStatus } from "@core/types";
import { listNonconformitiesByStatus } from "../../../../api";

export function useNonconformityReview() {
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

  const term = search.trim().toLowerCase();
  const rows = (data ?? []).filter((d) => {
    if (stageFilter !== "ALL" && d.detectionStage !== stageFilter) return false;
    if (term && !userLabel(d.reportedByUserId).toLowerCase().includes(term) && !(d.description ?? "").toLowerCase().includes(term)) return false;
    return true;
  });

  return {
    navigate,
    search,
    setSearch,
    stageFilter,
    setStageFilter,
    statusFilter,
    setStatusFilter,
    userLabel,
    rows,
    isLoading,
    error,
  };
}
