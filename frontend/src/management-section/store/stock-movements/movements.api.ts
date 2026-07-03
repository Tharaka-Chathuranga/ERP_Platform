import { api } from "@core/http/client";
import type { ItemMovementSummary, Page, StockMovement } from "@core/types";

export const MOVEMENTS_PAGE_SIZE = 1000;

export async function listMovements(): Promise<Page<StockMovement>> {
  const { data } = await api.get<Page<StockMovement>>("/store/movements", {
    params: { size: MOVEMENTS_PAGE_SIZE },
  });
  return data;
}

export async function getMovementSummary(limit = 12, days = 30): Promise<ItemMovementSummary[]> {
  const { data } = await api.get<ItemMovementSummary[]>("/store/movements/summary", {
    params: { limit, days },
  });
  return data;
}
