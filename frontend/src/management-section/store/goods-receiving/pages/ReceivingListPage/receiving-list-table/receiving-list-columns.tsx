import { Badge } from "@mantine/core";
import dayjs from "dayjs";
import type { Column } from "@ui/data/DataTable";
import type { Receival } from "@core/types";

interface ReceivingListColumnsOptions {
  supplierName: (id?: string, name?: string) => string;
}

export function buildReceivingListColumns({ supplierName }: ReceivingListColumnsOptions): Column<Receival>[] {
  return [
    { header: "Receival №", emphasis: true, render: (r) => r.receivalNumber },
    {
      header: "Supplier",
      render: (r) => (
        <>
          {supplierName(r.supplierId, r.supplierName)}
          {!r.supplierId && r.supplierName && (
            <Badge ml="xs" size="xs" variant="light" color="gray">
              Unregistered
            </Badge>
          )}
        </>
      ),
    },
    { header: "PO №", render: (r) => r.poNumber || "—" },
    { header: "Invoice", render: (r) => r.invoiceNumber || "—" },
    { header: "Lines", render: (r) => r.lines.length },
    { header: "Received", render: (r) => dayjs(r.receivedAt).format("YYYY-MM-DD") },
    {
      header: "GRN",
      render: (r) =>
        r.goodReceiveNoteId ? (
          <Badge size="sm" variant="light" color="green">
            Generated
          </Badge>
        ) : (
          <Badge size="sm" variant="light" color="yellow">
            Pending
          </Badge>
        ),
    },
  ];
}
