import dayjs from "dayjs";
import type { Column } from "@ui/data";
import { StackedCell } from "@ui/data";
import type { OilMartQuotation } from "@core/types";
import { OilMartStatusBadge } from "../../../../components/oil-mart-status-badge";
import { MoneyText } from "../../../../components/money-text";

export function buildOilMartClientQuotationsColumns(): Column<OilMartQuotation>[] {
  return [
    {
      header: "Quotation",
      emphasis: true,
      render: (quotation) => (
        <StackedCell
          primary={quotation.quotationNo}
          secondary={`${quotation.lines.length} line${quotation.lines.length === 1 ? "" : "s"}`}
        />
      ),
    },
    { header: "Status", render: (quotation) => <OilMartStatusBadge status={quotation.status} /> },
    {
      header: "Issued",
      render: (quotation) => dayjs(quotation.issuedDate).format("MMM D, YYYY"),
    },
    {
      header: "Valid until",
      render: (quotation) => (
        <StackedCell
          primary={dayjs(quotation.validUntil).format("MMM D, YYYY")}
          secondary={quotation.expired ? "Expired" : undefined}
        />
      ),
    },
    {
      header: "Grand total",
      align: "right",
      render: (quotation) => <MoneyText value={quotation.grandTotal} emphasis />,
    },
  ];
}
