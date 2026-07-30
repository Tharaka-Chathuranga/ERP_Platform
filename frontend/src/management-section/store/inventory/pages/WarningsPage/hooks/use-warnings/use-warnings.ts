import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/queryKeys";
import { getLowStockItems } from "../../../../api";

export function useWarnings() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: qk.lowStock(),
    queryFn: getLowStockItems,
  });

  const term = search.trim().toLowerCase();
  const rows = (data ?? []).filter(
    (r) => r.itemCode.toLowerCase().includes(term) || r.name.toLowerCase().includes(term),
  );

  return { search, setSearch, isLoading, error, rows };
}
