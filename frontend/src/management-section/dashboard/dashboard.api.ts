import { api } from "@core/http/client";
import type { DashboardSummary, MovementTrendPoint } from "@core/types";

// ── Admin dashboard read-side. Mirrors /api/store/dashboard/*. ──

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>("/store/dashboard/summary");
  return data;
}

export async function getMovementTrend(days = 30): Promise<MovementTrendPoint[]> {
  const { data } = await api.get<MovementTrendPoint[]>("/store/dashboard/movement-trend", {
    params: { days },
  });
  return data;
}
