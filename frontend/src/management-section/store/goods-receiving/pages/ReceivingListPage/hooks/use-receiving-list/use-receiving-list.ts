import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/queryKeys";
import { listReceivals } from "../../../../api";
import { listSuppliers } from "@store/inventory";

export function useReceivingList() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: qk.receivals(),
    queryFn: () => listReceivals(),
  });
  const suppliers = useQuery({ queryKey: qk.suppliers(), queryFn: listSuppliers });

  const supplierName = useMemo(() => {
    const map = new Map(suppliers.data?.map((s) => [s.id, `${s.code} — ${s.name}`]));
    return (id?: string, name?: string) => (id ? map.get(id) ?? id.slice(0, 8) : name ?? "—");
  }, [suppliers.data]);

  const term = search.trim().toLowerCase();
  const rows = (data?.content ?? []).filter(
    (r) =>
      r.receivalNumber.toLowerCase().includes(term) ||
      supplierName(r.supplierId, r.supplierName).toLowerCase().includes(term),
  );

  return { search, setSearch, isLoading, error, supplierName, rows };
}
