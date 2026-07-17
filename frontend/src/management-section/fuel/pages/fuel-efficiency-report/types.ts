export interface SummaryRow {
  vehicleId: string;
  vehicleNumber: string;
  driverUserId: string;
  avgKmPerLitre: number;
  totalKm: number;
  totalLitres: number;
  readings: number;
}

export type FlagTone = "high" | "improved";

export interface FlagRow {
  vehicleId: string;
  vehicleNumber: string;
  driverUserId: string;
  type: "sharp-drop" | "below-average" | "sharp-gain" | "above-average";
  currentKmL: number;
  referenceKmL: number;
  changePct: number;
}
