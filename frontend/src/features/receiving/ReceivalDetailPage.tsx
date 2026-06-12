import { Badge, Button, Card, Group, Loader, SimpleGrid, Table, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "../../components/PageHeader";
import { useItemLabels } from "../../hooks/useLookups";
import { getGoodsReceipt, getReceival } from "../../api/store/receiving";
import { listSuppliers } from "../../api/store/suppliers";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text>{value || "—"}</Text>
    </div>
  );
}

export function ReceivalDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const itemLabel = useItemLabels();

  const { data: receival, isLoading } = useQuery({
    queryKey: ["receival", id],
    queryFn: () => getReceival(id),
  });
  const suppliers = useQuery({ queryKey: ["suppliers"], queryFn: listSuppliers });
  const grn = useQuery({
    queryKey: ["grn", receival?.goodReceiveNoteId],
    queryFn: () => getGoodsReceipt(receival!.goodReceiveNoteId!),
    enabled: !!receival?.goodReceiveNoteId,
  });

  if (isLoading) return <Loader />;
  if (!receival) return <Text>Not found.</Text>;

  const supplier = receival.supplierId
    ? suppliers.data?.find((s) => s.id === receival.supplierId)
    : undefined;
  const supplierDisplay = supplier ? `${supplier.code} — ${supplier.name}` : receival.supplierName;

  return (
    <div>
      <PageHeader
        title={receival.receivalNumber}
        subtitle="Item receival"
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

      <Card withBorder radius="md" padding="lg" mb="lg">
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          <Field
            label="Supplier"
            value={
              <Group gap="xs">
                <span>{supplierDisplay}</span>
                {!receival.supplierId && receival.supplierName && (
                  <Badge size="xs" variant="light" color="gray">
                    Unregistered
                  </Badge>
                )}
              </Group>
            }
          />
          <Field label="PO number" value={receival.poNumber} />
          <Field label="Invoice" value={receival.invoiceNumber} />
          <Field
            label="Received"
            value={dayjs(receival.receivedAt).format("YYYY-MM-DD HH:mm")}
          />
          {receival.poNumber && (
            <Field
              label="All received for PO"
              value={receival.allReceivedForPo ? "Yes" : "No"}
            />
          )}
          <Field
            label="GRN"
            value={
              receival.goodReceiveNoteId ? (
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
              )
            }
          />
        </SimpleGrid>
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
    </div>
  );
}
