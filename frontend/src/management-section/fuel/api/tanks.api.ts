import { api } from "@core/http/client";
import type { FuelTank, FuelTankReading, FuelTankRefill } from "@core/types";

export async function listTanks(): Promise<FuelTank[]> {
  const { data } = await api.get<FuelTank[]>("/fuel/tanks");
  return data;
}

export interface UpdateTankInput {
  name: string;
  capacityLitres: number;
}

export async function updateTank(id: string, input: UpdateTankInput): Promise<FuelTank> {
  const { data } = await api.patch<FuelTank>(`/fuel/tanks/${id}`, input);
  return data;
}

export interface RecordRefillInput {
  litres: number;
  recordedByUserId: string;
  note?: string;
}

export async function recordRefill(tankId: string, input: RecordRefillInput): Promise<FuelTankRefill> {
  const { data } = await api.post<FuelTankRefill>(`/fuel/tanks/${tankId}/refills`, input);
  return data;
}

export async function listRefills(tankId: string): Promise<FuelTankRefill[]> {
  const { data } = await api.get<FuelTankRefill[]>(`/fuel/tanks/${tankId}/refills`);
  return data;
}

export interface RecordReadingInput {
  litresMeasured: number;
  recordedByUserId: string;
  note?: string;
}

export async function recordReading(tankId: string, input: RecordReadingInput): Promise<FuelTankReading> {
  const { data } = await api.post<FuelTankReading>(`/fuel/tanks/${tankId}/readings`, input);
  return data;
}

export async function listReadings(tankId: string): Promise<FuelTankReading[]> {
  const { data } = await api.get<FuelTankReading[]>(`/fuel/tanks/${tankId}/readings`);
  return data;
}
