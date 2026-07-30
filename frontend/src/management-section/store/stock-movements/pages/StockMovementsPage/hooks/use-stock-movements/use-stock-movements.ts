import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCriticalItems, useItemCodes } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { listMovements } from "../../../../api";
import {
  computeMovementStats,
  criticalItems,
  inPeriod,
  type Period,
} from "../../../../utils/movementStats";

export function useStockMovements() {
  const itemCode = useItemCodes();
  const isCritical = useCriticalItems();
  const [period, setPeriod] = useState<Period>("week");

  const all = useQuery({ queryKey: qk.allMovements(), queryFn: listMovements });

  const rows = useMemo(() => inPeriod(all.data?.content ?? [], period), [all.data, period]);
  const stats = useMemo(() => computeMovementStats(rows), [rows]);
  const topMoved = stats.byItem.slice(0, 5);
  const topCritical = useMemo(
    () => criticalItems(stats.byItem, isCritical).slice(0, 5),
    [stats.byItem, isCritical],
  );

  const byItemChart = stats.byItem
    .slice(0, 12)
    .map((i) => ({ item: itemCode(i.itemId), In: i.in, Out: i.out }));

  const total = all.data?.totalElements ?? 0;
  const fetched = all.data?.content.length ?? 0;
  const truncated = total > fetched;

  const periodLabel = period === "week" ? "this week" : "this month";

  return {
    itemCode,
    period,
    setPeriod,
    all,
    stats,
    topMoved,
    topCritical,
    byItemChart,
    total,
    fetched,
    truncated,
    periodLabel,
  };
}
