import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { qk } from "@core/queryKeys";
import { listFuelPrices } from "../../../../api";

export function useFuelPrices() {
  const [addOpen, setAddOpen] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const query = useQuery({ queryKey: qk.fuelPrices(), queryFn: listFuelPrices });

  const filteredPrices = useMemo(() => {
    const all = query.data ?? [];
    const [from, to] = dateRange;
    if (!from && !to) return all;
    return all.filter((p) => {
      const effectiveFrom = dayjs(p.effectiveFrom);
      if (from && p.effectiveTo && dayjs(p.effectiveTo).isBefore(dayjs(from).startOf("day"))) return false;
      if (to && effectiveFrom.isAfter(dayjs(to).endOf("day"))) return false;
      return true;
    });
  }, [query.data, dateRange]);

  return { query, filteredPrices, dateRange, setDateRange, addOpen, setAddOpen };
}
