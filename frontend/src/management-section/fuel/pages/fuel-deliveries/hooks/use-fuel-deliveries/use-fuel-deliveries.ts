import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useUsers } from "@core/hooks/useUsers";
import { qk } from "@core/queryKeys";
import type { FuelDelivery } from "@core/types";
import { listFuelDeliveries, listTanks } from "../../../../api";

export function useFuelDeliveries() {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [detail, setDetail] = useState<FuelDelivery | undefined>();

  const query = useQuery({
    queryKey: qk.fuelDeliveries(),
    queryFn: () => listFuelDeliveries(),
  });
  const tanks = useQuery({ queryKey: qk.fuelTanks(), queryFn: listTanks });
  const users = useUsers();

  const tankName = useMemo(() => {
    const map = new Map((tanks.data ?? []).map((t) => [t.id, t.name]));
    return (id: string) => map.get(id) ?? "—";
  }, [tanks.data]);

  const userName = useMemo(() => {
    const map = new Map(users.data?.map((u) => [u.id, u.displayName || u.username]));
    return (id: string) => map.get(id) ?? "—";
  }, [users.data]);

  const filtered = useMemo(() => {
    const all = query.data?.content ?? [];
    const [from, to] = dateRange;
    const q = search.trim().toLowerCase();
    return all.filter((d) => {
      const on = dayjs(d.deliveredOn);
      if (from && on.isBefore(dayjs(from).startOf("day"))) return false;
      if (to && on.isAfter(dayjs(to).endOf("day"))) return false;
      if (q) {
        const ref = d.deliveryReference.toLowerCase();
        const supplier = (d.supplierName ?? "").toLowerCase();
        if (!ref.includes(q) && !supplier.includes(q)) return false;
      }
      return true;
    });
  }, [query.data, dateRange, search]);

  return {
    query,
    filtered,
    tankName,
    userName,
    search,
    setSearch,
    dateRange,
    setDateRange,
    detail,
    setDetail,
  };
}
