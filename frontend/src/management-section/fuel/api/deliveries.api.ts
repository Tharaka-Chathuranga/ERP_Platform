import { api } from "@core/http/client";
import type { FuelDelivery, Page } from "@core/types";

export interface FuelDeliveryLineInput {
  tankId: string;
  litresDelivered: number;
  dipBeforeLitres?: number;
  dipAfterLitres?: number;
}

export interface RecordFuelDeliveryInput {
  supplierName?: string;
  orderedLitres: number;
  deliveredOn: string;
  dischargeStartedAt?: string;
  dischargeFinishedAt?: string;
  recordedByUserId: string;
  note?: string;
  lines: FuelDeliveryLineInput[];
}

export async function recordFuelDelivery(input: RecordFuelDeliveryInput): Promise<FuelDelivery> {
  const { data } = await api.post<FuelDelivery>("/fuel/deliveries", input);
  return data;
}

export async function listFuelDeliveries(date?: string): Promise<Page<FuelDelivery>> {
  const { data } = await api.get<Page<FuelDelivery>>("/fuel/deliveries", {
    params: { date: date || undefined, size: 100 },
  });
  return data;
}

export async function getFuelDelivery(id: string): Promise<FuelDelivery> {
  const { data } = await api.get<FuelDelivery>(`/fuel/deliveries/${id}`);
  return data;
}
