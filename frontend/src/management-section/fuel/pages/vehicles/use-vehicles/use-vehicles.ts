import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUsers } from "@core/hooks/useUsers";
import { qk } from "@core/queryKeys";
import { listVehicles } from "../../../api";

export function useVehicles() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const vehicles = useQuery({
    queryKey: qk.vehicles(search || undefined),
    queryFn: () => listVehicles(search || undefined),
  });
  const users = useUsers();

  const userName = useMemo(() => {
    const map = new Map(users.data?.map((u) => [u.id, u.displayName || u.username]));
    return (id?: string) => (id ? map.get(id) ?? "—" : "—");
  }, [users.data]);

  const filteredVehicles = useMemo(() => {
    const all = vehicles.data?.content ?? [];
    if (statusFilter === "ALL") return all;
    return all.filter((v) => v.status === statusFilter);
  }, [vehicles.data, statusFilter]);

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    query: vehicles,
    filteredVehicles,
    userName,
  };
}
