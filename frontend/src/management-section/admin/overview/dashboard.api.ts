import { api } from "@core/http/client";
import type {
  DashboardSummary,
  DeviationItemRow,
  DeviationStage,
  LowStockItem,
  MovementTrendPoint,
} from "@core/types";

// ── Admin dashboard read-side. Mirrors /api/store/dashboard/*. ──

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>("/store/dashboard/summary");
  return data;
}

export async function getLowStockItems(): Promise<LowStockItem[]> {
  const { data } = await api.get<LowStockItem[]>("/store/dashboard/low-stock");
  return data;
}

export async function getMovementTrend(days = 30): Promise<MovementTrendPoint[]> {
  const { data } = await api.get<MovementTrendPoint[]>("/store/dashboard/movement-trend", {
    params: { days },
  });
  return data;
}

export async function getDefectItems(stage?: DeviationStage): Promise<DeviationItemRow[]> {
  const { data } = await api.get<DeviationItemRow[]>("/store/dashboard/defect-items", {
    params: { stage: stage || undefined },
  });
  return data;
}
