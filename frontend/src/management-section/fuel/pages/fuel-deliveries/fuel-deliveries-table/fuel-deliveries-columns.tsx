import dayjs from "dayjs";
import type { Column } from "@ui/data";
import type { FuelDelivery } from "@core/types";
import { Variance } from "../variance";

interface FuelDeliveriesColumnsOptions {
  tankName: (id: string) => string;
  userName: (id: string) => string;
}

export function buildFuelDeliveriesColumns({
  tankName,
  userName,
}: FuelDeliveriesColumnsOptions): Column<FuelDelivery>[] {
  return [
    { header: "Date", render: (d) => dayjs(d.deliveredOn).format("MMM D, YYYY") },
    { header: "Reference", emphasis: true, render: (d) => d.deliveryReference },
    { header: "Supplier", render: (d) => d.supplierName ?? "—" },
    { header: "Ordered (L)", align: "right", render: (d) => d.orderedLitres.toLocaleString() },
    { header: "Delivered (L)", align: "right", render: (d) => d.deliveredLitres.toLocaleString() },
    { header: "Variance (L)", align: "right", render: (d) => <Variance value={d.orderedVsDeliveredVariance} /> },
    { header: "Tanks", render: (d) => d.lines.map((l) => tankName(l.tankId)).join(", ") },
    { header: "Recorded by", render: (d) => userName(d.recordedByUserId) },
  ];
}
