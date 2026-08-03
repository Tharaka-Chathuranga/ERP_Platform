import { Badge, Card, Group, Text } from "@mantine/core";
import dayjs from "dayjs";
import { DataTable, DefinitionList, TableToolbar, type Column, type Definition } from "@ui/data";
import type { Receival, ReceivalItem } from "@core/types";
import { useItemLabels } from "@core/hooks/useLookups";
import type { GoodsReceipt, Supplier } from "@core/types";

interface ReceivalDetailCardProps {
  receival: Receival;
  suppliers?: Supplier[];
  grn?: GoodsReceipt;
  search: string;
  onSearchChange: (value: string) => void;
}

export function ReceivalDetailCard({ receival, suppliers, grn, search, onSearchChange }: ReceivalDetailCardProps) {
  const itemLabel = useItemLabels();

  const lineColumns: Column<ReceivalItem>[] = [
    { header: "Item", emphasis: true, render: (l) => itemLabel(l.itemId) },
    { header: "Quantity", render: (l) => l.quantity },
    { header: "Unit cost", render: (l) => l.unitCost ?? "—" },
  ];

  const supplier = receival.supplierId
    ? suppliers?.find((s) => s.id === receival.supplierId)
    : undefined;
  const supplierDisplay = supplier ? `${supplier.code} — ${supplier.name}` : receival.supplierName;

  const fields: Definition[] = [
    {
      label: "Supplier",
      value: (
        <Group gap="xs">
          <span>{supplierDisplay}</span>
          {!receival.supplierId && receival.supplierName && (
            <Badge size="xs" variant="light" color="gray">
              Unregistered
            </Badge>
          )}
        </Group>
      ),
    },
    { label: "PO number", value: receival.poNumber },
    { label: "Invoice", value: receival.invoiceNumber },
    { label: "Received", value: dayjs(receival.receivedAt).format("YYYY-MM-DD HH:mm") },
    ...(receival.poNumber
      ? [{ label: "All received for PO", value: receival.allReceivedForPo ? "Yes" : "No" }]
      : []),
    {
      label: "GRN",
      value: receival.goodReceiveNoteId ? (
        grn ? (
          <Badge variant="light" color="green">
            {grn.grnNumber}
          </Badge>
        ) : (
          "Generated"
        )
      ) : (
        <Badge variant="light" color="yellow">
          Pending — PO not yet complete
        </Badge>
      ),
    },
  ];

  return (
    <>
      <Card withBorder radius="md" padding="lg" mb="lg">
        <DefinitionList items={fields} />
      </Card>

      <Card withBorder radius="md" padding="lg">
        <Text fw={600} mb="sm">
          Lines
        </Text>
        <TableToolbar search={{ value: search, onChange: onSearchChange, placeholder: "Search item…" }} />
        <DataTable
          withCard={false}
          columns={lineColumns}
          data={receival.lines.filter(l => { const term = search.trim().toLowerCase(); return !term || itemLabel(l.itemId).toLowerCase().includes(term); })}
          rowKey={(l) => l.id}
        />
      </Card>
    </>
  );
}
