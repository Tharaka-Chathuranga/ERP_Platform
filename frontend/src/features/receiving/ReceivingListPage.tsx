import { useMemo } from "react";
import { Badge, Button, Card, Loader, Table } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { listReceivals } from "../../api/store/receiving";
import { listSuppliers } from "../../api/store/suppliers";

export function ReceivingListPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["receivals"], queryFn: () => listReceivals() });
  const suppliers = useQuery({ queryKey: ["suppliers"], queryFn: listSuppliers });

  const supplierName = useMemo(() => {
    const map = new Map(suppliers.data?.map((s) => [s.id, `${s.code} — ${s.name}`]));
    return (id?: string, name?: string) => (id ? map.get(id) ?? id.slice(0, 8) : name ?? "—");
  }, [suppliers.data]);

  return (
    <div>
      <PageHeader
        title="Receiving"
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={() => navigate("/receiving/new")}>
            New item receival
          </Button>
        }
      />

      <Card withBorder radius="md" padding="lg">
        {isLoading ? (
          <Loader />
        ) : !data || data.content.length === 0 ? (
          <EmptyState
            title="No receivals yet"
            description="Receive items into the store — stock is updated immediately and a GRN is generated automatically."
            action={
              <Button variant="light" onClick={() => navigate("/receiving/new")}>
                New item receival
              </Button>
            }
          />
        ) : (
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Receival №</Table.Th>
                <Table.Th>Supplier</Table.Th>
                <Table.Th>PO №</Table.Th>
                <Table.Th>Invoice</Table.Th>
                <Table.Th>Lines</Table.Th>
                <Table.Th>Received</Table.Th>
                <Table.Th>GRN</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.content.map((r) => (
                <Table.Tr
                  key={r.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/receiving/${r.id}`)}
                >
                  <Table.Td fw={600}>{r.receivalNumber}</Table.Td>
                  <Table.Td>
                    {supplierName(r.supplierId, r.supplierName)}
                    {!r.supplierId && r.supplierName && (
                      <Badge ml="xs" size="xs" variant="light" color="gray">
                        Unregistered
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>{r.poNumber || "—"}</Table.Td>
                  <Table.Td>{r.invoiceNumber || "—"}</Table.Td>
                  <Table.Td>{r.lines.length}</Table.Td>
                  <Table.Td>{dayjs(r.receivedAt).format("YYYY-MM-DD")}</Table.Td>
                  <Table.Td>
                    {r.goodReceiveNoteId ? (
                      <Badge size="sm" variant="light" color="green">
                        Generated
                      </Badge>
                    ) : (
                      <Badge size="sm" variant="light" color="yellow">
                        Pending
                      </Badge>
                    )}
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
