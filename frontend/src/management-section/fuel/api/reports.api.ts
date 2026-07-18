import { api } from "@core/http/client";
import type { FuelOverview, VehicleEfficiencyReport } from "@core/types";

export async function getFuelOverview(): Promise<FuelOverview> {
  const { data } = await api.get<FuelOverview>("/fuel/overview");
  return data;
}

export async function getEfficiencyReport(from: string, to: string, vehicleId?: string): Promise<VehicleEfficiencyReport[]> {
  const { data } = await api.get<VehicleEfficiencyReport[]>("/fuel/vehicle-issues/efficiency-report", {
    params: { from, to, vehicleId: vehicleId && vehicleId !== "ALL" ? vehicleId : undefined },
  });
  return data;
}
