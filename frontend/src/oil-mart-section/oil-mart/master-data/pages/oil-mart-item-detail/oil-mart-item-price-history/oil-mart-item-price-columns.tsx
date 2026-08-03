import { Badge } from "@mantine/core";
import dayjs from "dayjs";
import type { Column } from "@ui/data";
import type { OilMartItemPrice } from "@core/types";
import { MoneyText } from "../../../../components/money-text";

function isCurrent(price: OilMartItemPrice): boolean {
  const today = dayjs().format("YYYY-MM-DD");
  if (price.effectiveFrom > today) return false;
  return !price.effectiveTo || price.effectiveTo >= today;
}

export function buildOilMartItemPriceColumns(): Column<OilMartItemPrice>[] {
  return [
    {
      header: "Effective from",
      emphasis: true,
      render: (price) => dayjs(price.effectiveFrom).format("MMM D, YYYY"),
    },
    {
      header: "Effective to",
      render: (price) =>
        price.effectiveTo ? dayjs(price.effectiveTo).format("MMM D, YYYY") : "Open-ended",
    },
    { header: "Buy price", align: "right", render: (price) => <MoneyText value={price.buyPrice} /> },
    {
      header: "Sell price",
      align: "right",
      render: (price) => <MoneyText value={price.sellPrice} emphasis />,
    },
    {
      header: "Margin",
      align: "right",
      render: (price) => <MoneyText value={price.sellPrice - price.buyPrice} />,
    },
    {
      header: "",
      render: (price) =>
        isCurrent(price) ? (
          <Badge color="teal" variant="light" radius="sm">
            Current
          </Badge>
        ) : null,
    },
    { header: "Note", render: (price) => price.note ?? "—" },
  ];
}
