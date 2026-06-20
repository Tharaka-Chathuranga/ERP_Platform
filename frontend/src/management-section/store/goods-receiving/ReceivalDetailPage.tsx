import { useState } from "react";
import { Badge, Button, Card, Group, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { DataTable, DefinitionList, TableToolbar, type Column, type Definition } from "@ui/data";
import type { ReceivalItem } from "@core/types";
import { useItemLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { getGoodsReceipt, getReceival } from "@store/goods-receiving/receiving.api";
import { listSuppliers } from "@store/inventory/suppliers.api";

export function ReceivalDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const itemLabel = useItemLabels();

  const { data: receival, isLoading, error } = useQuery({
    queryKey: qk.receival(id),
    queryFn: () => getReceival(id),
  });
  const suppliers = useQuery({ queryKey: qk.suppliers(), queryFn: listSuppliers });
  const grn = useQuery({
    queryKey: qk.goodsReceipt(receival?.goodReceiveNoteId ?? ""),
    queryFn: () => getGoodsReceipt(receival!.goodReceiveNoteId!),
    enabled: !!receival?.goodReceiveNoteId,
  });

  const lineColumns: Column<ReceivalItem>[] = [
    { header: "Item", emphasis: true, render: (l) => itemLabel(l.itemId) },
    { header: "Quantity", render: (l) => l.quantity },
    { header: "Unit cost", render: (l) => l.unitCost ?? "—" },
  ];

  const supplier = receival?.supplierId
    ? suppliers.data?.find((s) => s.id === receival.supplierId)
    : undefined;
  const supplierDisplay = supplier ? `${supplier.code} — ${supplier.name}` : receival?.supplierName;

  const fields: Definition[] = receival
    ? [
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
            grn.data ? (
              <Badge variant="light" color="green">
                {grn.data.grnNumber}
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
      ]
    : [];

  return (
    <div>
      <PageHeader
        title={receival?.receivalNumber ?? "Receival"}
        actions={
          <Button
            variant="default"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/receiving")}
          >
            Back
          </Button>
        }
      />

      <QueryBoundary
        loading={isLoading}
        error={error}
        isEmpty={!receival}
        empty={<Text>Not found.</Text>}
      >
        {receival && (
          <>
            <Card withBorder radius="md" padding="lg" mb="lg">
              <DefinitionList items={fields} />
            </Card>

            <Card withBorder radius="md" padding="lg">
              <Text fw={600} mb="sm">
                Lines
              </Text>
              <TableToolbar search={{ value: search, onChange: setSearch, placeholder: "Search item…" }} />
              <DataTable
                withCard={false}
                columns={lineColumns}
                data={receival.lines.filter(l => { const term = search.trim().toLowerCase(); return !term || itemLabel(l.itemId).toLowerCase().includes(term); })}
                rowKey={(l) => l.id}
              />
            </Card>
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
