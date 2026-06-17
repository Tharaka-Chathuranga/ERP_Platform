import { api } from "@core/http/client";
import type { ItemMovementSummary, Page, StockMovement } from "@core/types";

/**
 * How many movements the stats screen pulls in one shot. The dashboard derives
 * its KPIs, charts and top-item lists client-side from this slice, so it asks
 * for a large page; if the ledger ever outgrows it we surface a "latest N of M"
 * note rather than silently under-counting. (True server-side aggregation is
 * the later backend step.)
 */
export const MOVEMENTS_PAGE_SIZE = 1000;

/** All stock movements across every item, newest first. */
export async function listMovements(): Promise<Page<StockMovement>> {
  const { data } = await api.get<Page<StockMovement>>("/store/movements", {
    params: { size: MOVEMENTS_PAGE_SIZE },
  });
  return data;
}

/** Received vs issued totals per item, busiest first. */
export async function getMovementSummary(limit = 12): Promise<ItemMovementSummary[]> {
  const { data } = await api.get<ItemMovementSummary[]>("/store/movements/summary", {
    params: { limit },
  });
  return data;
}
