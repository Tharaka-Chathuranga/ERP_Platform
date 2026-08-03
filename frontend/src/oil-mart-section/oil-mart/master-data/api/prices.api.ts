import { api } from "@core/http/client";
import type { OilMartItemPrice } from "@core/types";

export interface AddOilMartItemPriceInput {
  buyPrice: number;
  sellPrice: number;
  effectiveFrom: string;
  effectiveTo?: string;
  note?: string;
}

export async function listOilMartItemPrices(itemId: string): Promise<OilMartItemPrice[]> {
  const { data } = await api.get<OilMartItemPrice[]>(`/oilmart/items/${itemId}/prices`);
  return data;
}

export async function addOilMartItemPrice(
  itemId: string,
  input: AddOilMartItemPriceInput,
): Promise<OilMartItemPrice> {
  const { data } = await api.post<OilMartItemPrice>(`/oilmart/items/${itemId}/prices`, input);
  return data;
}

export async function getEffectiveOilMartPrice(
  itemId: string,
  on: string,
): Promise<OilMartItemPrice | null> {
  const { data } = await api.get<OilMartItemPrice | null>(`/oilmart/items/${itemId}/price`, {
    params: { on },
  });
  return data;
}
