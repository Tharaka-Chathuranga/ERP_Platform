import { api } from "@core/http/client";
import type {
  FuelOverview,
  FuelPrice,
  FuelTank,
  FuelTankReading,
  FuelTankRefill,
  Page,
  Vehicle,
  VehicleEfficiencyReport,
  VehicleFuelIssue,
} from "@core/types";

// ── Fuel REST contract. Mirrors the backend /api/fuel/* endpoints. ──

// Tanks -------------------------------------------------------------

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

// Refills -----------------------------------------------------------

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

// Readings ----------------------------------------------------------

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

// Vehicles ----------------------------------------------------------

export interface VehicleInput {
  vehicleNumber: string;
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

// Vehicle fuel issues ----------------------------------------------

export interface CreateVehicleFuelIssueInput {
  vehicleId: string;
  vehicleReadingBeforeIssueLitres: number;
  /** Omit to fill the tank fully (capacity − current reading). */
  litresIssued?: number;
  issuingUserId: string;
  receivingUserId: string;
  /** Current odometer reading in km. Optional — enables km/L reporting when provided. */
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

// Prices ------------------------------------------------------------

export interface CreateFuelPriceInput {
  unitPrice: number;
  effectiveFrom: string;
  effectiveTo: string;
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

// Overview ----------------------------------------------------------

export async function getFuelOverview(): Promise<FuelOverview> {
  const { data } = await api.get<FuelOverview>("/fuel/overview");
  return data;
}

// Efficiency report (admin only) ------------------------------------

export async function getEfficiencyReport(from: string, to: string, vehicleId?: string): Promise<VehicleEfficiencyReport[]> {
  const { data } = await api.get<VehicleEfficiencyReport[]>("/fuel/vehicle-issues/efficiency-report", {
    params: { from, to, vehicleId: vehicleId && vehicleId !== "ALL" ? vehicleId : undefined },
  });
  return data;
}
