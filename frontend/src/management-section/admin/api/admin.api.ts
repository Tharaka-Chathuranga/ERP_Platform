import { api } from "@core/http/client";
import type {
  DashboardSummary,
  MovementTrendPoint,
  StockHealth,
  TodayIssueRow,
  TodayReceivalRow,
} from "@core/types";

// ── Admin analytics read-side. Mirrors /api/store/dashboard/*. ──

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

export async function getTodayReceivals(): Promise<TodayReceivalRow[]> {
  const { data } = await api.get<TodayReceivalRow[]>("/store/dashboard/today-receivals");
  return data;
}

export async function getTodayIssues(): Promise<TodayIssueRow[]> {
  const { data } = await api.get<TodayIssueRow[]>("/store/dashboard/today-issues");
  return data;
}

export async function getStockHealth(): Promise<StockHealth> {
  const { data } = await api.get<StockHealth>("/store/dashboard/stock-health");
  return data;
}
