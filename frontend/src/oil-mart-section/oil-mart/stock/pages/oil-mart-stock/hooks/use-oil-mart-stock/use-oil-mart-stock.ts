import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/queryKeys";
import type { OilMartStockBalance } from "@core/types";
import { listOilMartStock, listOilMartStockMovements } from "../../../../api";

export function useOilMartStock() {
  const [search, setSearch] = useState("");
  const [oilType, setOilType] = useState("ALL");
  const [lowOnly, setLowOnly] = useState(false);
  const [selected, setSelected] = useState<OilMartStockBalance | null>(null);

  const query = useQuery({ queryKey: qk.oilMartStock(), queryFn: listOilMartStock });

  const movementsQuery = useQuery({
    queryKey: qk.oilMartMovements(selected?.itemId ?? ""),
    queryFn: () => listOilMartStockMovements(selected!.itemId),
    enabled: Boolean(selected),
  });

  const balances = useMemo(() => {
    const all = query.data ?? [];
    const needle = search.trim().toLowerCase();
    return all.filter((balance) => {
      if (oilType !== "ALL" && balance.oilType !== oilType) return false;
      if (lowOnly && balance.quantityOnHand >= balance.reorderLevelLitres) return false;
      if (!needle) return true;
      return [balance.itemCode, balance.itemName].some((field) =>
        field.toLowerCase().includes(needle),
      );
    });
  }, [query.data, search, oilType, lowOnly]);

  const totals = useMemo(() => {
    const all = query.data ?? [];
    return {
      stockValue: all.reduce((sum, balance) => sum + balance.stockValue, 0),
      lowCount: all.filter((balance) => balance.quantityOnHand < balance.reorderLevelLitres).length,
    };
  }, [query.data]);

  return {
    query,
    balances,
    totals,
    search,
    setSearch,
    oilType,
    setOilType,
    lowOnly,
    setLowOnly,
    selected,
    setSelected,
    movementsQuery,
  };
}
