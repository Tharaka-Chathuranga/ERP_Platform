import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/queryKeys";
import { listUsers } from "../../../../api";

export function useUserList() {
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");

  const { data, isLoading, error } = useQuery({
    queryKey: qk.adminUsers(),
    queryFn: listUsers,
  });

  const deptOptions = useMemo(() => {
    const depts = Array.from(
      new Set((data ?? []).map((u) => u.department).filter(Boolean) as string[]),
    ).sort();
    return [
      { label: "All departments", value: "ALL" },
      ...depts.map((d) => ({ label: d, value: d })),
    ];
  }, [data]);

  const term = search.trim().toLowerCase();
  const rows = (data ?? []).filter((r) => {
    if (term && !r.username.toLowerCase().includes(term) && !(r.displayName ?? "").toLowerCase().includes(term)) return false;
    if (roleFilter !== "ALL" && r.role !== roleFilter) return false;
    if (statusFilter === "ACTIVE" && !r.enabled) return false;
    if (statusFilter === "INACTIVE" && r.enabled) return false;
    if (deptFilter !== "ALL" && r.department !== deptFilter) return false;
    return true;
  });

  return {
    creating,
    setCreating,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    deptFilter,
    setDeptFilter,
    deptOptions,
    isLoading,
    error,
    rows,
  };
}
