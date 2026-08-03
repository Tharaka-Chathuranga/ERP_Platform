import { api } from "@core/http/client";
import type { OilMartStockBalance, OilMartStockMovement } from "@core/types";

export async function listOilMartStock(): Promise<OilMartStockBalance[]> {
  const { data } = await api.get<OilMartStockBalance[]>("/oilmart/stock");
  return data;
}

export async function listOilMartStockMovements(itemId: string): Promise<OilMartStockMovement[]> {
  const { data } = await api.get<OilMartStockMovement[]>(`/oilmart/stock/${itemId}/movements`);
  return data;
}

export async function listOilMartLowStock(): Promise<OilMartStockBalance[]> {
  const { data } = await api.get<OilMartStockBalance[]>("/oilmart/stock/low");
  return data;
}
