import { api } from "@core/http/client";
import type { OilMartItem, OilMartItemStatus, OilType } from "@core/types";

export interface SaveOilMartItemInput {
  code: string;
  name: string;
  oilType: OilType;
  brand?: string;
  grade?: string;
  description?: string;
  reorderLevelLitres: number;
  status: OilMartItemStatus;
}

export async function listOilMartItems(search?: string): Promise<OilMartItem[]> {
  const { data } = await api.get<OilMartItem[]>("/oilmart/items", {
    params: { search: search || undefined },
  });
  return data;
}

export async function getOilMartItem(itemId: string): Promise<OilMartItem> {
  const { data } = await api.get<OilMartItem>(`/oilmart/items/${itemId}`);
  return data;
}

export async function createOilMartItem(input: SaveOilMartItemInput): Promise<OilMartItem> {
  const { data } = await api.post<OilMartItem>("/oilmart/items", input);
  return data;
}

export async function updateOilMartItem(
  itemId: string,
  input: SaveOilMartItemInput,
): Promise<OilMartItem> {
  const { data } = await api.put<OilMartItem>(`/oilmart/items/${itemId}`, input);
  return data;
}
