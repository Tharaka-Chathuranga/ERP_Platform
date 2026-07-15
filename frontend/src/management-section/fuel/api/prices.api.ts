import { api } from "@core/http/client";
import type { FuelPrice } from "@core/types";

export interface CreateFuelPriceInput {
  unitPrice: number;
  effectiveFrom: string;
  effectiveTo?: string;
  recordedByUserId: string;
  note?: string;
}

export async function listFuelPrices(): Promise<FuelPrice[]> {
  const { data } = await api.get<FuelPrice[]>("/fuel/prices");
  return data;
}

export async function addFuelPrice(input: CreateFuelPriceInput): Promise<FuelPrice> {
  const { data } = await api.post<FuelPrice>("/fuel/prices", input);
  return data;
}
