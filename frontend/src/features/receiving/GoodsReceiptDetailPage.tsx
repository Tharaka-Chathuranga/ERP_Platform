import { Button, Card, Group, Loader, SimpleGrid, Table, Text } from "@mantine/core";
import { IconArrowLeft, IconCircleCheck } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../auth/AuthContext";
import { useItemLabels } from "../../hooks/useLookups";
import { getGoodsReceipt, postGoodsReceipt } from "../../api/store/receiving";
import { notifyError, notifySuccess } from "../../lib/notify";

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

export function GoodsReceiptDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isAdmin } = useAuth();
  const itemLabel = useItemLabels();

  const { data: grn, isLoading } = useQuery({
    queryKey: ["grn", id],
    queryFn: () => getGoodsReceipt(id),
  });

  const post = useMutation({
    mutationFn: () => postGoodsReceipt(id),
    onSuccess: () => {
      notifySuccess("Goods receipt posted to stock");
      qc.invalidateQueries({ queryKey: ["grn", id] });
      qc.invalidateQueries({ queryKey: ["grns"] });
    },
    onError: notifyError,
  });

  if (isLoading) return <Loader />;
  if (!grn) return <Text>Not found.</Text>;

  return (
    <div>
      <PageHeader
        title={grn.grnNumber}
        subtitle="Goods receipt"
        actions={
          <Group>
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate("/receiving")}
            >
              Back
            </Button>
            {isAdmin && grn.status === "DRAFT" && (
              <Button
                color="green"
                leftSection={<IconCircleCheck size={16} />}
                loading={post.isPending}
                onClick={() => post.mutate()}
              >
                Post to stock
              </Button>
            )}
          </Group>
        }
      />

      <Card withBorder radius="md" padding="lg" mb="lg">
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          <Field label="Status" value={<StatusBadge status={grn.status} />} />
          <Field label="PO number" value={grn.poNumber} />
          <Field label="Invoice" value={grn.invoiceNumber} />
          <Field
            label="Received"
            value={grn.receivedAt ? dayjs(grn.receivedAt).format("YYYY-MM-DD HH:mm") : "—"}
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
            {grn.lines.map((l) => (
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
