import dayjs from "dayjs";
import type { Column } from "@ui/data";
import { StackedCell } from "@ui/data";
import type { OilMartSale } from "@core/types";
import { OilMartStatusBadge } from "../../../../components/oil-mart-status-badge";
import { MoneyText } from "../../../../components/money-text";

export function buildOilMartClientSalesColumns(): Column<OilMartSale>[] {
  return [
    {
      header: "Sale",
      emphasis: true,
      render: (sale) => (
        <StackedCell
          primary={sale.saleNo}
          secondary={`${sale.lines.length} line${sale.lines.length === 1 ? "" : "s"}`}
        />
      ),
    },
    { header: "Status", render: (sale) => <OilMartStatusBadge status={sale.status} /> },
    { header: "Quoted", render: (sale) => dayjs(sale.quotedAt).format("MMM D, YYYY") },
    {
      header: "Invoice",
      render: (sale) => sale.invoiceNo ?? "—",
    },
    { header: "Total", align: "right", render: (sale) => <MoneyText value={sale.total} emphasis /> },
  ];
}
