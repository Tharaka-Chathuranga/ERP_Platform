import dayjs from "dayjs";
import type { Column } from "@ui/data";
import type { VehicleFuelIssue } from "@core/types";

interface VehicleIssuesColumnsOptions {
  vehicleNumber: (id: string) => string;
  userName: (id: string) => string;
  kmPerLitreById: Map<string, number>;
}

export function buildVehicleIssuesColumns({
  vehicleNumber,
  userName,
  kmPerLitreById,
}: VehicleIssuesColumnsOptions): Column<VehicleFuelIssue>[] {
  return [
    { header: "Issued at", render: (i) => dayjs(i.issuedAt).format("MMM D, YYYY HH:mm") },
    { header: "Vehicle", emphasis: true, render: (i) => vehicleNumber(i.vehicleId) },
    { header: "Before (L)", align: "right", render: (i) => i.vehicleReadingBeforeIssueLitres },
    { header: "Issued (L)", align: "right", render: (i) => i.litresIssued },
    { header: "Odometer (km)", align: "right", render: (i) => i.odometerReadingKm != null ? i.odometerReadingKm.toLocaleString() : "—" },
    { header: "km / L", align: "right", render: (i) => { const v = kmPerLitreById.get(i.id); return v != null ? v.toFixed(2) : "—"; } },
    { header: "Issued by", render: (i) => userName(i.issuingUserId) },
    { header: "Received by", render: (i) => userName(i.receivingUserId) },
  ];
}
