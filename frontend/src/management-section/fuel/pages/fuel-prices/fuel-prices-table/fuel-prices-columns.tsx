import { Badge } from "@mantine/core";
import dayjs from "dayjs";
import type { Column } from "@ui/data";
import type { FuelPrice } from "@core/types";

function isCurrent(price: FuelPrice): boolean {
  const today = dayjs();
  if (today.isBefore(dayjs(price.effectiveFrom))) return false;
  return !price.effectiveTo || !today.isAfter(dayjs(price.effectiveTo));
}

export function buildFuelPricesColumns(): Column<FuelPrice>[] {
  return [
    { header: "Unit price", emphasis: true, render: (p) => p.unitPrice },
    { header: "Effective from", render: (p) => dayjs(p.effectiveFrom).format("MMM D, YYYY") },
    { header: "Effective to", render: (p) => (p.effectiveTo ? dayjs(p.effectiveTo).format("MMM D, YYYY") : "Current") },
    {
      header: "",
      render: (p) => (isCurrent(p) ? <Badge color="teal" variant="light" radius="sm">Current</Badge> : null),
    },
    { header: "Note", render: (p) => p.note ?? "—" },
  ];
}
