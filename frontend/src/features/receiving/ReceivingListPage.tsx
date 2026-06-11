import { Button, Card, Loader, Table } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { listGoodsReceipts } from "../../api/store/receiving";

export function ReceivingListPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["grns"], queryFn: () => listGoodsReceipts() });

  return (
    <div>
      <PageHeader
        title="Receiving"
        subtitle="Goods receipts (GRN) — record stock arriving from suppliers"
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={() => navigate("/receiving/new")}>
            New goods receipt
          </Button>
        }
      />

      <Card withBorder radius="md" padding="lg">
        {isLoading ? (
          <Loader />
        ) : !data || data.content.length === 0 ? (
          <EmptyState
            title="No goods receipts yet"
            description="Create a GRN to record items arriving into the store."
            action={
              <Button variant="light" onClick={() => navigate("/receiving/new")}>
                New goods receipt
              </Button>
            }
          />
        ) : (
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>GRN №</Table.Th>
                <Table.Th>PO №</Table.Th>
                <Table.Th>Invoice</Table.Th>
                <Table.Th>Lines</Table.Th>
                <Table.Th>Received</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.content.map((g) => (
                <Table.Tr
                  key={g.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/receiving/${g.id}`)}
                >
                  <Table.Td fw={600}>{g.grnNumber}</Table.Td>
                  <Table.Td>{g.poNumber || "—"}</Table.Td>
                  <Table.Td>{g.invoiceNumber || "—"}</Table.Td>
                  <Table.Td>{g.lines.length}</Table.Td>
                  <Table.Td>{g.receivedAt ? dayjs(g.receivedAt).format("YYYY-MM-DD") : "—"}</Table.Td>
                  <Table.Td>
                    <StatusBadge status={g.status} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
