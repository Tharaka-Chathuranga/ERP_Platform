import { api } from "@core/http/client";
import type { Page, Vehicle } from "@core/types";

export interface VehicleInput {
  vehicleNumber: string;
  name?: string;
  category?: string;
  fullTankCapacityLitres: number;
  description?: string;
  driverUserId?: string;
}

export async function listVehicles(search?: string): Promise<Page<Vehicle>> {
  const { data } = await api.get<Page<Vehicle>>("/fuel/vehicles", {
    params: { search: search || undefined, size: 100, sort: "vehicleNumber" },
  });
  return data;
}

export async function getVehicle(id: string): Promise<Vehicle> {
  const { data } = await api.get<Vehicle>(`/fuel/vehicles/${id}`);
  return data;
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  const { data } = await api.post<Vehicle>("/fuel/vehicles", input);
  return data;
}

export async function updateVehicle(id: string, input: VehicleInput): Promise<Vehicle> {
  const { data } = await api.patch<Vehicle>(`/fuel/vehicles/${id}`, input);
  return data;
}

export async function deactivateVehicle(id: string): Promise<void> {
  await api.delete(`/fuel/vehicles/${id}`);
}
