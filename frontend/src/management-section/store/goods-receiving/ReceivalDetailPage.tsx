import { Badge, Button, Card, Group, Table, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { DefinitionList, type Definition } from "@ui/data/DefinitionList";
import { useItemLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { getGoodsReceipt, getReceival } from "@store/goods-receiving/receiving.api";
import { listSuppliers } from "@store/inventory/suppliers.api";

export function ReceivalDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
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
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Item</Table.Th>
                    <Table.Th>Quantity</Table.Th>
                    <Table.Th>Unit cost</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {receival.lines.map((l) => (
                    <Table.Tr key={l.id}>
                      <Table.Td>{itemLabel(l.itemId)}</Table.Td>
                      <Table.Td>{l.quantity}</Table.Td>
                      <Table.Td>{l.unitCost ?? "—"}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
