import { useState } from "react";
import { Button, Card, Grid, Loader, Table, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { EmptyState } from "@ui/feedback/EmptyState";
import { useItemLabels } from "@core/hooks/useLookups";
import { listSupplierItems, listSuppliers } from "@store/inventory/suppliers.api";
import type { Supplier } from "@core/types";

export function SuppliersPage() {
  const navigate = useNavigate();
  const itemLabel = useItemLabels();
  const [selected, setSelected] = useState<Supplier | null>(null);

  const suppliers = useQuery({ queryKey: ["suppliers"], queryFn: listSuppliers });
  const supplierItems = useQuery({
    queryKey: ["supplierItems", selected?.id],
    queryFn: () => listSupplierItems(selected!.id),
    enabled: !!selected,
  });

  return (
    <div>
      <PageHeader
        title="Suppliers"
        actions={
          <Button
            variant="default"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/store")}
          >
            Back to items
          </Button>
        }
      />

      <Grid align="flex-start">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" padding="lg">
            {suppliers.isLoading ? (
              <Loader />
            ) : !suppliers.data || suppliers.data.length === 0 ? (
              <EmptyState title="No suppliers" />
            ) : (
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Code</Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {suppliers.data.map((s) => (
                    <Table.Tr
                      key={s.id}
                      bg={selected?.id === s.id ? "var(--mantine-color-brand-0)" : undefined}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelected(s)}
                    >
                      <Table.Td fw={600}>{s.code}</Table.Td>
                      <Table.Td>{s.name}</Table.Td>
                      <Table.Td>
                        <StatusBadge status={s.status} />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" padding="lg">
            {!selected ? (
              <Text c="dimmed">Select a supplier to see its items.</Text>
            ) : (
              <>
                <Text fw={600} mb="sm">
                  {selected.name} — supplied items
                </Text>
                {supplierItems.isLoading ? (
                  <Loader />
                ) : !supplierItems.data || supplierItems.data.length === 0 ? (
                  <Text c="dimmed" size="sm">
                    No items linked.
                  </Text>
                ) : (
                  <Table fz="sm">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Item</Table.Th>
                        <Table.Th>Supplier SKU</Table.Th>
                        <Table.Th>Lead days</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {supplierItems.data.map((si) => (
                        <Table.Tr key={si.id}>
                          <Table.Td>{itemLabel(si.itemId)}</Table.Td>
                          <Table.Td>{si.supplierSku || "—"}</Table.Td>
                          <Table.Td>{si.leadTimeDays ?? "—"}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}
              </>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
}
