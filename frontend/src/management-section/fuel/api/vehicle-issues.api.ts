import { api } from "@core/http/client";
import type { Page, VehicleFuelIssue } from "@core/types";

export interface CreateVehicleFuelIssueInput {
  vehicleId: string;
  vehicleReadingBeforeIssueLitres: number;
  litresIssued?: number;
  issuingUserId: string;
  receivingUserId: string;
  odometerReadingKm?: number;
}

export interface VehicleIssueFilter {
  date?: string;
  vehicleId?: string;
}

export async function listVehicleIssues(filter: VehicleIssueFilter = {}): Promise<Page<VehicleFuelIssue>> {
  const { data } = await api.get<Page<VehicleFuelIssue>>("/fuel/vehicle-issues", {
    params: { date: filter.date || undefined, vehicleId: filter.vehicleId || undefined, size: 100 },
  });
  return data;
}

export async function createVehicleIssue(input: CreateVehicleFuelIssueInput): Promise<VehicleFuelIssue> {
  const { data } = await api.post<VehicleFuelIssue>("/fuel/vehicle-issues", input);
  return data;
}
