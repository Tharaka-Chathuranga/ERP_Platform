import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@auth/AuthContext";
import { qk } from "@core/queryKeys";
import { useItemCodes } from "@core/hooks/useLookups";
import { getMovementSummary } from "@store/stock-movements";
import { getDashboardSummary, getMovementTrend } from "../../../api";

export function useAdminOverview() {
  const { username } = useAuth();
  const itemCode = useItemCodes();
  const summary = useQuery({ queryKey: qk.adminSummary(), queryFn: getDashboardSummary });
  const trend = useQuery({ queryKey: qk.movementTrend(30), queryFn: () => getMovementTrend(30) });
  const [moverDays, setMoverDays] = useState(30);
  const topMovers = useQuery({ queryKey: qk.movementSummary(moverDays), queryFn: () => getMovementSummary(8, moverDays) });
  const s = summary.data;

  return { username, itemCode, trend, moverDays, setMoverDays, topMovers, s };
}
